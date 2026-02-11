package com.techflow.erp.config;

import com.techflow.erp.constant.Role;
import com.techflow.erp.entity.Employee;
import com.techflow.erp.entity.User;
import com.techflow.erp.repository.EmployeeRepository;
import com.techflow.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // 1. MANAGER
            User mUser = new User();
            mUser.setEmail("admin@techflow.com");
            mUser.setPassword(passwordEncoder.encode("admin123"));
            mUser.setRole(Role.MANAGER);
            // SALVĂM USERUL ÎNTÂI
            User savedManager = userRepository.save(mUser);

            Employee managerEmp = new Employee();
            managerEmp.setUser(savedManager); // Atribuim userul salvat (care are ID acum)
            managerEmp.setFirstName("John");
            managerEmp.setLastName("Doe");
            managerEmp.setPosition("CEO");
            managerEmp.setSalary(new BigDecimal("15000"));
            managerEmp.setHireDate(LocalDate.now());
            employeeRepository.save(managerEmp);

            // 2. EMPLOYEE
            User eUser = new User();
            eUser.setEmail("worker@techflow.com");
            eUser.setPassword(passwordEncoder.encode("worker123"));
            eUser.setRole(Role.EMPLOYEE);
            // SALVĂM USERUL ÎNTÂI
            User savedWorker = userRepository.save(eUser);

            Employee workerEmp = new Employee();
            workerEmp.setUser(savedWorker);
            workerEmp.setFirstName("Alice");
            workerEmp.setLastName("Smith");
            workerEmp.setPosition("Dev");
            workerEmp.setSalary(new BigDecimal("8000"));
            workerEmp.setHireDate(LocalDate.now());
            employeeRepository.save(workerEmp);

            System.out.println("✅ Database seeded successfully!");
        }
    }
}