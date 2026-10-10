package com.vengai.service;

import com.vengai.model.*;
import com.vengai.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class DecisionEngine {

    private static final Logger log = LoggerFactory.getLogger(DecisionEngine.class);

    private final SystemSettingsRepository settingsRepo;
    private final DeviceRepository deviceRepo;
    private final FanLogRepository fanLogRepo;
    private final AlertRepository alertRepo;
    private final RecommendationRepository recRepo;

    private static final Map<String, String> DEFAULT_SETTINGS = Map.ofEntries(
        Map.entry("temp_warning_threshold",         "30.0"),
        Map.entry("temp_critical_threshold",        "35.0"),
        Map.entry("humidity_warning_threshold",     "75.0"),
        Map.entry("humidity_critical_threshold",    "85.0"),
        Map.entry("gas_warning_threshold",          "400.0"),
        Map.entry("gas_critical_threshold",         "700.0"),
        Map.entry("rot_risk_warning_threshold",     "40.0"),
        Map.entry("rot_risk_critical_threshold",    "60.0"),
        Map.entry("sprouting_risk_warning_threshold","40.0"),
        Map.entry("spoilage_risk_warning_threshold","40.0"),
        Map.entry("spoilage_risk_critical_threshold","60.0"),
        Map.entry("fan_auto_mode",                  "true")
    );

    public DecisionEngine(SystemSettingsRepository settingsRepo, DeviceRepository deviceRepo,
                          FanLogRepository fanLogRepo, AlertRepository alertRepo,
                          RecommendationRepository recRepo) {
        this.settingsRepo = settingsRepo;
        this.deviceRepo   = deviceRepo;
        this.fanLogRepo   = fanLogRepo;
        this.alertRepo    = alertRepo;
        this.recRepo      = recRepo;
    }

    @Transactional
    public Map<String, Object> evaluateAndAct(Map<String, Object> sensor,
                                               Map<String, Object> prediction,
                                               Map<String, Object> weather,
                                               String batchId,
                                               String deviceId) {
        double temp     = toDouble(sensor.get("temperature"), 25.0);
        double humidity = toDouble(sensor.get("humidity"), 65.0);
        double gas      = toDouble(sensor.get("gas_value"), 200.0);

        boolean fanRequired    = false;
        boolean buzzerRequired = false;
        List<String> reasons   = new ArrayList<>();

        boolean autoMode = getBooleanSetting("fan_auto_mode");

        if (autoMode) {
            double tempWarn = getThreshold("temp_warning_threshold");
            double humWarn  = getThreshold("humidity_warning_threshold");
            double gasWarn  = getThreshold("gas_warning_threshold");

            if (temp > tempWarn) { fanRequired = true; reasons.add("Temperature elevated (" + temp + "°C > " + tempWarn + "°C)"); }
            if (humidity > humWarn) { fanRequired = true; reasons.add("High humidity (" + humidity + "% > " + humWarn + "%)"); }
            if (gas > gasWarn) { fanRequired = true; reasons.add("Elevated gas (" + (int)gas + " > " + (int)gasWarn + ")"); }

            if (prediction != null) {
                double spoilage = toDouble(prediction.get("spoilage_risk"), 0.0);
                double spoilCrit = getThreshold("spoilage_risk_critical_threshold");
                if (spoilage > spoilCrit) { fanRequired = true; buzzerRequired = true; reasons.add("Critical spoilage risk (" + spoilage + "%)"); }
            }
        }

        // Update device state
        Optional<Device> devOpt = deviceRepo.findByDeviceId(deviceId);
        if (devOpt.isPresent()) {
            Device device = devOpt.get();
            if (!Objects.equals(device.getFanStatus(), fanRequired)) {
                String reason = reasons.isEmpty()
                    ? (fanRequired ? "Auto mode: Triggered ON" : "Auto mode: Conditions optimal — Fan OFF")
                    : String.join("; ", reasons);
                FanLog fanLog = FanLog.builder().deviceId(deviceId).status(fanRequired).reason(reason).triggeredBy("AUTO").batchId(batchId).build();
                fanLogRepo.save(fanLog);
                device.setFanStatus(fanRequired);
                device.setBuzzerStatus(buzzerRequired);
                deviceRepo.save(device);
                log.info("Fan {} — Reason: {}", fanRequired ? "ON" : "OFF", reason);
            }
        }

        processAlerts(sensor, prediction, batchId, deviceId);
        processRecommendations(sensor, prediction, batchId);

        return Map.of("fan_required", fanRequired, "buzzer_required", buzzerRequired, "reasons", reasons);
    }

    @Transactional
    public void processAlerts(Map<String, Object> sensor, Map<String, Object> prediction,
                               String batchId, String deviceId) {
        double temp     = toDouble(sensor.get("temperature"), 25.0);
        double humidity = toDouble(sensor.get("humidity"), 65.0);
        double gas      = toDouble(sensor.get("gas_value"), 200.0);

        List<Object[]> checks = new ArrayList<>(List.of(
            new Object[]{"HIGH_TEMPERATURE", temp,     getThreshold("temp_warning_threshold"),     getThreshold("temp_critical_threshold"),     "High temperature detected",            "Engage ventilation during cooler hours."},
            new Object[]{"HIGH_HUMIDITY",    humidity, getThreshold("humidity_warning_threshold"),  getThreshold("humidity_critical_threshold"),  "High humidity in storage environment", "Run exhaust ventilation."},
            new Object[]{"HIGH_GAS",         gas,      getThreshold("gas_warning_threshold"),       getThreshold("gas_critical_threshold"),       "Elevated gas/ethylene accumulation",   "Improve airflow immediately."}
        ));

        if (prediction != null) {
            double rotRisk    = toDouble(prediction.get("rot_risk"), 0);
            double spoilRisk  = toDouble(prediction.get("spoilage_risk"), 0);
            double sproutRisk = toDouble(prediction.get("sprouting_risk"), 0);
            checks.add(new Object[]{"HIGH_ROT_RISK",      rotRisk,   getThreshold("rot_risk_warning_threshold"),     getThreshold("rot_risk_critical_threshold"),     "Elevated rot risk predicted by AI",   "Inspect batch and increase airflow."});
            checks.add(new Object[]{"HIGH_SPOILAGE_RISK", spoilRisk, getThreshold("spoilage_risk_warning_threshold"), getThreshold("spoilage_risk_critical_threshold"), "High spoilage risk forecasted",       "Consider early market sale."});
            checks.add(new Object[]{"HIGH_SPROUTING_RISK",sproutRisk,getThreshold("sprouting_risk_warning_threshold"),40.0,                                              "Sprouting risk rising",              "Inspect for neck sprouting."});
        }

        for (Object[] check : checks) {
            String alertType = (String) check[0];
            double currentVal = (double) check[1];
            double warnLimit  = (double) check[2];
            double critLimit  = (double) check[3];
            String baseMsg    = (String) check[4];
            String advice     = (String) check[5];

            String severity;
            if (currentVal >= critLimit) severity = "CRITICAL";
            else if (currentVal >= warnLimit) severity = "WARNING";
            else continue;

            Optional<Alert> existing = alertRepo.findTopByAlertTypeAndBatchIdAndIsResolvedFalse(alertType, batchId);
            if (existing.isPresent()) {
                Alert a = existing.get();
                a.setCurrentValue(currentVal);
                a.setSeverity(severity);
                alertRepo.save(a);
            } else {
                Alert a = Alert.builder()
                    .alertType(alertType).severity(severity)
                    .message(baseMsg + " (Current: " + String.format("%.1f", currentVal) + ")")
                    .currentValue(currentVal).thresholdValue(warnLimit)
                    .recommendation(advice).batchId(batchId).deviceId(deviceId)
                    .isResolved(false).build();
                alertRepo.save(a);
            }
        }
    }

    @Transactional
    public void processRecommendations(Map<String, Object> sensor, Map<String, Object> prediction, String batchId) {
        double temp     = toDouble(sensor.get("temperature"), 25.0);
        double humidity = toDouble(sensor.get("humidity"), 65.0);

        List<Recommendation> recs = new ArrayList<>();

        if (humidity > 75) {
            recs.add(Recommendation.builder().batchId(batchId).priority("HIGH").category("VENTILATION")
                .title("High Storage Humidity – Increase Ventilation")
                .message("Current humidity is " + String.format("%.1f", humidity) + "%. Sustained moisture promotes fungal development.")
                .action("Activate exhaust fans and verify air intake louvers are unobstructed.").isActive(true).build());
        }
        if (temp > 30) {
            recs.add(Recommendation.builder().batchId(batchId).priority("HIGH").category("TEMPERATURE")
                .title("Elevated Temperature – Cool Storage Area")
                .message("Temperature is " + String.format("%.1f", temp) + "°C, above ideal storage range (22–28°C).")
                .action("Run ventilation during cooler night/morning hours.").isActive(true).build());
        }
        if (prediction != null) {
            double shelfLife = toDouble(prediction.get("shelf_life_remaining"), 180.0);
            double rotRisk   = toDouble(prediction.get("rot_risk"), 0.0);
            if (shelfLife < 30) {
                recs.add(Recommendation.builder().batchId(batchId).priority("CRITICAL").category("RETRIEVAL")
                    .title("Low Remaining Shelf Life – Plan Retrieval")
                    .message("Estimated shelf life is approximately " + (int)shelfLife + " days.")
                    .action("Prioritize this batch for market delivery.").isActive(true).build());
            }
            if (rotRisk > 50) {
                recs.add(Recommendation.builder().batchId(batchId).priority("CRITICAL").category("INSPECTION")
                    .title("Critical Rot Risk – Physical Inspection Required")
                    .message("Rot risk has reached " + String.format("%.1f", rotRisk) + "%.")
                    .action("Inspect and isolate deteriorating bulbs.").isActive(true).build());
            } else if (rotRisk > 30) {
                recs.add(Recommendation.builder().batchId(batchId).priority("HIGH").category("INSPECTION")
                    .title("Elevated Rot Risk – Monitor Storage")
                    .message("Rot risk is rising (" + String.format("%.1f", rotRisk) + "%).")
                    .action("Increase air circulation and check bottom crate aeration.").isActive(true).build());
            }
        }
        if (recs.isEmpty()) {
            recs.add(Recommendation.builder().batchId(batchId).priority("LOW").category("STATUS")
                .title("Storage Microclimate Is Optimal")
                .message("Temperature, humidity, and gas are all within safe parameters.")
                .action("Continue standard monitoring.").isActive(true).build());
        }

        // Deactivate previous recs for this batch
        List<Recommendation> old = batchId != null ? recRepo.findByBatchIdAndIsActiveTrue(batchId) : recRepo.findByIsActiveTrue();
        old.forEach(r -> { r.setIsActive(false); recRepo.save(r); });

        recRepo.saveAll(recs);
    }

    public double getThreshold(String key) {
        return settingsRepo.findByKey(key)
            .map(s -> { try { return Double.parseDouble(s.getValue()); } catch (NumberFormatException e) { return getDefault(key); } })
            .orElseGet(() -> getDefault(key));
    }

    private boolean getBooleanSetting(String key) {
        return settingsRepo.findByKey(key)
            .map(s -> s.getValue().strip().equalsIgnoreCase("true") || s.getValue().strip().equals("1"))
            .orElse(true);
    }

    private double getDefault(String key) {
        String val = DEFAULT_SETTINGS.getOrDefault(key, "0");
        try { return Double.parseDouble(val); } catch (NumberFormatException e) { return 0.0; }
    }

    private double toDouble(Object val, double def) {
        if (val instanceof Number n) return n.doubleValue();
        return def;
    }
}
