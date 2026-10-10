package com.vengai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "sensor_readings")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SensorReading {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, length = 50)
    private String deviceId;

    @Column(name = "batch_id", length = 50)
    private String batchId;

    @Column(nullable = false)
    private Double temperature;

    @Column(nullable = false)
    private Double humidity;

    @Column(name = "gas_value", nullable = false)
    private Double gasValue;

    @CreationTimestamp
    @Column(name = "timestamp")
    private OffsetDateTime timestamp;
}
