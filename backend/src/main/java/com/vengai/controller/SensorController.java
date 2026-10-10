package com.vengai.controller;

import com.vengai.dto.SensorReadingRequest;
import com.vengai.dto.SensorResponseDto;
import com.vengai.model.Device;
import com.vengai.model.SensorReading;
import com.vengai.repository.DeviceRepository;
import com.vengai.repository.SensorReadingRepository;
import com.vengai.repository.StorageBatchRepository;
import com.vengai.service.AiService;
import com.vengai.service.DecisionEngine;
import com.vengai.service.ThingSpeakService;
import com.vengai.service.WeatherService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/api/sensors")
public class SensorController {

    private final SensorReadingRepository sensorRepo;
    private final DeviceRepository deviceRepo;
    private final StorageBatchRepository batchRepo;
    private final AiService aiService;
    private final DecisionEngine decisionEngine;
    private final ThingSpeakService thingSpeakService;
    private final WeatherService weatherService;

    public SensorController(SensorReadingRepository sensorRepo, DeviceRepository deviceRepo,
                            StorageBatchRepository batchRepo, AiService aiService,
                            DecisionEngine decisionEngine, ThingSpeakService thingSpeakService,
                            WeatherService weatherService) {
        this.sensorRepo = sensorRepo;
        this.deviceRepo = deviceRepo;
        this.batchRepo  = batchRepo;
        this.aiService  = aiService;
        this.decisionEngine = decisionEngine;
        this.thingSpeakService = thingSpeakService;
        this.weatherService = weatherService;
    }

    @PostMapping("")
    public ResponseEntity<SensorResponseDto> receiveSensorData(@Valid @RequestBody SensorReadingRequest req) {
        SensorReading reading = SensorReading.builder()
            .deviceId(req.getDeviceId()).batchId(req.getBatchId())
            .temperature(req.getTemperature()).humidity(req.getHumidity()).gasValue(req.getGasValue())
            .build();
        sensorRepo.save(reading);

        Device device = deviceRepo.findByDeviceId(req.getDeviceId())
            .orElseGet(() -> Device.builder().deviceId(req.getDeviceId()).name(req.getDeviceId()).build());
        device.setIsOnline(true);
        device.setLastSeen(OffsetDateTime.now(ZoneOffset.UTC));
        deviceRepo.save(device);

        int storageDays = 0;
        double initialWeight = 1000.0;
        if (req.getBatchId() != null) {
            var batch = batchRepo.findByBatchId(req.getBatchId());
            if (batch.isPresent()) {
                storageDays = (int) Math.max(0, LocalDate.now().toEpochDay() - batch.get().getStorageStartDate().toEpochDay());
                initialWeight = batch.get().getInitialWeight();
            }
        }

        Map<String, Object> weather;
        try { weather = weatherService.fetchCurrentWeather(); } catch (Exception e) { weather = Map.of(); }

        Map<String, Object> features = new LinkedHashMap<>();
        features.put("temperature", req.getTemperature());
        features.put("humidity",    req.getHumidity());
        features.put("gas_value",   req.getGasValue());
        features.put("storage_days", storageDays);
        features.put("outdoor_temperature",  weather.getOrDefault("temperature", 30.0));
        features.put("outdoor_humidity",     weather.getOrDefault("humidity",    65.0));
        features.put("rain_probability",     weather.getOrDefault("rain_probability", 20.0));
        features.put("wind_speed",           weather.getOrDefault("wind_speed",   3.0));
        features.put("initial_weight", initialWeight);

        Map<String, Object> prediction = aiService.predict(features);
        Map<String, Object> sensorMap  = Map.of("temperature", req.getTemperature(), "humidity", req.getHumidity(), "gas_value", req.getGasValue());
        Map<String, Object> decision   = decisionEngine.evaluateAndAct(sensorMap, prediction, weather, req.getBatchId(), req.getDeviceId());

        return ResponseEntity.ok(SensorResponseDto.builder()
            .success(true)
            .fanRequired((boolean) decision.get("fan_required"))
            .buzzerRequired((boolean) decision.get("buzzer_required"))
            .message("Sensor reading successfully recorded and analyzed.")
            .build());
    }

    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> getLatest(@RequestParam(defaultValue = "ESP32_001") String device_id) {
        try {
            Map<String, Object> ts = thingSpeakService.fetchLatestSensor();
            if (ts.get("temperature") != null) {
                Device device = deviceRepo.findByDeviceId(device_id)
                    .orElseGet(() -> Device.builder().deviceId(device_id).name("ESP32 Onion Node").location("Storage Shed").build());
                device.setIsOnline(true);
                device.setLastSeen(OffsetDateTime.now(ZoneOffset.UTC));
                deviceRepo.save(device);
                return ResponseEntity.ok(ts);
            }
        } catch (Exception ignored) {}

        return sensorRepo.findTopByDeviceIdOrderByTimestampDesc(device_id).map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("temperature", r.getTemperature()); m.put("gas_value", r.getGasValue());
            m.put("humidity", r.getHumidity()); m.put("timestamp", r.getTimestamp()); m.put("entry_id", null);
            return ResponseEntity.ok(m);
        }).orElseGet(() -> ResponseEntity.ok(fallbackSensor()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(
            @RequestParam(defaultValue = "100") int results,
            @RequestParam(required = false) Integer hours,
            @RequestParam(defaultValue = "ESP32_001") String device_id) {
        int targetResults = results;
        if (hours != null) targetResults = Math.min(Math.max(hours * 30, 20), 8000);

        try {
            List<Map<String, Object>> ts = thingSpeakService.fetchSensorHistory(targetResults);
            if (!ts.isEmpty()) return ResponseEntity.ok(ts);
        } catch (Exception ignored) {}

        OffsetDateTime cutoff = OffsetDateTime.now(ZoneOffset.UTC).minusHours(hours != null ? hours : 24);
        List<SensorReading> readings = sensorRepo.findByDeviceIdAndTimestampAfterOrderByTimestampAsc(device_id, cutoff);
        List<Map<String, Object>> result = new ArrayList<>();
        for (SensorReading r : readings) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("timestamp", r.getTimestamp()); m.put("temperature", r.getTemperature());
            m.put("gas_value", r.getGasValue()); m.put("humidity", r.getHumidity()); m.put("entry_id", null);
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> fallbackSensor() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("temperature", 28.4); m.put("gas_value", 977.0); m.put("humidity", 63.0);
        m.put("timestamp", OffsetDateTime.now(ZoneOffset.UTC).toString()); m.put("entry_id", null);
        return m;
    }
}
