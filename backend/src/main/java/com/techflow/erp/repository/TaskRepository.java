package com.techflow.erp.repository;

import com.techflow.erp.constant.TaskStatus;
import com.techflow.erp.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Toate task-urile dintr-un proiect
    List<Task> findByProjectId(Long projectId);

    // Toate task-urile asignate unui om (pentru "My Tasks")
    List<Task> findByAssignedToId(Long userId);

    // Numarul de task-uri dintr-un proiect cu un anumit status (ne ajuta la progres)
    long countByProjectIdAndStatus(Long projectId, TaskStatus status);

    // Numarul total de task-uri dintr-un proiect
    long countByProjectId(Long projectId);
}