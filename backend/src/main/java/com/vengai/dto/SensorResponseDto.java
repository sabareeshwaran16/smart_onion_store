package com.vengai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SensorResponseDto {
    private boolean success;
    @JsonProperty("fan_required")
    private boolean fanRequired;
    @JsonProperty("buzzer_required")
    private boolean buzzerRequired;
    private String message;
}
