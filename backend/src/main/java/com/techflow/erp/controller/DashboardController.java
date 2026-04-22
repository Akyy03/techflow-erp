package com.techflow.erp.controller;

import com.techflow.erp.dto.TaskDTO;
import com.techflow.erp.dto.response.AdminStatsDto;
import com.techflow.erp.entity.Task;
import com.techflow.erp.service.StatsService;
import com.techflow.erp.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final StatsService statsService;
    private final TaskService taskService;

    @GetMapping("/admin-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminStatsDto getAdminStats() {
        return statsService.getAdminDashboardStats();
    }

    @GetMapping("/recent-tasks")
    public ResponseEntity<List<TaskDTO>> getRecentTasks() {
        return ResponseEntity.ok(taskService.getRecentTasks());
    }

    @GetMapping("/task-stats")
    public ResponseEntity<List<Map<String, Object>>> getTaskStats() {
        return ResponseEntity.ok(taskService.getTaskStatistics());
    }
}