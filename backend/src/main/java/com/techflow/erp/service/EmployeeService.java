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
@RequiredArgsConstructor // Acesta generează constructorul pentru câmpurile final
public class EmployeeService {

    // Am scos @Autowired și am lăsat final (Lombok face injecția prin constructor acum)
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    // AM ȘTERS constructorul manual care se bătea cu @RequiredArgsConstructor (de aici era eroarea cu roșu)

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAllWithUser().stream()
                .map(emp -> new EmployeeResponse(
                        emp.getId(),
                        emp.getFirstName(),
                        emp.getLastName(),
                        (emp.getUser() != null && emp.getUser().getEmail() != null)
                                ? emp.getUser().getEmail()
                                : "no-email@techflow.com",
                        emp.getPosition(),
                        emp.getSalary(),
                        emp.getPhone()
                ))
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
        if (employee.getUser() == null) {
            User newUser = new User();
            newUser.setEmail(employee.getEmail());

            // FIX: Generăm și criptăm o parolă random pentru a respecta NOT NULL în DB
            String rawPassword = UUID.randomUUID().toString();
            newUser.setPassword(passwordEncoder.encode(rawPassword));

            newUser.setRole(Role.EMPLOYEE);
            newUser.setActive(true);

            employee.setUser(newUser);
        } else if (employee.getUser().getEmail() == null && employee.getEmail() != null) {
            employee.getUser().setEmail(employee.getEmail());

            // Siguranță: dacă user-ul vine fără parolă, îi punem una
            if (employee.getUser().getPassword() == null) {
                employee.getUser().setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            }
        }

        return employeeRepository.save(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, Employee empDetails) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setFirstName(empDetails.getFirstName());
        employee.setLastName(empDetails.getLastName());
        employee.setPosition(empDetails.getPosition());
        employee.setSalary(empDetails.getSalary());

        if (employee.getUser() != null && empDetails.getEmail() != null) {
            employee.getUser().setEmail(empDetails.getEmail());
        }

        Employee updated = employeeRepository.save(employee);

        return new EmployeeResponse(
                updated.getId(),
                updated.getFirstName(),
                updated.getLastName(),
                updated.getUser() != null ? updated.getUser().getEmail() : "no-email",
                updated.getPosition(),
                updated.getSalary(),
                updated.getPhone()
        );
    }
}