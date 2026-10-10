package com.vengai.dto;

import lombok.*;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SettingsUpdateRequest {
    private Map<String, String> settings;
}
