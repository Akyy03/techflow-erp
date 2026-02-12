package com.techflow.erp.service;

import com.techflow.erp.dto.response.EmployeeResponse;
import com.techflow.erp.entity.Employee;
import com.techflow.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    @Autowired
    private final EmployeeRepository employeeRepository;

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(emp -> new EmployeeResponse(
                        emp.getId(),
                        emp.getFirstName(),
                        emp.getLastName(),
                        emp.getUser().getEmail(),
                        emp.getPosition(),
                        emp.getSalary()
                ))
                .collect(Collectors.toList());
    }

    public void deleteEmployee(Long id) {
        // Verificăm dacă există înainte de ștergere (opțional, dar recomandat)
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Angajatul cu ID-ul " + id + " nu a fost găsit.");
        }
        employeeRepository.deleteById(id);
    }

    public Employee addEmployee(Employee employee) {
        // Aici poți adăuga logica de business în viitor (ex: verificări, setări default)
        return employeeRepository.save(employee);
    }
}