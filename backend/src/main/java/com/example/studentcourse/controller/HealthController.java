package com.example.studentcourse.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Slf4j
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        log.debug("Checking system health status...");
        Map<String, Object> healthInfo = new HashMap<>();
        
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", System.currentTimeMillis());
        
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                healthInfo.put("database", "UP");
                healthInfo.put("db_connection", "SUCCESS");
            } else {
                healthInfo.put("status", "DOWN");
                healthInfo.put("database", "DOWN");
            }
        } catch (Exception e) {
            log.error("Health check failed - Database connectivity issues: {}", e.getMessage());
            healthInfo.put("status", "DOWN");
            healthInfo.put("database", "DOWN");
            healthInfo.put("error", e.getMessage());
            return ResponseEntity.status(503).body(healthInfo);
        }
        
        return ResponseEntity.ok(healthInfo);
    }
}
