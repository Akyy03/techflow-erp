package com.techflow.erp.repository;
import com.techflow.erp.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EmployeeRepository extends JpaRepository<Employee, Long> { }