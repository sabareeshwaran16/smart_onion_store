package com.vengai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StorageBatchCreateRequest {
    @NotBlank
    @JsonProperty("batch_id")
    private String batchId;

    @NotBlank
    @JsonProperty("onion_variety")
    private String onionVariety;

    @Positive @NotNull
    @JsonProperty("initial_weight")
    private Double initialWeight;

    @NotNull
    @JsonProperty("storage_start_date")
    private LocalDate storageStartDate;

    @JsonProperty("expected_retrieval_date")
    private LocalDate expectedRetrievalDate;

    private String location;
    private String warehouse;
    private String notes;
}
