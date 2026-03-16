package com.techflow.erp.service;

import com.techflow.erp.constant.Role;
import com.techflow.erp.dto.response.EmployeeResponse;
import com.techflow.erp.entity.Employee;
import com.techflow.erp.entity.User;
import com.techflow.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ALLOWED_DOMAIN = "@techflow.com";

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAllWithUser().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Angajatul cu ID-ul " + id + " nu a fost găsit."));

        employee.setDeleted(true);

        if (employee.getUser() != null) {
            employee.getUser().setActive(false);
        }

        employeeRepository.save(employee);
    }

    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        return mapToResponse(employee);
    }

    @Transactional
    public EmployeeResponse addEmployee(Employee employee) {
        validateEmailDomain(employee.getEmail());

        if (employee.getUser() == null) {
            User newUser = createAutomaticUser(employee.getEmail());
            employee.setUser(newUser);
        }

        if (employee.getUser() != null) {
            employee.setRole(employee.getUser().getRole().name());
        }

        calculateLeaveDays(employee);

        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, Employee empDetails) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        // 1. Validare email și update User Email
        if (empDetails.getEmail() != null) {
            validateEmailDomain(empDetails.getEmail());
            if (employee.getUser() != null) {
                employee.getUser().setEmail(empDetails.getEmail());
            }
        }

        // 2. ACTUALIZARE ROL (Sincronizare cu tabelul Users)
        if (empDetails.getRole() != null && employee.getUser() != null) {
            try {
                Role newRole = Role.valueOf(empDetails.getRole());
                employee.getUser().setRole(newRole);
                // Sincronizăm și câmpul transient role pentru calculateLeaveDays
                employee.setRole(newRole.name());
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid role received: " + empDetails.getRole());
            }
        } else if (employee.getUser() != null) {
            // Dacă nu primim rol nou în empDetails, ne asigurăm că cel existent e setat în câmpul transient pentru calcul
            employee.setRole(employee.getUser().getRole().name());
        }

        // 3. Actualizare câmpuri de bază
        employee.setFirstName(empDetails.getFirstName());
        employee.setLastName(empDetails.getLastName());
        employee.setPosition(empDetails.getPosition());
        employee.setSalary(empDetails.getSalary());
        employee.setPhone(empDetails.getPhone());

        if (empDetails.getHireDate() != null) {
            employee.setHireDate(empDetails.getHireDate());
        }

        if (empDetails.getDepartment() != null) {
            employee.setDepartment(empDetails.getDepartment());
        }

        // 4. RECALCULARE ZILE CONCEDIU
        // Apelăm metoda chiar înainte de salvare pentru a reflecta orice schimbare de rol sau hireDate
        calculateLeaveDays(employee);

        Employee updated = employeeRepository.save(employee);
        return mapToResponse(updated);
    }

    public Employee findByEmail(String email) {
        // Căutăm angajatul pornind de la user-ul care are acel email
        return employeeRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Profilul nu a fost găsit pentru email: " + email));
    }

    @Transactional
    public Employee updateOwnProfile(String email, Employee updatedData) {
        Employee existingEmployee = findByEmail(email);
        User currentUser = existingEmployee.getUser();

        // 1. Update Telefon (din Employee)
        if (updatedData.getPhone() != null) {
            existingEmployee.setPhone(updatedData.getPhone());
        }

        // 2. Update Parolă (din User)
        if (updatedData.getUser() != null) {
            User userUpdate = updatedData.getUser();

            if (userUpdate.getPassword() != null && !userUpdate.getPassword().isEmpty()) {
                // Setăm parola nouă criptată
                currentUser.setPassword(passwordEncoder.encode(userUpdate.getPassword()));

                // Foarte important: Ștergem parola temporară pentru a marca procesul de schimbare ca finalizat
                currentUser.setTempPasswordPlain(null);
            }
        }

        return employeeRepository.save(existingEmployee);
    }

    // --- METODE HELPER (Private) ---

    private void validateEmailDomain(String email) {
        if (email == null || !email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
            throw new IllegalArgumentException("Identity Error: Email must belong to " + ALLOWED_DOMAIN);
        }
    }

    private User createAutomaticUser(String email) { // Am scos outPassword ca nu mai avem nevoie de artificiul ala
        User user = new User();
        user.setEmail(email);

        String tempPass = UUID.randomUUID().toString().substring(0, 10);

        user.setPassword(passwordEncoder.encode(tempPass));
        user.setTempPasswordPlain(tempPass); // <--- O salvăm în noua coloană

        user.setRole(Role.EMPLOYEE);
        user.setActive(true);
        user.setNeedsPasswordChange(true);

        return user;
    }

    private EmployeeResponse mapToResponse(Employee emp) {
        String email = Optional.ofNullable(emp.getUser())
                .map(User::getEmail)
                .orElse(emp.getEmail() != null ? emp.getEmail() : "no-email" + ALLOWED_DOMAIN);

        String currentRole = Optional.ofNullable(emp.getUser())
                .map(u -> u.getRole().name())
                .orElse("EMPLOYEE");

        String tempPass = Optional.ofNullable(emp.getUser())
                .map(User::getTempPasswordPlain)
                .orElse(null);

        return new EmployeeResponse(
                emp.getId(),
                emp.getFirstName(),
                emp.getLastName(),
                email,
                emp.getPosition(),
                emp.getSalary(),
                emp.getPhone(),
                emp.getDepartment() != null ? emp.getDepartment().getName() : "No Department",
                emp.getHireDate() != null ? emp.getHireDate().toString() : null,
                currentRole,
                tempPass,
                emp.isDeleted()
        );
    }

    @Transactional
    public Employee restoreEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setDeleted(false);

        if (employee.getUser() != null) {
            employee.getUser().setActive(true);
        }

        return employeeRepository.save(employee);
    }

    private void calculateLeaveDays(Employee employee) {
        // 1. Dacă e ADMIN, nu are zile de concediu (0)
        if ("ADMIN".equalsIgnoreCase(employee.getRole())) {
            employee.setTotalLeaveDays(0);
            employee.setRemainingLeaveDays(0);
            return;
        }

        // 2. Baza: 21 zile
        int baseDays = 21;

        // 3. Bonus de Rol: MANAGER (+2 zile)
        if ("MANAGER".equalsIgnoreCase(employee.getRole())) {
            baseDays += 2;
        }

        // 4. Bonus de Vechime (+1 zi pentru fiecare an întreg lucrat)
        int seniorityBonus = 0;
        if (employee.getHireDate() != null) {
            seniorityBonus = Period.between(employee.getHireDate(), LocalDate.now()).getYears();
        }

        // 5. Calcul Total și Plafonare la 28 de zile
        int total = Math.min(baseDays + seniorityBonus, 28);

        employee.setTotalLeaveDays(total);

        if (employee.getRemainingLeaveDays() == null || employee.getRemainingLeaveDays() == 0) {
            employee.setRemainingLeaveDays(total);
        }
    }
}