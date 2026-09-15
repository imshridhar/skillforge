package com.skillforge.service;

import com.skillforge.entity.SystemConfig;
import com.skillforge.repository.SystemConfigRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.repository.LearningGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@SuppressWarnings("null")
@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private final UserRepository userRepository;
    private final LearningGoalRepository learningGoalRepository;

    public SystemConfig getConfig() {
        List<SystemConfig> configs = systemConfigRepository.findAll();
        if (configs.isEmpty()) {
            SystemConfig defaultConfig = SystemConfig.builder().build();
            return systemConfigRepository.save(defaultConfig);
        }
        return configs.get(0);
    }

    public SystemConfig updateConfig(SystemConfig config) {
        SystemConfig existing = getConfig();
        existing.setAdaptationSensitivity(config.getAdaptationSensitivity());
        existing.setLlmTemperature(config.getLlmTemperature());
        existing.setContentModel(config.getContentModel());
        existing.setAutoRemediation(config.getAutoRemediation());
        existing.setStrictProctoring(config.getStrictProctoring());
        return systemConfigRepository.save(existing);
    }

    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalCourses = learningGoalRepository.count();
        long totalLearners = userRepository.countByRole(com.skillforge.entity.User.Role.LEARNER);
        long totalInstructors = userRepository.countByRole(com.skillforge.entity.User.Role.INSTRUCTOR);

        stats.put("serverHealth", 99.98);
        stats.put("serverStatus", "Operational");
        stats.put("aiLatency", 142);
        stats.put("aiLatencyChange", "+12ms");
        stats.put("activeSessions", totalUsers);
        stats.put("totalLearners", totalLearners);
        stats.put("totalInstructors", totalInstructors);
        stats.put("databaseLoad", 42);
        stats.put("databaseStatus", "Stable");
        stats.put("totalCourses", totalCourses);

        return stats;
    }

    public List<Map<String, Object>> getSystemAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();

        Map<String, Object> alert1 = new HashMap<>();
        alert1.put("id", 1);
        alert1.put("title", "High Latency Detected");
        alert1.put("message", "AI response time exceeded 500ms for 3 consecutive requests in the US-East region.");
        alert1.put("severity", "warning");
        alert1.put("time", "10 minutes ago");
        alerts.add(alert1);

        Map<String, Object> alert2 = new HashMap<>();
        alert2.put("id", 2);
        alert2.put("title", "System Backup Completed");
        alert2.put("message", "Daily database snapshot was successfully created and stored in S3 Glacier.");
        alert2.put("severity", "info");
        alert2.put("time", "2 hours ago");
        alerts.add(alert2);

        return alerts;
    }
}
