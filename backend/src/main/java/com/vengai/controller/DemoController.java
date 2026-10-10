package com.vengai.controller;

import com.vengai.model.Device;
import com.vengai.model.SensorReading;
import com.vengai.repository.DeviceRepository;
import com.vengai.repository.SensorReadingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    private final SensorReadingRepository sensorRepo;
    private final DeviceRepository deviceRepo;
    private final Random random = new Random();

    private double tempBase = 28.5;
    private double humBase = 68.0;
    private double gasBase = 250.0;

    public DemoController(SensorReadingRepository sensorRepo, DeviceRepository deviceRepo) {
        this.sensorRepo = sensorRepo;
        this.deviceRepo = deviceRepo;
    }

    @PostMapping({"/generate-reading", "/trigger"})
    public ResponseEntity<Map<String, Object>> generateDemoReading(
            @RequestParam(defaultValue = "ESP32_001") String device_id,
            @RequestParam(defaultValue = "BATCH_001") String batch_id) {

        // Drift slowly for realistic simulation
        tempBase = Math.max(20.0, Math.min(40.0, tempBase + (random.nextDouble() - 0.5)));
        humBase = Math.max(40.0, Math.min(95.0, humBase + (random.nextDouble() * 2.5 - 1.0)));
        gasBase = Math.max(100.0, Math.min(800.0, gasBase + (random.nextDouble() * 25.0 - 10.0)));

        double tempRounded = Math.round(tempBase * 10.0) / 10.0;
        double humRounded = Math.round(humBase * 10.0) / 10.0;
        double gasRounded = Math.round(gasBase * 10.0) / 10.0;

        SensorReading reading = SensorReading.builder()
                .deviceId(device_id)
                .batchId(batch_id)
                .temperature(tempRounded)
                .humidity(humRounded)
                .gasValue(gasRounded)
                .timestamp(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
        reading = sensorRepo.save(reading);

        // Update device
        var optDevice = deviceRepo.findByDeviceId(device_id);
        Device device;
        if (optDevice.isPresent()) {
            device = optDevice.get();
        } else {
            device = Device.builder().deviceId(device_id).name("Demo Device").build();
        }
        device.setIsOnline(true);
        device.setLastSeen(OffsetDateTime.now(ZoneOffset.UTC));
        deviceRepo.save(device);

        Map<String, Object> readingData = new LinkedHashMap<>();
        readingData.put("device_id", device_id);
        readingData.put("batch_id", batch_id);
        readingData.put("temperature", reading.getTemperature());
        readingData.put("humidity", reading.getHumidity());
        readingData.put("gas_value", reading.getGasValue());
        readingData.put("timestamp", reading.getTimestamp());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("reading", readingData);
        response.put("note", "This is demo/simulated data. Not from a real sensor.");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getDemoStatus() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("demo_available", true);
        response.put("description", "POST /api/demo/generate-reading or POST /api/demo/trigger to inject a demo sensor reading.");
        return ResponseEntity.ok(response);
    }
}
