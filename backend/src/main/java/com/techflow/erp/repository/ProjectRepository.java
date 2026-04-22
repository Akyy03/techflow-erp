package com.techflow.erp.repository;

import com.techflow.erp.constant.ProjectStatus;
import com.techflow.erp.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Gasim proiectele create de un anumit utilizator (Manager/Admin)
    List<Project> findByCreatedById(Long userId);

    List<Project> findAllByDepartmentsId(Long departmentId);

    long countByStatus(ProjectStatus status);
}