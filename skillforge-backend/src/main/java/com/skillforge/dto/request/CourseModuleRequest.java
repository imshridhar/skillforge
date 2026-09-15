package com.skillforge.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseModuleRequest {
    private UUID contentId;
    private String title;
    private String description;
    private Integer durationMinutes;
    private String metadata;

    @Builder.Default
    private List<CourseContentRequest> contents = new ArrayList<>();
}
