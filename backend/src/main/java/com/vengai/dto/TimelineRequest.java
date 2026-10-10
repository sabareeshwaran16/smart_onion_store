package com.vengai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Arrays;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TimelineRequest {
    @NotBlank
    @JsonProperty("batch_id")
    private String batchId;

    @JsonProperty("days_list")
    @Builder.Default
    private List<Integer> daysList = Arrays.asList(7, 15, 30, 60, 90, 120, 150, 180);
}
