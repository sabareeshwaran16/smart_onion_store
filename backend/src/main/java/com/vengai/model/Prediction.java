package com.vengai.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "predictions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Prediction {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_id", nullable = false, length = 50)
    private String batchId;

    @Column(name = "shelf_life_remaining")
    private Double shelfLifeRemaining;

    @Column(name = "weight_loss")
    private Double weightLoss;

    @Column(name = "weight_loss_percentage")
    private Double weightLossPercentage;

    @Column(name = "estimated_current_weight")
    private Double estimatedCurrentWeight;

    @Column(name = "rot_risk")
    private Double rotRisk;

    @Column(name = "sprouting_risk")
    private Double sproutingRisk;

    @Column(name = "spoilage_risk")
    private Double spoilageRisk;

    @Column(name = "health_score")
    private Double healthScore;

    private Double confidence;

    @Column(name = "explanation_json", columnDefinition = "TEXT")
    private String explanationJson;

    @Column(name = "is_demo")
    @Builder.Default
    private Boolean isDemo = false;

    @CreationTimestamp
    @Column(name = "prediction_time")
    private OffsetDateTime predictionTime;
}
