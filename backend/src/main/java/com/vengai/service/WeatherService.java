package com.vengai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private static final long CACHE_TTL_MS = 30 * 60 * 1000L;

    @Value("${weather.api-key:}")
    private String apiKey;

    @Value("${weather.location:Chennai,IN}")
    private String location;

    @Value("${weather.base-url:https://api.openweathermap.org/data/2.5}")
    private String baseUrl;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    private Map<String, Object> weatherCache;
    private long cacheTimestamp = 0;

    public WeatherService(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    private boolean isCacheValid() {
        return weatherCache != null && (System.currentTimeMillis() - cacheTimestamp) < CACHE_TTL_MS;
    }

    public Map<String, Object> fetchCurrentWeather() {
        if (isCacheValid()) return weatherCache;

        if (apiKey == null || apiKey.isBlank()) {
            log.info("OpenWeather API key not set — using baseline.");
            weatherCache = defaultWeatherBaseline();
            cacheTimestamp = System.currentTimeMillis();
            return weatherCache;
        }

        try {
            String url = baseUrl + "/weather?q=" + location + "&appid=" + apiKey + "&units=metric";
            String json = restClient.get().uri(url).retrieve().body(String.class);
            JsonNode data = objectMapper.readTree(json);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("temperature", round(data.path("main").path("temp").asDouble(), 1));
            result.put("humidity",    round(data.path("main").path("humidity").asDouble(), 1));
            result.put("feels_like",  round(data.path("main").path("feels_like").asDouble(), 1));
            result.put("pressure",    round(data.path("main").path("pressure").asDouble(), 1));
            result.put("wind_speed",  round(data.path("wind").path("speed").asDouble(), 1));
            String desc = data.path("weather").get(0).path("description").asText("Partly Cloudy");
            result.put("condition", toTitleCase(desc));
            result.put("condition_icon", data.path("weather").get(0).path("icon").asText("02d"));
            result.put("rain_probability", 0.0);
            result.put("location", data.path("name").asText(location));
            result.put("is_demo", false);

            weatherCache = result;
            cacheTimestamp = System.currentTimeMillis();
            return result;
        } catch (Exception e) {
            log.warn("OpenWeather API error: {}. Using baseline.", e.getMessage());
            weatherCache = defaultWeatherBaseline();
            cacheTimestamp = System.currentTimeMillis();
            return weatherCache;
        }
    }

    public List<Map<String, Object>> fetchForecast() {
        if (apiKey == null || apiKey.isBlank()) {
            return defaultForecastBaseline();
        }
        try {
            String url = baseUrl + "/forecast?q=" + location + "&appid=" + apiKey + "&units=metric&cnt=40";
            String json = restClient.get().uri(url).retrieve().body(String.class);
            JsonNode root = objectMapper.readTree(json);
            JsonNode list = root.path("list");

            Map<String, Map<String, Object>> dailyMap = new LinkedHashMap<>();
            for (JsonNode entry : list) {
                long dt = entry.path("dt").asLong();
                LocalDate day = Instant.ofEpochSecond(dt).atZone(ZoneOffset.UTC).toLocalDate();
                String dayKey = day.toString();
                if (!dailyMap.containsKey(dayKey)) {
                    Map<String, Object> d = new LinkedHashMap<>();
                    d.put("date", dayKey);
                    d.put("day_name", day.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH));
                    d.put("temp_min", entry.path("main").path("temp_min").asDouble());
                    d.put("temp_max", entry.path("main").path("temp_max").asDouble());
                    d.put("humidity", entry.path("main").path("humidity").asDouble());
                    d.put("rain_probability", round(entry.path("pop").asDouble(0) * 100, 1));
                    d.put("wind_speed", entry.path("wind").path("speed").asDouble());
                    d.put("condition", toTitleCase(entry.path("weather").get(0).path("description").asText()));
                    d.put("condition_icon", entry.path("weather").get(0).path("icon").asText());
                    dailyMap.put(dayKey, d);
                } else {
                    Map<String, Object> d = dailyMap.get(dayKey);
                    d.put("temp_min", Math.min((double) d.get("temp_min"), entry.path("main").path("temp_min").asDouble()));
                    d.put("temp_max", Math.max((double) d.get("temp_max"), entry.path("main").path("temp_max").asDouble()));
                    d.put("rain_probability", Math.max((double) d.get("rain_probability"), round(entry.path("pop").asDouble(0) * 100, 1)));
                }
            }
            return new ArrayList<>(dailyMap.values()).subList(0, Math.min(5, dailyMap.size()));
        } catch (Exception e) {
            log.warn("Forecast API error: {}", e.getMessage());
            return defaultForecastBaseline();
        }
    }

    public Map<String, Object> assessWeatherImpact(Map<String, Object> indoor, Map<String, Object> outdoor) {
        List<Map<String, Object>> impacts = new ArrayList<>();
        String severity = "LOW";

        double outdoorHum = toDouble(outdoor.get("humidity"), 65.0);
        double indoorHum  = toDouble(indoor.get("humidity"), 65.0);
        double outdoorTemp = toDouble(outdoor.get("temperature"), 30.0);
        double indoorTemp  = toDouble(indoor.get("temperature"), 28.0);
        double rainProb    = toDouble(outdoor.get("rain_probability"), 20.0);

        if (outdoorHum > 80) {
            impacts.add(Map.of("factor", "High Outdoor Humidity",
                "outdoor_value", outdoorHum + "%", "indoor_value", indoorHum + "%",
                "impact", "Excess moisture may infiltrate storage.",
                "recommendation", "Keep intake vents throttled."));
            severity = "HIGH";
        } else if (outdoorHum > 70) {
            impacts.add(Map.of("factor", "Elevated Outdoor Humidity",
                "outdoor_value", outdoorHum + "%", "indoor_value", indoorHum + "%",
                "impact", "Monitor indoor humidity closely.",
                "recommendation", "Check indoor sensors regularly."));
            if (severity.equals("LOW")) severity = "MEDIUM";
        }
        if (rainProb > 60) {
            impacts.add(Map.of("factor", "High Rain Probability",
                "outdoor_value", rainProb + "%", "indoor_value", "N/A",
                "impact", "Precipitation increases ambient moisture.",
                "recommendation", "Ensure drainage is clear."));
            if (severity.equals("LOW")) severity = "MEDIUM";
        }
        if (outdoorTemp > 35) {
            impacts.add(Map.of("factor", "Elevated Outdoor Heat",
                "outdoor_value", outdoorTemp + "°C", "indoor_value", indoorTemp + "°C",
                "impact", "High heat accelerates respiration and moisture loss.",
                "recommendation", "Run ventilation during cooler hours."));
            severity = "HIGH";
        }
        if (impacts.isEmpty()) {
            impacts.add(Map.of("factor", "Favorable Ambient Conditions",
                "outdoor_value", outdoorTemp + "°C / " + outdoorHum + "%",
                "indoor_value", indoorTemp + "°C / " + indoorHum + "%",
                "impact", "Ambient conditions aligned with optimal storage parameters.",
                "recommendation", "Continue standard scheduled ventilation."));
        }
        return Map.of("severity", severity, "impacts", impacts);
    }

    private Map<String, Object> defaultWeatherBaseline() {
        return Map.of(
            "temperature", 31.5, "humidity", 65.0, "feels_like", 33.0,
            "pressure", 1010.0, "wind_speed", 4.5,
            "condition", "Partly Cloudy", "condition_icon", "02d",
            "rain_probability", 15.0, "location", location, "is_demo", true
        );
    }

    private List<Map<String, Object>> defaultForecastBaseline() {
        Object[][] patterns = {
            {"Partly Cloudy","02d",24.0,33.0,62.0,10.0,4.0},
            {"Sunny","01d",25.0,34.5,58.0,5.0,3.5},
            {"Overcast","04d",23.5,31.0,68.0,25.0,5.0},
            {"Light Rain","10d",22.0,29.5,76.0,45.0,6.0},
            {"Sunny","01d",24.5,33.5,60.0,10.0,4.2}
        };
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        for (int i = 0; i < patterns.length; i++) {
            LocalDate day = today.plusDays(i + 1);
            result.add(Map.of(
                "date", day.toString(),
                "day_name", day.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                "temp_min", patterns[i][2], "temp_max", patterns[i][3],
                "humidity", patterns[i][4], "rain_probability", patterns[i][5],
                "wind_speed", patterns[i][6], "condition", patterns[i][0],
                "condition_icon", patterns[i][1]
            ));
        }
        return result;
    }

    private double round(double value, int places) {
        double scale = Math.pow(10, places);
        return Math.round(value * scale) / scale;
    }

    private double toDouble(Object val, double def) {
        if (val instanceof Number n) return n.doubleValue();
        return def;
    }

    private String toTitleCase(String s) {
        if (s == null || s.isBlank()) return s;
        String[] words = s.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
        }
        return sb.toString().trim();
    }
}
