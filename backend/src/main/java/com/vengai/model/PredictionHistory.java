package com.vengai.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "prediction_history")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PredictionHistory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_id", nullable = false, length = 50)
    private String batchId;

    @Column(name = "rot_risk")
    private Double rotRisk;

    @Column(name = "sprouting_risk")
    private Double sproutingRisk;

    @Column(name = "spoilage_risk")
    private Double spoilageRisk;

    @Column(name = "health_score")
    private Double healthScore;

    @Column(name = "shelf_life_remaining")
    private Double shelfLifeRemaining;

    @Column(name = "estimated_current_weight")
    private Double estimatedCurrentWeight;

    @CreationTimestamp
    @Column(name = "recorded_at")
    private OffsetDateTime recordedAt;
}
