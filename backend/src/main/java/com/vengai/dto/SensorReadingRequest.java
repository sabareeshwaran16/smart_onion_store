package com.vengai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SensorReadingRequest {
    @NotBlank
    @JsonProperty("device_id")
    private String deviceId;

    @JsonProperty("batch_id")
    private String batchId;

    @DecimalMin("-10.0") @DecimalMax("60.0") @NotNull
    private Double temperature;

    @DecimalMin("0.0") @DecimalMax("100.0") @NotNull
    private Double humidity;

    @DecimalMin("0.0") @NotNull
    @JsonProperty("gas_value")
    private Double gasValue;
}
