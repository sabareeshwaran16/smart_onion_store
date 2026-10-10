package com.vengai.controller;

import com.vengai.model.Alert;
import com.vengai.repository.AlertRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertRepository alertRepo;

    public AlertController(AlertRepository alertRepo) { this.alertRepo = alertRepo; }

    @GetMapping("")
    public ResponseEntity<List<Map<String, Object>>> getAlerts(
            @RequestParam(defaultValue = "false") boolean resolved,
            @RequestParam(defaultValue = "50") int limit) {
        var alerts = alertRepo.findByIsResolvedOrderByCreatedAtDesc(resolved, PageRequest.of(0, limit));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Alert a : alerts) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId()); m.put("alert_type", a.getAlertType()); m.put("severity", a.getSeverity());
            m.put("message", a.getMessage()); m.put("current_value", a.getCurrentValue());
            m.put("threshold_value", a.getThresholdValue()); m.put("recommendation", a.getRecommendation());
            m.put("batch_id", a.getBatchId()); m.put("device_id", a.getDeviceId());
            m.put("is_resolved", a.getIsResolved()); m.put("resolved_at", a.getResolvedAt()); m.put("created_at", a.getCreatedAt());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{alertId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveAlert(@PathVariable Long alertId) {
        Alert alert = alertRepo.findById(alertId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert " + alertId + " not found."));
        alert.setIsResolved(true);
        alert.setResolvedAt(OffsetDateTime.now(ZoneOffset.UTC));
        alertRepo.save(alert);
        return ResponseEntity.ok(Map.of("success", true, "message", "Alert #" + alertId + " (" + alert.getAlertType() + ") resolved."));
    }
}
