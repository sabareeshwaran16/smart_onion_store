package com.vengai.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "fan_logs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FanLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, length = 50)
    private String deviceId;

    @Column(nullable = false)
    private Boolean status;

    @Column(length = 200)
    private String reason;

    @Column(name = "triggered_by", length = 50)
    @Builder.Default
    private String triggeredBy = "AUTO";

    @Column(name = "batch_id", length = 50)
    private String batchId;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
