package com.techflow.erp.controller;

import com.techflow.erp.dto.response.EmployeeResponse;
import com.techflow.erp.entity.Employee;
import com.techflow.erp.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public List<EmployeeResponse> getEmployees() {
        return employeeService.getAllEmployees();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Employee> addEmployee(@RequestBody Employee employee) {
        Employee newEmployee = employeeService.addEmployee(employee);
        // Returnăm status 201 Created și obiectul salvat
        return new ResponseEntity<>(newEmployee, HttpStatus.CREATED);
    }
}