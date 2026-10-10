package com.vengai.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "alerts")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Alert {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alert_type", nullable = false, length = 50)
    private String alertType;

    @Column(nullable = false, length = 20)
    private String severity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "current_value")
    private Double currentValue;

    @Column(name = "threshold_value")
    private Double thresholdValue;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    @Column(name = "batch_id", length = 50)
    private String batchId;

    @Column(name = "device_id", length = 50)
    private String deviceId;

    @Column(name = "is_resolved")
    @Builder.Default
    private Boolean isResolved = false;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
