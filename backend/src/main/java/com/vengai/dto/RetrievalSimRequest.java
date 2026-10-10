package com.vengai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RetrievalSimRequest {
    @NotBlank
    @JsonProperty("batch_id")
    private String batchId;

    @Min(1) @Max(365) @NotNull
    @JsonProperty("retrieval_after_days")
    private Integer retrievalAfterDays;
}
