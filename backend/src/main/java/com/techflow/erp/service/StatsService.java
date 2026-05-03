package com.techflow.erp.service;

import com.techflow.erp.constant.LeaveStatus;
import com.techflow.erp.constant.ProjectStatus;
import com.techflow.erp.constant.TaskStatus;
import com.techflow.erp.dto.response.AdminStatsDTO;
import com.techflow.erp.repository.EmployeeRepository;
import com.techflow.erp.repository.LeaveRequestRepository;
import com.techflow.erp.repository.ProjectRepository;
import com.techflow.erp.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TaskRepository taskRepository;

    public AdminStatsDTO getAdminDashboardStats() {
        return new AdminStatsDTO(
                employeeRepository.countByIsDeletedFalse(),
                projectRepository.countByStatus(ProjectStatus.ACTIVE),
                leaveRequestRepository.countByStatus(LeaveStatus.PENDING),
                taskRepository.countByStatusNotAndDeadlineBefore(
                        TaskStatus.DONE,
                        LocalDate.now().plusDays(5)
                )
        );
    }

    public List<Map<String, Object>> getTaskStats(Long deptId) {
        List<Object[]> rawStats = taskRepository.countTaskStatsByTeam(deptId);

        return mapToResultList(rawStats);
    }

    public List<Map<String, Object>> getProjectStats(Long deptId) {
        List<Object[]> rawStats = projectRepository.countProjectStatsByDepartmentId(deptId);
        return mapToResultList(rawStats);
    }

    private List<Map<String, Object>> mapToResultList(List<Object[]> rawStats) {
        return rawStats.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0] != null ? row[0].toString() : "UNKNOWN");
            map.put("value", row[1]);
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getManagerStats(Long deptId) {
        Map<String, Object> stats = new HashMap<>();

        LocalDate today = LocalDate.now();
        LocalDate fiveDaysFromNow = today.plusDays(5);

        stats.put("totalEmployees", employeeRepository.countByDepartmentId(deptId));
        stats.put("activeProjects", projectRepository.countActiveProjectsByDepartmentId(deptId));
        stats.put("pendingLeaves", leaveRequestRepository.countPendingByDepartmentId(deptId));

        stats.put("urgentTasks", taskRepository.countUrgentTasksByDepartmentId(deptId, TaskStatus.DONE, fiveDaysFromNow));
        return stats;
    }
}