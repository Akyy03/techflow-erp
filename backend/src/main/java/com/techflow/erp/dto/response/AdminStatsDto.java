package com.techflow.erp.dto.response;

public record AdminStatsDto(
        long totalEmployees,
        long activeProjects,
        long pendingLeaves,
        long urgentTasks
) {}