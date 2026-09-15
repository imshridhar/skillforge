package com.skillforge.dto.response;

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
public class CourseModuleResponse {
    private UUID contentId;
    private String title;
    private String description;
    private Integer durationMinutes;
    private Integer orderIndex;
    private String metadata;

    @Builder.Default
    private List<CourseContentResponse> contents = new ArrayList<>();
}
