package com.techflow.erp.controller;

import com.techflow.erp.dto.response.EmployeeResponse;
import com.techflow.erp.entity.Employee;
import com.techflow.erp.repository.EmployeeRepository;
import com.techflow.erp.service.EmployeeService;
import com.techflow.erp.service.LeaveCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final LeaveCalculationService leaveCalculationService;

    @GetMapping
    public List<EmployeeResponse> getEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> addEmployee(@RequestBody Employee employee) {
        EmployeeResponse newEmployeeResponse = employeeService.addEmployee(employee);
        return new ResponseEntity<>(newEmployeeResponse, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        EmployeeResponse updatedEmployee = employeeService.updateEmployee(id, employeeDetails);
        return ResponseEntity.ok(updatedEmployee);
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Employee> restoreEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.restoreEmployee(id));
    }

    @GetMapping("/me/{email}")
    public ResponseEntity<Employee> getMyProfile(@PathVariable String email) {
        return ResponseEntity.ok(employeeService.findByEmail(email));
    }

    @PutMapping("/me/update/{email}")
    public ResponseEntity<Employee> updateMyProfile(@PathVariable String email, @RequestBody Employee updatedData) {
        return ResponseEntity.ok(employeeService.updateOwnProfile(email, updatedData));
    }
}