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

    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Angajatul cu ID-ul " + id + " nu a fost găsit.");
        }
        employeeRepository.deleteById(id);
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
                employee.getUser().setRole(Role.valueOf(empDetails.getRole()));
            } catch (IllegalArgumentException e) {
                // Dacă rolul trimis nu e valid în Enum, rămâne cel vechi sau dă eroare
                System.err.println("Invalid role received: " + empDetails.getRole());
            }
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

        Employee updated = employeeRepository.save(employee);
        return mapToResponse(updated);
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
                emp.getHireDate() != null ? emp.getHireDate().toString() : null, // Conversie LocalDate -> String
                currentRole,
                tempPass
        );
    }
}