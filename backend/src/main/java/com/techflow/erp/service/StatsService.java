package com.techflow.erp.service;

import com.techflow.erp.constant.LeaveStatus;
import com.techflow.erp.constant.ProjectStatus;
import com.techflow.erp.constant.TaskStatus;
import com.techflow.erp.dto.response.AdminStatsDto;
import com.techflow.erp.repository.EmployeeRepository;
import com.techflow.erp.repository.LeaveRequestRepository;
import com.techflow.erp.repository.ProjectRepository;
import com.techflow.erp.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TaskRepository taskRepository;

    public AdminStatsDto getAdminDashboardStats() {
        return new AdminStatsDto(
                employeeRepository.countByIsDeletedFalse(),
                projectRepository.countByStatus(ProjectStatus.ACTIVE),
                leaveRequestRepository.countByStatus(LeaveStatus.PENDING),
                taskRepository.countByStatusNotAndDeadlineBefore(
                        TaskStatus.DONE,
                        LocalDate.now().plusDays(5) // "Urgent" = Deadline în următoarele 3 zile
                )
        );
    }
}