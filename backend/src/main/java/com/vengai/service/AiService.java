package com.vengai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

/**
 * AI Prediction Service
 * Connects directly to the trained Random Forest ML microservice (.pkl models)
 * with automatic fallback to the internal rule-based estimation engine.
 */
@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    @Value("${ml.service.url:http://localhost:5001}")
    private String mlServiceUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
    }

    public Map<String, Object> predict(Map<String, Object> features) {
        // 1. Try calling the trained Random Forest ML microservice (.pkl)
        if (mlServiceUrl != null && !mlServiceUrl.isBlank()) {
            try {
                String reqJson = objectMapper.writeValueAsString(features);
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(mlServiceUrl.replaceAll("/+$", "") + "/predict"))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(4))
                        .POST(HttpRequest.BodyPublishers.ofString(reqJson, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
                if (response.statusCode() == 200) {
                    Map<String, Object> mlResult = objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
                    log.info("Generated prediction using trained RandomForest ML models (.pkl)");
                    return mlResult;
                } else {
                    log.warn("ML service returned status {}: {}. Using rule-based fallback.", response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.warn("ML microservice offline or unreachable at {} ({}). Using rule-based fallback.", mlServiceUrl, e.getMessage());
            }
        }

        // 2. Fallback to rule-based estimation
        Map<String, Object> result = ruleBased(features);
        result.put("explanation", generateExplanation(features, result));
        return result;
    }

    private Map<String, Object> ruleBased(Map<String, Object> features) {
        double temp         = toDouble(features.get("temperature"), 28.0);
        double humidity     = toDouble(features.get("humidity"), 65.0);
        double gas          = toDouble(features.get("gas_value"), 200.0);
        double storageDays  = toDouble(features.get("storage_days"), 1.0);
        double rainProb     = toDouble(features.get("rain_probability"), 20.0);
        double initialWeight = toDouble(features.get("initial_weight"), 1000.0);

        // Shelf life
        double shelfLife = 180.0;
        shelfLife -= Math.max(0, (temp - 25) * 3);
        shelfLife -= Math.max(0, (humidity - 65) * 1.5);
        shelfLife -= storageDays * 0.5;
        shelfLife -= Math.max(0, (rainProb - 30) * 0.3);
        shelfLife = Math.max(5, Math.min(180, shelfLife));

        // Rot risk
        double rotRisk = 5.0;
        rotRisk += Math.max(0, (temp - 25) * 2.5);
        rotRisk += Math.max(0, (humidity - 65) * 1.8);
        rotRisk += storageDays * 0.15;
        rotRisk += Math.max(0, (rainProb - 40) * 0.4);
        rotRisk = Math.max(0, Math.min(100, rotRisk));

        // Sprouting risk
        double sproutRisk = 3.0;
        sproutRisk += Math.max(0, (temp - 22) * 1.5);
        sproutRisk += storageDays * 0.12;
        sproutRisk = Math.max(0, Math.min(100, sproutRisk));

        // Spoilage risk
        double spoilRisk = 4.0;
        spoilRisk += Math.max(0, (humidity - 60) * 1.2);
        spoilRisk += Math.max(0, (gas - 200) * 0.05);
        spoilRisk += storageDays * 0.1;
        spoilRisk = Math.max(0, Math.min(100, spoilRisk));

        // Weight loss
        double dailyLossRate = 0.001 + (temp - 20) * 0.0005 + (humidity - 60) * 0.0002;
        double weightLoss = initialWeight * dailyLossRate * storageDays;
        weightLoss = Math.max(0, Math.min(initialWeight * 0.5, weightLoss));
        double estimatedWeight = initialWeight - weightLoss;
        double weightLossPct = initialWeight > 0 ? (weightLoss / initialWeight) * 100 : 0;

        // Health score
        double healthScore = 100 - (rotRisk * 0.4 + spoilRisk * 0.3 + sproutRisk * 0.2 + weightLossPct * 0.1);
        healthScore = Math.max(0, Math.min(100, healthScore));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("shelf_life_remaining", round(shelfLife, 1));
        result.put("weight_loss",           round(weightLoss, 2));
        result.put("weight_loss_percentage", round(weightLossPct, 2));
        result.put("estimated_current_weight", round(estimatedWeight, 2));
        result.put("rot_risk",       round(rotRisk, 1));
        result.put("sprouting_risk", round(sproutRisk, 1));
        result.put("spoilage_risk",  round(spoilRisk, 1));
        result.put("health_score",   round(healthScore, 1));
        result.put("confidence",     65.0);
        result.put("is_demo",        true);
        result.put("model_source",   "Rule-based Fallback");
        return result;
    }

    public Map<String, Object> simulateRetrieval(Map<String, Object> features, int retrievalDays) {
        Map<String, Object> future = new HashMap<>(features);
        double currentDays = toDouble(features.get("storage_days"), 0.0);
        future.put("storage_days", currentDays + retrievalDays);
        Map<String, Object> result = predict(future);

        double health = toDouble(result.get("health_score"), 50.0);
        String quality, recommendation;
        if (health >= 80) { quality = "Excellent"; recommendation = "Safe to continue storage. Conditions are optimal."; }
        else if (health >= 65) { quality = "Good"; recommendation = "Safe to retrieve. Monitor humidity closely."; }
        else if (health >= 50) { quality = "Fair"; recommendation = "Consider retrieving soon. Risk is increasing."; }
        else if (health >= 35) { quality = "Poor"; recommendation = "Retrieve immediately. Significant risk of spoilage."; }
        else { quality = "Critical"; recommendation = "Urgent retrieval recommended. High spoilage risk."; }

        result.put("expected_quality", quality);
        result.put("recommendation", recommendation);
        result.put("retrieval_days", retrievalDays);
        return result;
    }

    public List<Map<String, Object>> generateTimeline(Map<String, Object> features, List<Integer> daysList) {
        List<Map<String, Object>> timeline = new ArrayList<>();
        List<Integer> sorted = new ArrayList<>(daysList);
        Collections.sort(sorted);
        for (int days : sorted) {
            Map<String, Object> entry = simulateRetrieval(features, days);
            entry.put("days", days);
            timeline.add(entry);
        }
        return timeline;
    }

    public List<Map<String, Object>> computeWeightLossFactors(Map<String, Object> features) {
        double temp        = toDouble(features.get("temperature"), 28.0);
        double humidity    = toDouble(features.get("humidity"), 65.0);
        double storageDays = toDouble(features.get("storage_days"), 1.0);
        double gas         = toDouble(features.get("gas_value"), 200.0);

        double moistureScore    = Math.max(0, 30 + (temp - 20) * 2);
        double tempScore        = Math.max(0, (temp - 20) * 3);
        double humidityScore    = Math.max(0, (humidity - 60) * 1.5);
        double durationScore    = storageDays * 0.3;
        double ventilationScore = Math.max(0, (gas - 200) * 0.05);
        double total = moistureScore + tempScore + humidityScore + durationScore + ventilationScore + 0.001;

        return List.of(
            Map.of("factor","Natural Moisture Loss","contribution_pct",round((moistureScore/total)*100,1),"explanation","Onions naturally release moisture over time."),
            Map.of("factor","Temperature Effect","contribution_pct",round((tempScore/total)*100,1),"explanation","Temperature of "+temp+"°C accelerates moisture loss."),
            Map.of("factor","Humidity Effect","contribution_pct",round((humidityScore/total)*100,1),"explanation","Humidity of "+humidity+"% affects surface exchange."),
            Map.of("factor","Storage Duration","contribution_pct",round((durationScore/total)*100,1),"explanation","After "+((int)storageDays)+" days, cumulative losses compound."),
            Map.of("factor","Poor Ventilation","contribution_pct",round((ventilationScore/total)*100,1),"explanation","Elevated gas suggests inadequate ventilation.")
        );
    }

    private Map<String, Object> generateExplanation(Map<String, Object> features, Map<String, Object> result) {
        List<String> reasons = new ArrayList<>();
        double temp        = toDouble(features.get("temperature"), 28.0);
        double humidity    = toDouble(features.get("humidity"), 65.0);
        double gas         = toDouble(features.get("gas_value"), 200.0);
        double storageDays = toDouble(features.get("storage_days"), 1.0);
        double rainProb    = toDouble(features.get("rain_probability"), 20.0);

        if (temp > 30) reasons.add("Temperature is high (" + temp + "°C), accelerating rot risk.");
        else if (temp < 20) reasons.add("Temperature is within safe range (" + temp + "°C).");
        if (humidity > 75) reasons.add("Indoor humidity elevated (" + humidity + "%), increasing spoilage probability.");
        else if (humidity > 65) reasons.add("Humidity is slightly above optimal (" + humidity + "%).");
        else reasons.add("Humidity is within optimal range (" + humidity + "%).");
        if (gas > 400) reasons.add("Gas/ethylene level high (" + gas + "), indicating early deterioration.");
        if (storageDays > 60) reasons.add("Extended storage period (" + (int)storageDays + " days) increases all risks.");
        else if (storageDays > 30) reasons.add("Storage duration (" + (int)storageDays + " days) in moderate range.");
        if (rainProb > 60) reasons.add("High rain probability (" + rainProb + "%) may increase indoor humidity.");

        Map<String, Object> exp = new LinkedHashMap<>();
        exp.put("factors", reasons);
        exp.put("key_risk", identifyKeyRisk(result));
        exp.put("model_type", "Rule-based estimation");
        return exp;
    }

    private String identifyKeyRisk(Map<String, Object> result) {
        Map<String, Double> risks = Map.of(
            "Rot Risk",       toDouble(result.get("rot_risk"), 0),
            "Sprouting Risk", toDouble(result.get("sprouting_risk"), 0),
            "Spoilage Risk",  toDouble(result.get("spoilage_risk"), 0)
        );
        return risks.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(e -> e.getKey() + ": " + String.format("%.1f", e.getValue()) + "%")
            .orElse("Unknown");
    }

    private double toDouble(Object val, double def) {
        if (val instanceof Number n) return n.doubleValue();
        return def;
    }

    private double round(double value, int places) {
        double scale = Math.pow(10, places);
        return Math.round(value * scale) / scale;
    }
}
