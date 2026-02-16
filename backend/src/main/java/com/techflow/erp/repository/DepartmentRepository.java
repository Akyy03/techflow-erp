package com.techflow.erp.repository;

import com.techflow.erp.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    // Putem adăuga mai târziu metode personalizate, ex: findByName
}