package com.vengai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "storage_batches")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StorageBatch {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_id", unique = true, nullable = false, length = 50)
    private String batchId;

    @Column(name = "onion_variety", nullable = false, length = 100)
    private String onionVariety;

    @Column(name = "initial_weight", nullable = false)
    private Double initialWeight;

    @Column(name = "storage_start_date", nullable = false)
    private LocalDate storageStartDate;

    @Column(name = "expected_retrieval_date")
    private LocalDate expectedRetrievalDate;

    @Column(length = 200)
    private String location;

    @Column(length = 100)
    private String warehouse;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
