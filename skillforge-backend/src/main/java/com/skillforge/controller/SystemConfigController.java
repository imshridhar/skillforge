package com.skillforge.controller;

import com.skillforge.entity.SystemConfig;
import com.skillforge.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfig> getConfig() {
        return ResponseEntity.ok(systemConfigService.getConfig());
    }

    @PutMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfig> updateConfig(@RequestBody SystemConfig config) {
        return ResponseEntity.ok(systemConfigService.updateConfig(config));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        return ResponseEntity.ok(systemConfigService.getSystemStats());
    }

    @GetMapping("/alerts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAlerts() {
        return ResponseEntity.ok(systemConfigService.getSystemAlerts());
    }

    @PostMapping("/restart")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> restartServices() {
        // This is a safe stub for local/dev environments.
        return ResponseEntity.ok(Map.of("message", "Restart request received. Please restart services manually in development."));
    }
}
