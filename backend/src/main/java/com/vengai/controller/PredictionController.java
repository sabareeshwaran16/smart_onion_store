package com.vengai.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vengai.dto.RetrievalSimRequest;
import com.vengai.dto.TimelineRequest;
import com.vengai.model.*;
import com.vengai.repository.*;
import com.vengai.service.AiService;
import com.vengai.service.ThingSpeakService;
import com.vengai.service.WeatherService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private final PredictionRepository predictionRepo;
    private final PredictionHistoryRepository predHistRepo;
    private final StorageBatchRepository batchRepo;
    private final SensorReadingRepository sensorRepo;
    private final AiService aiService;
    private final ThingSpeakService thingSpeakService;
    private final WeatherService weatherService;
    private final ObjectMapper objectMapper;

    public PredictionController(PredictionRepository predictionRepo, PredictionHistoryRepository predHistRepo,
                                 StorageBatchRepository batchRepo, SensorReadingRepository sensorRepo,
                                 AiService aiService, ThingSpeakService thingSpeakService,
                                 WeatherService weatherService, ObjectMapper objectMapper) {
        this.predictionRepo = predictionRepo; this.predHistRepo = predHistRepo;
        this.batchRepo = batchRepo; this.sensorRepo = sensorRepo;
        this.aiService = aiService; this.thingSpeakService = thingSpeakService;
        this.weatherService = weatherService; this.objectMapper = objectMapper;
    }

    private Map<String, Object> assembleFeatures(String batchId) {
        StorageBatch batch = batchRepo.findByBatchId(batchId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch '" + batchId + "' not found."));

        double temp = 28.4, hum = 63.0, gas = 977.0;
        try {
            Map<String, Object> ts = thingSpeakService.fetchLatestSensor();
            if (ts.get("temperature") != null) {
                temp = toDouble(ts.get("temperature"), 28.4);
                hum  = toDouble(ts.get("humidity"), 63.0);
                gas  = toDouble(ts.get("gas_value"), 977.0);
            }
        } catch (Exception e) {
            sensorRepo.findTopByOrderByTimestampDesc().ifPresent(r -> { /* fallback set below */ });
        }

        int storageDays = (int) Math.max(0, LocalDate.now().toEpochDay() - batch.getStorageStartDate().toEpochDay());
        Map<String, Object> weather;
        try { weather = weatherService.fetchCurrentWeather(); } catch (Exception e) { weather = Map.of(); }

        Map<String, Object> features = new LinkedHashMap<>();
        features.put("temperature", temp); features.put("humidity", hum); features.put("gas_value", gas);
        features.put("storage_days", storageDays);
        features.put("outdoor_temperature",  weather.getOrDefault("temperature", 30.0));
        features.put("outdoor_humidity",     weather.getOrDefault("humidity", 65.0));
        features.put("rain_probability",     weather.getOrDefault("rain_probability", 20.0));
        features.put("wind_speed",           weather.getOrDefault("wind_speed", 3.0));
        features.put("initial_weight", batch.getInitialWeight());
        return features;
    }

    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> runPrediction(@RequestParam String batch_id) {
        Map<String, Object> features = assembleFeatures(batch_id);
        Map<String, Object> result   = aiService.predict(features);
        Object explanation = result.remove("explanation");

        String explanationJson = null;
        try { explanationJson = objectMapper.writeValueAsString(explanation); } catch (JsonProcessingException ignored) {}

        Prediction p = Prediction.builder().batchId(batch_id)
            .shelfLifeRemaining(toDouble(result.get("shelf_life_remaining"), null))
            .weightLoss(toDouble(result.get("weight_loss"), null))
            .weightLossPercentage(toDouble(result.get("weight_loss_percentage"), null))
            .estimatedCurrentWeight(toDouble(result.get("estimated_current_weight"), null))
            .rotRisk(toDouble(result.get("rot_risk"), null)).sproutingRisk(toDouble(result.get("sprouting_risk"), null))
            .spoilageRisk(toDouble(result.get("spoilage_risk"), null)).healthScore(toDouble(result.get("health_score"), null))
            .confidence(toDouble(result.get("confidence"), null)).explanationJson(explanationJson)
            .isDemo(result.get("is_demo") instanceof Boolean b ? b : true).build();
        predictionRepo.save(p);

        predHistRepo.save(PredictionHistory.builder().batchId(batch_id)
            .rotRisk(p.getRotRisk()).sproutingRisk(p.getSproutingRisk()).spoilageRisk(p.getSpoilageRisk())
            .healthScore(p.getHealthScore()).shelfLifeRemaining(p.getShelfLifeRemaining()).estimatedCurrentWeight(p.getEstimatedCurrentWeight()).build());

        result.put("explanation", explanation);
        result.put("id", p.getId()); result.put("batch_id", batch_id); result.put("prediction_time", p.getPredictionTime());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> latest(@RequestParam String batch_id) {
        return predictionRepo.findTopByBatchIdOrderByPredictionTimeDesc(batch_id).map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId()); m.put("batch_id", p.getBatchId());
            m.put("shelf_life_remaining", p.getShelfLifeRemaining()); m.put("weight_loss", p.getWeightLoss());
            m.put("weight_loss_percentage", p.getWeightLossPercentage()); m.put("estimated_current_weight", p.getEstimatedCurrentWeight());
            m.put("rot_risk", p.getRotRisk()); m.put("sprouting_risk", p.getSproutingRisk());
            m.put("spoilage_risk", p.getSpoilageRisk()); m.put("health_score", p.getHealthScore());
            m.put("confidence", p.getConfidence()); m.put("is_demo", p.getIsDemo()); m.put("prediction_time", p.getPredictionTime());
            try { m.put("explanation", p.getExplanationJson() != null ? objectMapper.readValue(p.getExplanationJson(), Object.class) : Map.of()); } catch (Exception ignored) {}
            return ResponseEntity.ok(m);
        }).orElseGet(() -> runPrediction(batch_id));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> history(@RequestParam String batch_id, @RequestParam(defaultValue = "50") int limit) {
        var records = predHistRepo.findByBatchIdOrderByRecordedAtAsc(batch_id, PageRequest.of(0, limit));
        List<Map<String, Object>> result = new ArrayList<>();
        for (PredictionHistory r : records) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("batch_id", r.getBatchId()); m.put("rot_risk", r.getRotRisk()); m.put("sprouting_risk", r.getSproutingRisk());
            m.put("spoilage_risk", r.getSpoilageRisk()); m.put("health_score", r.getHealthScore());
            m.put("shelf_life_remaining", r.getShelfLifeRemaining()); m.put("estimated_current_weight", r.getEstimatedCurrentWeight()); m.put("recorded_at", r.getRecordedAt());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/retrieval-simulation")
    public ResponseEntity<Map<String, Object>> simulate(@Valid @RequestBody RetrievalSimRequest req) {
        Map<String, Object> features = assembleFeatures(req.getBatchId());
        return ResponseEntity.ok(aiService.simulateRetrieval(features, req.getRetrievalAfterDays()));
    }

    @PostMapping("/timeline")
    public ResponseEntity<Map<String, Object>> timeline(@Valid @RequestBody TimelineRequest req) {
        Map<String, Object> features = assembleFeatures(req.getBatchId());
        return ResponseEntity.ok(Map.of("batch_id", req.getBatchId(), "timeline", aiService.generateTimeline(features, req.getDaysList())));
    }

    private Double toDouble(Object val, Double def) {
        if (val instanceof Number n) return n.doubleValue();
        return def;
    }
}
