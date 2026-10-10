package com.vengai.controller;

import com.vengai.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ClearDataController {

    private final StorageBatchRepository batchRepo;
    private final DeviceRepository deviceRepo;
    private final SensorReadingRepository sensorRepo;
    private final PredictionRepository predictionRepo;
    private final PredictionHistoryRepository predHistRepo;
    private final AlertRepository alertRepo;
    private final RecommendationRepository recRepo;
    private final FanLogRepository fanLogRepo;
    private final SystemSettingsRepository settingsRepo;

    public ClearDataController(StorageBatchRepository batchRepo,
                               DeviceRepository deviceRepo,
                               SensorReadingRepository sensorRepo,
                               PredictionRepository predictionRepo,
                               PredictionHistoryRepository predHistRepo,
                               AlertRepository alertRepo,
                               RecommendationRepository recRepo,
                               FanLogRepository fanLogRepo,
                               SystemSettingsRepository settingsRepo) {
        this.batchRepo = batchRepo;
        this.deviceRepo = deviceRepo;
        this.sensorRepo = sensorRepo;
        this.predictionRepo = predictionRepo;
        this.predHistRepo = predHistRepo;
        this.alertRepo = alertRepo;
        this.recRepo = recRepo;
        this.fanLogRepo = fanLogRepo;
        this.settingsRepo = settingsRepo;
    }

    @PostMapping({"/clear-data", "/database/clear"})
    @DeleteMapping({"/clear-data", "/database/clear"})
    @Transactional
    public ResponseEntity<Map<String, Object>> clearAllData(
            @RequestParam(defaultValue = "false") boolean includeSettings) {

        sensorRepo.deleteAll();
        predictionRepo.deleteAll();
        predHistRepo.deleteAll();
        alertRepo.deleteAll();
        recRepo.deleteAll();
        fanLogRepo.deleteAll();
        deviceRepo.deleteAll();
        batchRepo.deleteAll();

        if (includeSettings) {
            settingsRepo.deleteAll();
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "All data tables successfully emptied.");
        response.put("batches_remaining", batchRepo.count());
        response.put("devices_remaining", deviceRepo.count());
        response.put("sensors_remaining", sensorRepo.count());
        response.put("alerts_remaining", alertRepo.count());
        response.put("recommendations_remaining", recRepo.count());

        return ResponseEntity.ok(response);
    }
}
