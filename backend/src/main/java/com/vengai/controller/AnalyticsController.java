package com.vengai.controller;

import com.vengai.model.PredictionHistory;
import com.vengai.model.SensorReading;
import com.vengai.repository.PredictionHistoryRepository;
import com.vengai.repository.SensorReadingRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final SensorReadingRepository sensorRepo;
    private final PredictionHistoryRepository predHistRepo;

    public AnalyticsController(SensorReadingRepository sensorRepo, PredictionHistoryRepository predHistRepo) {
        this.sensorRepo = sensorRepo; this.predHistRepo = predHistRepo;
    }

    @GetMapping("")
    public ResponseEntity<Map<String, Object>> analytics(
            @RequestParam(required = false) String batch_id,
            @RequestParam(defaultValue = "30") int days) {
        OffsetDateTime cutoff = OffsetDateTime.now(ZoneOffset.UTC).minusDays(days);

        List<SensorReading> sensorRecords = batch_id != null
            ? sensorRepo.findByTimestampAfterOrderByTimestampAsc(cutoff).stream().filter(r -> batch_id.equals(r.getBatchId())).limit(1000).toList()
            : sensorRepo.findByTimestampAfterOrderByTimestampAsc(cutoff).stream().limit(1000).toList();

        List<Map<String, Object>> sensorTrends = new ArrayList<>();
        for (SensorReading r : sensorRecords) {
            sensorTrends.add(Map.of("timestamp", r.getTimestamp(), "temperature", r.getTemperature(), "humidity", r.getHumidity(), "gas_value", r.getGasValue()));
        }

        List<PredictionHistory> predRecords = batch_id != null
            ? predHistRepo.findByBatchIdOrderByRecordedAtAsc(batch_id, PageRequest.of(0, 200))
            : predHistRepo.findAll().stream().filter(p -> p.getRecordedAt().isAfter(cutoff)).limit(200).toList();

        List<Map<String, Object>> predTrends = new ArrayList<>();
        for (PredictionHistory p : predRecords) {
            predTrends.add(Map.of("timestamp", p.getRecordedAt(), "rot_risk", p.getRotRisk() != null ? p.getRotRisk() : 0.0, "sprouting_risk", p.getSproutingRisk() != null ? p.getSproutingRisk() : 0.0, "spoilage_risk", p.getSpoilageRisk() != null ? p.getSpoilageRisk() : 0.0, "health_score", p.getHealthScore() != null ? p.getHealthScore() : 0.0, "shelf_life_remaining", p.getShelfLifeRemaining() != null ? p.getShelfLifeRemaining() : 0.0, "estimated_current_weight", p.getEstimatedCurrentWeight() != null ? p.getEstimatedCurrentWeight() : 0.0));
        }

        Map<String, Object> summary = computeSummary(sensorTrends);
        return ResponseEntity.ok(Map.of("batch_id", batch_id != null ? batch_id : "", "period_days", days, "summary", summary, "sensor_trends", sensorTrends, "prediction_trends", predTrends));
    }

    private Map<String, Object> computeSummary(List<Map<String, Object>> sensors) {
        if (sensors.isEmpty()) return Map.of("total_readings", 0, "status", "No historical sensor data available");
        DoubleSummaryStatistics ts = sensors.stream().mapToDouble(m -> (double) m.get("temperature")).summaryStatistics();
        DoubleSummaryStatistics hs = sensors.stream().mapToDouble(m -> (double) m.get("humidity")).summaryStatistics();
        DoubleSummaryStatistics gs = sensors.stream().mapToDouble(m -> (double) m.get("gas_value")).summaryStatistics();
        String assessment = ts.getAverage() <= 28 && hs.getAverage() >= 60 && hs.getAverage() <= 70
            ? "Optimal: Environmental conditions are within ideal onion storage parameters."
            : ts.getAverage() > 30 || hs.getAverage() > 75
                ? "Attention Needed: Elevated temperature or humidity levels detected."
                : "Moderate: Storage conditions are acceptable, continue standard monitoring.";
        return Map.of("total_readings", sensors.size(), "avg_temperature", round(ts.getAverage()), "min_temperature", round(ts.getMin()), "max_temperature", round(ts.getMax()), "avg_humidity", round(hs.getAverage()), "min_humidity", round(hs.getMin()), "max_humidity", round(hs.getMax()), "avg_gas", round(gs.getAverage()), "max_gas", round(gs.getMax()), "health_assessment", assessment);
    }

    private double round(double v) { return Math.round(v * 10.0) / 10.0; }
}
