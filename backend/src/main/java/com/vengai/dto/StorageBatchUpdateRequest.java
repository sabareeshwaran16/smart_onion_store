package com.vengai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StorageBatchUpdateRequest {
    @JsonProperty("onion_variety")
    private String onionVariety;

    @JsonProperty("initial_weight")
    private Double initialWeight;

    @JsonProperty("storage_start_date")
    private LocalDate storageStartDate;

    @JsonProperty("expected_retrieval_date")
    private LocalDate expectedRetrievalDate;

    private String location;
    private String warehouse;
    private String notes;

    @JsonProperty("is_active")
    private Boolean isActive;
}
