package com.techflow.erp.repository;
import com.techflow.erp.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.user")
    List<Employee> findAllWithUser();
}