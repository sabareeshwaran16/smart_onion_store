package com.vengai.service;

import com.vengai.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class DataInitializerService {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerService.class);

    public DataInitializerService() {}

    @EventListener(ApplicationReadyEvent.class)
    public void initialize() {
        log.info("🌱 VengAI Spring Boot backend ready! Listening on port 8000 (Clean empty database)");
    }
}
