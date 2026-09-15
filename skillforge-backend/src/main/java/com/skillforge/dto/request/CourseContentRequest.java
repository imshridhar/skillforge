package com.skillforge.dto.request;

import com.skillforge.entity.LearningContent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseContentRequest {
    private UUID contentId;
    private String title;
    private LearningContent.ContentType contentType;
    private String contentUrl;
    private String contentText;
    private Integer durationMinutes;
    private String metadata;
}
