package com.techflow.erp.service;

import com.techflow.erp.dto.response.EmployeeResponse;
import com.techflow.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

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
}