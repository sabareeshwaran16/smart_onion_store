package com.vengai.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
            "name", "VengAI – Smart Onion Storage API",
            "version", "1.0.0",
            "status", "online",
            "docs", "/swagger-ui.html",
            "description", "AI-Powered Smart Onion Storage & Decision Support System (Spring Boot)"
        );
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "healthy");
    }
}
