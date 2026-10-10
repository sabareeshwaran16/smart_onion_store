package com.vengai.controller;

import com.vengai.model.Prediction;
import com.vengai.repository.PredictionRepository;
import com.vengai.repository.SensorReadingRepository;
import com.vengai.repository.StorageBatchRepository;
import com.vengai.service.AiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/weight")
public class WeightController {

    private final StorageBatchRepository batchRepo;
    private final PredictionRepository predictionRepo;
    private final SensorReadingRepository sensorRepo;
    private final AiService aiService;

    public WeightController(StorageBatchRepository batchRepo, PredictionRepository predictionRepo,
                            SensorReadingRepository sensorRepo, AiService aiService) {
        this.batchRepo = batchRepo; this.predictionRepo = predictionRepo;
        this.sensorRepo = sensorRepo; this.aiService = aiService;
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> current(@RequestParam String batch_id) {
        var batch = batchRepo.findByBatchId(batch_id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch '" + batch_id + "' not found."));
        return predictionRepo.findTopByBatchIdOrderByPredictionTimeDesc(batch_id).map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("batch_id", batch_id); m.put("initial_weight", batch.getInitialWeight());
            m.put("estimated_current_weight", p.getEstimatedCurrentWeight());
            m.put("estimated_loss", p.getWeightLoss()); m.put("loss_percentage", p.getWeightLossPercentage());
            m.put("note", "Estimated via rule-based moisture loss model.");
            return ResponseEntity.ok(m);
        }).orElseGet(() -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("batch_id", batch_id); m.put("initial_weight", batch.getInitialWeight());
            m.put("estimated_current_weight", batch.getInitialWeight());
            m.put("estimated_loss", 0.0); m.put("loss_percentage", 0.0);
            m.put("note", "Initial storage baseline — no shrinkage recorded yet.");
            return ResponseEntity.ok(m);
        });
    }

    @GetMapping("/analysis")
    public ResponseEntity<Map<String, Object>> analysis(@RequestParam String batch_id) {
        var batch = batchRepo.findByBatchId(batch_id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch '" + batch_id + "' not found."));
        var latestPred = predictionRepo.findTopByBatchIdOrderByPredictionTimeDesc(batch_id);
        var latestReading = sensorRepo.findTopByOrderByTimestampDesc();
        int storageDays = (int) Math.max(0, LocalDate.now().toEpochDay() - batch.getStorageStartDate().toEpochDay());

        Map<String, Object> features = new LinkedHashMap<>();
        features.put("temperature", latestReading.map(r -> r.getTemperature()).orElse(28.0));
        features.put("humidity",    latestReading.map(r -> r.getHumidity()).orElse(65.0));
        features.put("gas_value",   latestReading.map(r -> r.getGasValue()).orElse(200.0));
        features.put("storage_days", storageDays);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("batch_id", batch_id); m.put("initial_weight", batch.getInitialWeight());
        m.put("estimated_current_weight", latestPred.map(p -> p.getEstimatedCurrentWeight()).orElse(batch.getInitialWeight()));
        m.put("estimated_loss", latestPred.map(Prediction::getWeightLoss).orElse(0.0));
        m.put("loss_percentage", latestPred.map(Prediction::getWeightLossPercentage).orElse(0.0));
        m.put("factors", aiService.computeWeightLossFactors(features));
        m.put("note", "Weight dynamics estimated using AI model based on ambient exposure.");
        return ResponseEntity.ok(m);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> history(@RequestParam String batch_id, @RequestParam(defaultValue = "50") int limit) {
        var records = predictionRepo.findByBatchIdOrderByPredictionTimeAsc(batch_id);
        List<Map<String, Object>> result = new ArrayList<>();
        int count = 0;
        for (Prediction p : records) {
            if (count++ >= limit) break;
            result.add(Map.of("timestamp", p.getPredictionTime(), "estimated_current_weight", p.getEstimatedCurrentWeight() != null ? p.getEstimatedCurrentWeight() : 0.0, "weight_loss", p.getWeightLoss() != null ? p.getWeightLoss() : 0.0, "weight_loss_percentage", p.getWeightLossPercentage() != null ? p.getWeightLossPercentage() : 0.0));
        }
        return ResponseEntity.ok(result);
    }
}
