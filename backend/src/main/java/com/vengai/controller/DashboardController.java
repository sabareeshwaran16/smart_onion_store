package com.vengai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vengai.model.*;
import com.vengai.repository.*;
import com.vengai.service.AiService;
import com.vengai.service.ThingSpeakService;
import com.vengai.service.WeatherService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final StorageBatchRepository batchRepo;
    private final SensorReadingRepository sensorRepo;
    private final PredictionRepository predictionRepo;
    private final AlertRepository alertRepo;
    private final RecommendationRepository recRepo;
    private final DeviceRepository deviceRepo;
    private final ThingSpeakService thingSpeakService;
    private final WeatherService weatherService;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public DashboardController(StorageBatchRepository batchRepo, SensorReadingRepository sensorRepo,
                                PredictionRepository predictionRepo, AlertRepository alertRepo,
                                RecommendationRepository recRepo, DeviceRepository deviceRepo,
                                ThingSpeakService thingSpeakService, WeatherService weatherService,
                                AiService aiService, ObjectMapper objectMapper) {
        this.batchRepo = batchRepo;
        this.sensorRepo = sensorRepo;
        this.predictionRepo = predictionRepo;
        this.alertRepo = alertRepo;
        this.recRepo = recRepo;
        this.deviceRepo = deviceRepo;
        this.thingSpeakService = thingSpeakService;
        this.weatherService = weatherService;
        this.aiService = aiService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@RequestParam(required = false) String batch_id) {
        // 1. Batch
        StorageBatch batch = batch_id != null
            ? batchRepo.findByBatchId(batch_id).orElse(null)
            : batchRepo.findByIsActiveTrueOrderByCreatedAtDesc().stream().findFirst().orElse(null);

        Map<String, Object> batchSummary = null;
        if (batch != null) {
            LocalDate today = LocalDate.now();
            int storageDays = (int) Math.max(0, today.toEpochDay() - batch.getStorageStartDate().toEpochDay());
            Integer daysRemaining = batch.getExpectedRetrievalDate() != null
                ? (int)(batch.getExpectedRetrievalDate().toEpochDay() - today.toEpochDay())
                : null;
            batchSummary = new LinkedHashMap<>();
            batchSummary.put("batch_id", batch.getBatchId());
            batchSummary.put("onion_variety", batch.getOnionVariety());
            batchSummary.put("initial_weight", batch.getInitialWeight());
            batchSummary.put("storage_start_date", batch.getStorageStartDate().toString());
            batchSummary.put("expected_retrieval_date", batch.getExpectedRetrievalDate() != null ? batch.getExpectedRetrievalDate().toString() : null);
            batchSummary.put("storage_days", storageDays);
            batchSummary.put("days_remaining", daysRemaining);
            batchSummary.put("location", batch.getLocation());
            batchSummary.put("warehouse", batch.getWarehouse());
        }

        // 2. Sensor
        Map<String, Object> sensorSummary = null;
        try {
            Map<String, Object> ts = thingSpeakService.fetchLatestSensor();
            if (ts != null && ts.get("temperature") != null) {
                sensorSummary = new LinkedHashMap<>();
                sensorSummary.put("temperature", ts.get("temperature"));
                sensorSummary.put("humidity", ts.get("humidity"));
                sensorSummary.put("gas_value", ts.get("gas_value"));
                sensorSummary.put("timestamp", ts.get("timestamp"));
                sensorSummary.put("device_id", "ESP32_001");
                sensorSummary.put("entry_id", ts.get("entry_id"));
            }
        } catch (Exception ignored) {}

        if (sensorSummary == null) {
            sensorSummary = sensorRepo.findTopByOrderByTimestampDesc().map(r -> {
                Map<String, Object> sm = new LinkedHashMap<String, Object>();
                sm.put("temperature", r.getTemperature());
                sm.put("humidity", r.getHumidity());
                sm.put("gas_value", r.getGasValue());
                sm.put("timestamp", r.getTimestamp());
                sm.put("device_id", r.getDeviceId());
                sm.put("entry_id", null);
                return sm;
            }).orElseGet(() -> {
                Map<String, Object> sm = new LinkedHashMap<String, Object>();
                sm.put("temperature", 28.4);
                sm.put("humidity", 63.0);
                sm.put("gas_value", 977.0);
                sm.put("timestamp", null);
                sm.put("device_id", "ESP32_001");
                sm.put("entry_id", null);
                return sm;
            });
        }

        // 3. Prediction
        Map<String, Object> predSummary = null;
        if (batch != null) {
            var latest = predictionRepo.findTopByBatchIdOrderByPredictionTimeDesc(batch.getBatchId());
            if (latest.isPresent()) {
                Prediction p = latest.get();
                predSummary = new LinkedHashMap<>();
                predSummary.put("shelf_life_remaining", p.getShelfLifeRemaining());
                predSummary.put("weight_loss", p.getWeightLoss());
                predSummary.put("weight_loss_percentage", p.getWeightLossPercentage());
                predSummary.put("estimated_current_weight", p.getEstimatedCurrentWeight());
                predSummary.put("rot_risk", p.getRotRisk());
                predSummary.put("sprouting_risk", p.getSproutingRisk());
                predSummary.put("spoilage_risk", p.getSpoilageRisk());
                predSummary.put("health_score", p.getHealthScore());
                predSummary.put("confidence", p.getConfidence());
                predSummary.put("is_demo", p.getIsDemo());
                predSummary.put("prediction_time", p.getPredictionTime());
            }
        }

        // 4. Weather
        Map<String, Object> weatherSummary;
        try {
            weatherSummary = weatherService.fetchCurrentWeather();
        } catch (Exception e) {
            weatherSummary = Collections.emptyMap();
        }

        // 5. Alerts
        var activeAlerts = alertRepo.findByIsResolvedOrderByCreatedAtDesc(false, PageRequest.of(0, 5));
        List<Map<String, Object>> alertsData = new ArrayList<>();
        for (Alert a : activeAlerts) {
            Map<String, Object> am = new LinkedHashMap<>();
            am.put("id", a.getId());
            am.put("alert_type", a.getAlertType());
            am.put("severity", a.getSeverity());
            am.put("message", a.getMessage());
            am.put("current_value", a.getCurrentValue() != null ? a.getCurrentValue() : 0.0);
            am.put("threshold_value", a.getThresholdValue() != null ? a.getThresholdValue() : 0.0);
            am.put("recommendation", a.getRecommendation() != null ? a.getRecommendation() : "");
            am.put("created_at", a.getCreatedAt());
            alertsData.add(am);
        }

        // 6. Recommendations
        var activeRecs = recRepo.findByIsActiveTrueOrderByCreatedAtDesc(PageRequest.of(0, 3));
        List<Map<String, Object>> recsData = new ArrayList<>();
        for (Recommendation r : activeRecs) {
            Map<String, Object> rm = new LinkedHashMap<>();
            rm.put("id", r.getId());
            rm.put("priority", r.getPriority());
            rm.put("category", r.getCategory() != null ? r.getCategory() : "");
            rm.put("title", r.getTitle());
            rm.put("message", r.getMessage());
            rm.put("action", r.getAction() != null ? r.getAction() : "");
            recsData.add(rm);
        }

        // 7. Device
        Map<String, Object> deviceData = deviceRepo.findAll().stream().findFirst().map(d -> {
            Map<String, Object> dm = new LinkedHashMap<>();
            dm.put("device_id", d.getDeviceId());
            dm.put("is_online", d.getIsOnline());
            dm.put("last_seen", d.getLastSeen());
            dm.put("fan_status", d.getFanStatus());
            dm.put("buzzer_status", d.getBuzzerStatus());
            return dm;
        }).orElse(null);

        // 8. Weight
        Map<String, Object> weightSummary = null;
        if (batch != null && predSummary != null) {
            double temp = (sensorSummary != null && sensorSummary.get("temperature") instanceof Number n) ? n.doubleValue() : 28.0;
            double hum = (sensorSummary != null && sensorSummary.get("humidity") instanceof Number n) ? n.doubleValue() : 65.0;
            double gas = (sensorSummary != null && sensorSummary.get("gas_value") instanceof Number n) ? n.doubleValue() : 200.0;
            Object storageDays = batchSummary != null ? batchSummary.get("storage_days") : 0;

            Map<String, Object> features = new LinkedHashMap<>();
            features.put("temperature", temp);
            features.put("humidity", hum);
            features.put("gas_value", gas);
            features.put("storage_days", storageDays);

            weightSummary = new LinkedHashMap<>();
            weightSummary.put("initial_weight", batch.getInitialWeight());
            weightSummary.put("estimated_current_weight", predSummary.getOrDefault("estimated_current_weight", batch.getInitialWeight()));
            weightSummary.put("estimated_loss", predSummary.getOrDefault("weight_loss", 0.0));
            weightSummary.put("loss_percentage", predSummary.getOrDefault("weight_loss_percentage", 0.0));
            weightSummary.put("factors", aiService.computeWeightLossFactors(features));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("batch", batchSummary != null ? batchSummary : Collections.emptyMap());
        response.put("sensor", sensorSummary != null ? sensorSummary : Collections.emptyMap());
        response.put("prediction", predSummary != null ? predSummary : Collections.emptyMap());
        response.put("weather", weatherSummary != null ? weatherSummary : Collections.emptyMap());
        response.put("alerts", alertsData);
        response.put("recommendations", recsData);
        response.put("device", deviceData != null ? deviceData : Collections.emptyMap());
        response.put("weight", weightSummary != null ? weightSummary : Collections.emptyMap());

        return ResponseEntity.ok(response);
    }
}
