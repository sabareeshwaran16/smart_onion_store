package com.vengai.controller;

import com.vengai.dto.FanControlRequest;
import com.vengai.model.Device;
import com.vengai.model.FanLog;
import com.vengai.repository.DeviceRepository;
import com.vengai.repository.FanLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/api/device")
public class DeviceController {

    @Value("${device.offline-timeout-seconds:300}")
    private int offlineTimeoutSeconds;

    private final DeviceRepository deviceRepo;
    private final FanLogRepository fanLogRepo;

    public DeviceController(DeviceRepository deviceRepo, FanLogRepository fanLogRepo) {
        this.deviceRepo = deviceRepo;
        this.fanLogRepo = fanLogRepo;
    }

    @GetMapping("/status")
    public ResponseEntity<List<Map<String, Object>>> status() {
        List<Device> devices = deviceRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        for (Device d : devices) {
            boolean online = d.getLastSeen() != null && now.minusSeconds(offlineTimeoutSeconds).isBefore(d.getLastSeen());
            if (!Objects.equals(d.getIsOnline(), online)) { d.setIsOnline(online); deviceRepo.save(d); }
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("device_id", d.getDeviceId()); m.put("name", d.getName()); m.put("location", d.getLocation());
            m.put("is_online", d.getIsOnline()); m.put("last_seen", d.getLastSeen());
            m.put("fan_status", d.getFanStatus()); m.put("buzzer_status", d.getBuzzerStatus()); m.put("wifi_signal", d.getWifiSignal());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/fan")
    public ResponseEntity<Map<String, Object>> controlFan(@RequestBody FanControlRequest req) {
        Device device = deviceRepo.findByDeviceId(req.getDeviceId())
            .orElseGet(() -> Device.builder().deviceId(req.getDeviceId()).name(req.getDeviceId()).build());
        device.setFanStatus(req.getStatus());
        deviceRepo.save(device);
        fanLogRepo.save(FanLog.builder().deviceId(req.getDeviceId()).status(req.getStatus()).reason(req.getReason()).triggeredBy(req.getTriggeredBy()).build());
        String state = Boolean.TRUE.equals(req.getStatus()) ? "ON" : "OFF";
        return ResponseEntity.ok(Map.of("success", true, "device_id", req.getDeviceId(), "fan_status", req.getStatus(), "reason", req.getReason(), "message", "Ventilation fan turned " + state + " for device " + req.getDeviceId() + "."));
    }

    @GetMapping("/fan/history")
    public ResponseEntity<List<Map<String, Object>>> fanHistory(
            @RequestParam(defaultValue = "ESP32_001") String device_id,
            @RequestParam(defaultValue = "50") int limit) {
        var logs = fanLogRepo.findByDeviceIdOrderByCreatedAtDesc(device_id, PageRequest.of(0, limit));
        List<Map<String, Object>> result = new ArrayList<>();
        for (FanLog log : logs) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", log.getId()); m.put("device_id", log.getDeviceId()); m.put("status", log.getStatus());
            m.put("reason", log.getReason()); m.put("triggered_by", log.getTriggeredBy()); m.put("created_at", log.getCreatedAt());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{deviceId}/commands")
    public ResponseEntity<Map<String, Object>> commands(@PathVariable String deviceId) {
        return deviceRepo.findByDeviceId(deviceId)
            .map(d -> ResponseEntity.ok(Map.<String, Object>of("device_id", d.getDeviceId(), "fan", Boolean.TRUE.equals(d.getFanStatus()), "buzzer", Boolean.TRUE.equals(d.getBuzzerStatus()))))
            .orElseGet(() -> ResponseEntity.ok(Map.of("device_id", deviceId, "fan", false, "buzzer", false)));
    }
}
