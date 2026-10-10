package com.vengai.controller;

import com.vengai.dto.SettingsUpdateRequest;
import com.vengai.model.SystemSettings;
import com.vengai.repository.SystemSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SystemSettingsRepository settingsRepo;

    public SettingsController(SystemSettingsRepository settingsRepo) { this.settingsRepo = settingsRepo; }

    @GetMapping("")
    public ResponseEntity<List<Map<String, Object>>> get() {
        var settings = settingsRepo.findAll();
        settings.sort(Comparator.comparing(SystemSettings::getKey));
        List<Map<String, Object>> result = new ArrayList<>();
        for (SystemSettings s : settings) {
            result.add(Map.of("key", s.getKey(), "value", s.getValue(), "description", s.getDescription() != null ? s.getDescription() : ""));
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("")
    public ResponseEntity<Map<String, Object>> update(@RequestBody SettingsUpdateRequest req) {
        List<String> updatedKeys = new ArrayList<>();
        if (req.getSettings() != null) {
            for (Map.Entry<String, String> entry : req.getSettings().entrySet()) {
                SystemSettings s = settingsRepo.findByKey(entry.getKey())
                    .orElseGet(() -> SystemSettings.builder().key(entry.getKey()).build());
                s.setValue(entry.getValue());
                settingsRepo.save(s);
                updatedKeys.add(entry.getKey());
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Successfully updated " + updatedKeys.size() + " setting(s).", "updated_keys", updatedKeys));
    }
}
