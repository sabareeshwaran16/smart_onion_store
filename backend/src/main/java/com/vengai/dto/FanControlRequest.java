package com.vengai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FanControlRequest {
    @JsonProperty("device_id")
    @Builder.Default
    private String deviceId = "ESP32_001";

    @NotNull
    private Boolean status;

    @Builder.Default
    private String reason = "Manual control";

    @JsonProperty("triggered_by")
    @Builder.Default
    private String triggeredBy = "MANUAL";
}
