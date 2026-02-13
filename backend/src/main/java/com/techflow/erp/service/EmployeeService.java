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
        // Dacă angajatul nu are un User asociat, îl creăm acum
        if (employee.getUser() == null) {
            User newUser = new User();
            newUser.setEmail(employee.getEmail());
            // Generăm o parolă random sigură
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setRole(Role.EMPLOYEE);
            newUser.setActive(true);
            employee.setUser(newUser);
        } else if (employee.getUser().getEmail() == null) {
            employee.getUser().setEmail(employee.getEmail());
        }

        return employeeRepository.save(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, Employee empDetails) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        // Actualizăm câmpurile de bază
        employee.setFirstName(empDetails.getFirstName());
        employee.setLastName(empDetails.getLastName());
        employee.setPosition(empDetails.getPosition());
        employee.setSalary(empDetails.getSalary());
        employee.setPhone(empDetails.getPhone());

        // Actualizăm email-ul în entitatea User asociată
        if (employee.getUser() != null && empDetails.getEmail() != null) {
            employee.getUser().setEmail(empDetails.getEmail());
        }

        Employee updated = employeeRepository.save(employee);
        return mapToResponse(updated);
    }

    private EmployeeResponse mapToResponse(Employee emp) {
        String email = (emp.getUser() != null && emp.getUser().getEmail() != null)
                ? emp.getUser().getEmail()
                : "no-email@techflow.com";

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