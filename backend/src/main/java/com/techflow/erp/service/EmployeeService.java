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

    @Transactional
    public Employee addEmployee(Employee employee) {
        // 1. Validare Bulletproof pentru email
        validateEmailDomain(employee.getEmail());

        // 2. Logica de creare User (restrânsă pentru claritate)
        if (employee.getUser() == null) {
            User newUser = createAutomaticUser(employee.getEmail());
            employee.setUser(newUser);
        } else {
            employee.getUser().setEmail(employee.getEmail());
        }

        return employeeRepository.save(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, Employee empDetails) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        // 1. Validare email la update (dacă s-a schimbat)
        if (empDetails.getEmail() != null) {
            validateEmailDomain(empDetails.getEmail());
            if (employee.getUser() != null) {
                employee.getUser().setEmail(empDetails.getEmail());
            }
        }

        // 2. Actualizare câmpuri (folosind datele primite)
        employee.setFirstName(empDetails.getFirstName());
        employee.setLastName(empDetails.getLastName());
        employee.setPosition(empDetails.getPosition());
        employee.setSalary(empDetails.getSalary());
        employee.setPhone(empDetails.getPhone());
        employee.setHireDate(empDetails.getHireDate());

        Employee updated = employeeRepository.save(employee);
        return mapToResponse(updated);
    }

    // --- METODE HELPER (Private) ---

    private void validateEmailDomain(String email) {
        if (email == null || !email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
            throw new IllegalArgumentException("Identity Error: Email must belong to " + ALLOWED_DOMAIN);
        }
    }

    private User createAutomaticUser(String email) {
        User user = new User();
        user.setEmail(email);
        // Generăm o parolă random sigură - utilizatorul o poate reseta ulterior
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(Role.EMPLOYEE);
        user.setActive(true);
        return user;
    }

    private EmployeeResponse mapToResponse(Employee emp) {
        // Folosim Optional pentru a evita multiplele verificări de null
        String email = java.util.Optional.ofNullable(emp.getUser())
                .map(User::getEmail)
                .orElse("no-email" + ALLOWED_DOMAIN);

        return new EmployeeResponse(
                emp.getId(),
                emp.getFirstName(),
                emp.getLastName(),
                email,
                emp.getPosition(),
                emp.getSalary(),
                emp.getPhone()
        );
    }
}