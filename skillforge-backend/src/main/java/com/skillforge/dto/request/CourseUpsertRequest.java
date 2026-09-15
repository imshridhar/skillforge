package com.skillforge.dto.request;

import com.skillforge.entity.LearningGoal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseUpsertRequest {
    private String title;
    private String description;
    private String subject;
    private LearningGoal.DifficultyLevel difficultyLevel;
    private String prerequisites;
    private String learningOutcomes;

    @Builder.Default
    private List<CourseModuleRequest> modules = new ArrayList<>();
}
