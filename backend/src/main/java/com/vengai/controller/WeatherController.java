package com.vengai.controller;

import com.vengai.repository.SensorReadingRepository;
import com.vengai.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;
    private final SensorReadingRepository sensorRepo;

    public WeatherController(WeatherService weatherService, SensorReadingRepository sensorRepo) {
        this.weatherService = weatherService;
        this.sensorRepo = sensorRepo;
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> current() {
        return ResponseEntity.ok(weatherService.fetchCurrentWeather());
    }

    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> forecast() {
        return ResponseEntity.ok(Map.of("forecast", weatherService.fetchForecast()));
    }

    @GetMapping("/impact")
    public ResponseEntity<Map<String, Object>> impact() {
        Map<String, Object> outdoor = weatherService.fetchCurrentWeather();
        Map<String, Object> indoor = new LinkedHashMap<>();
        sensorRepo.findTopByOrderByTimestampDesc().ifPresentOrElse(r -> {
            indoor.put("temperature", r.getTemperature());
            indoor.put("humidity", r.getHumidity());
        }, () -> {
            indoor.put("temperature", 28.0);
            indoor.put("humidity", 65.0);
        });
        Map<String, Object> impact = weatherService.assessWeatherImpact(indoor, outdoor);
        return ResponseEntity.ok(Map.of("indoor", indoor, "outdoor", outdoor, "impact", impact));
    }
}
