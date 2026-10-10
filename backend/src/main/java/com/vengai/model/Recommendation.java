package com.vengai.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "recommendations")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Recommendation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_id", length = 50)
    private String batchId;

    @Column(length = 20)
    @Builder.Default
    private String priority = "MEDIUM";

    @Column(length = 50)
    private String category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "TEXT")
    private String action;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
