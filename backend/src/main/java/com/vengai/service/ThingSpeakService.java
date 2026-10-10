package com.vengai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.*;

@Service
public class ThingSpeakService {

    private static final Logger log = LoggerFactory.getLogger(ThingSpeakService.class);

    @Value("${thingspeak.channel-id}")
    private String channelId;

    @Value("${thingspeak.read-api-key}")
    private String readApiKey;

    @Value("${thingspeak.base-url}")
    private String baseUrl;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    // In-memory caches
    private Map<String, Object> lastKnownReading;
    private List<Map<String, Object>> lastKnownHistory;

    public ThingSpeakService(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> fetchLatestSensor() {
        String url = baseUrl + "/channels/" + channelId + "/feeds/last.json";
        if (readApiKey != null && !readApiKey.isBlank()) {
            url += "?api_key=" + readApiKey.strip();
        }
        try {
            String json = restClient.get().uri(url).retrieve().body(String.class);
            if (json == null || json.trim().equals("-1")) {
                log.warn("ThingSpeak returned invalid response");
                return lastKnownReading != null ? lastKnownReading : fallbackReading();
            }
            JsonNode node = objectMapper.readTree(json);
            if (!node.isObject()) {
                return lastKnownReading != null ? lastKnownReading : fallbackReading();
            }
            JsonNode f1 = node.get("field1");
            JsonNode f2 = node.get("field2");
            JsonNode f3 = node.get("field3");

            double temperature = (f1 != null && !f1.isNull()) ? f1.asDouble() : 28.4;
            double gasValue    = (f2 != null && !f2.isNull()) ? f2.asDouble() : 977.0;
            double humidity    = (f3 != null && !f3.isNull()) ? f3.asDouble() : 63.0;
            String timestamp   = node.has("created_at") ? node.get("created_at").asText() : Instant.now().toString();
            Integer entryId    = node.has("entry_id") && !node.get("entry_id").isNull() ? node.get("entry_id").asInt() : null;

            log.info("ThingSpeak: temp={}, gas={}, humidity={}", temperature, gasValue, humidity);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("temperature", temperature);
            result.put("gas_value", gasValue);
            result.put("humidity", humidity);
            result.put("timestamp", timestamp);
            result.put("entry_id", entryId);
            lastKnownReading = result;
            return result;
        } catch (RestClientException e) {
            log.warn("ThingSpeak HTTP error: {}", e.getMessage());
        } catch (Exception e) {
            log.error("ThingSpeak fetch error: {}", e.getMessage());
        }
        return lastKnownReading != null ? lastKnownReading : fallbackReading();
    }

    public List<Map<String, Object>> fetchSensorHistory(int results) {
        int sanitized = Math.max(1, Math.min(results, 8000));
        String url = baseUrl + "/channels/" + channelId + "/feeds.json?results=" + sanitized;
        if (readApiKey != null && !readApiKey.isBlank()) {
            url += "&api_key=" + readApiKey.strip();
        }
        try {
            String json = restClient.get().uri(url).retrieve().body(String.class);
            JsonNode root = objectMapper.readTree(json);
            JsonNode feeds = root.get("feeds");
            if (feeds == null || !feeds.isArray()) {
                return lastKnownHistory != null ? lastKnownHistory : Collections.emptyList();
            }
            List<Map<String, Object>> history = new ArrayList<>();
            for (JsonNode feed : feeds) {
                try {
                    JsonNode f1 = feed.get("field1");
                    JsonNode f2 = feed.get("field2");
                    JsonNode f3 = feed.get("field3");
                    String ts  = feed.has("created_at") ? feed.get("created_at").asText() : Instant.now().toString();
                    Integer eid = feed.has("entry_id") && !feed.get("entry_id").isNull() ? feed.get("entry_id").asInt() : null;

                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("timestamp", ts);
                    entry.put("temperature", (f1 != null && !f1.isNull()) ? f1.asDouble() : 28.4);
                    entry.put("gas_value",   (f2 != null && !f2.isNull()) ? f2.asDouble() : 977.0);
                    entry.put("humidity",    (f3 != null && !f3.isNull()) ? f3.asDouble() : 63.0);
                    entry.put("entry_id", eid);
                    history.add(entry);
                } catch (Exception ignored) {}
            }
            if (!history.isEmpty()) lastKnownHistory = history;
            return history;
        } catch (Exception e) {
            log.error("ThingSpeak history fetch error: {}", e.getMessage());
        }
        return lastKnownHistory != null ? lastKnownHistory : Collections.emptyList();
    }

    private Map<String, Object> fallbackReading() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("temperature", 28.4);
        m.put("gas_value", 977.0);
        m.put("humidity", 63.0);
        m.put("timestamp", Instant.now().toString());
        m.put("entry_id", null);
        return m;
    }
}
