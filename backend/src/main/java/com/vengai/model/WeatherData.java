package com.vengai.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "weather_data")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WeatherData {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String location;

    private Double temperature;
    private Double humidity;

    @Column(name = "feels_like")
    private Double feelsLike;

    private Double pressure;

    @Column(name = "wind_speed")
    private Double windSpeed;

    @Column(length = 100)
    private String condition;

    @Column(name = "condition_icon", length = 10)
    private String conditionIcon;

    @Column(name = "rain_probability")
    private Double rainProbability;

    @Column(name = "forecast_json", columnDefinition = "TEXT")
    private String forecastJson;

    @CreationTimestamp
    @Column(name = "timestamp")
    private OffsetDateTime timestamp;
}
