package com.techflow.erp.service;

import com.techflow.erp.constant.TaskStatus;
import com.techflow.erp.dto.TaskDTO;
import com.techflow.erp.entity.Task;
import com.techflow.erp.entity.User;
import com.techflow.erp.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<TaskDTO> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TaskDTO convertToDTO(Task task) {
        String assignedName = "Unassigned";

        // Verificăm dacă task-ul are un user alocat și dacă acel user are profil de angajat
        User assignee = task.getAssignedTo();
        if (assignee != null) {
            if (assignee.getEmployee() != null) {
                assignedName = assignee.getEmployee().getFirstName() + " " + assignee.getEmployee().getLastName();
            } else {
                assignedName = assignee.getEmail(); // Fallback la email pentru admini
            }
        }

        return TaskDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .deadline(task.getDeadline())
                .assignedToName(assignedName)
                .build();
    }

    // Metodă utilă pentru update de status (necesară la Kanban Drag & Drop)
    public TaskDTO updateTaskStatus(Long taskId, String newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Aici va trebui să te asiguri că TaskStatus e un Enum (TODO, IN_PROGRESS, DONE)
        // task.setStatus(TaskStatus.valueOf(newStatus));

        return convertToDTO(taskRepository.save(task));
    }

    @Transactional
    public void updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(newStatus);
        taskRepository.save(task);
        // JpaRepository va face update automat
    }

}