package com.vengai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "devices")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Device {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", unique = true, nullable = false, length = 50)
    private String deviceId;

    @Column(length = 100)
    private String name;

    @Column(length = 200)
    private String location;

    @Column(name = "is_online")
    @Builder.Default
    private Boolean isOnline = false;

    @Column(name = "last_seen")
    private OffsetDateTime lastSeen;

    @Column(name = "fan_status")
    @Builder.Default
    private Boolean fanStatus = false;

    @Column(name = "buzzer_status")
    @Builder.Default
    private Boolean buzzerStatus = false;

    @Column(name = "wifi_signal")
    private Double wifiSignal;

    @Column(name = "firmware_version", length = 20)
    private String firmwareVersion;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
