package com.skillforge.dto.response;

import com.skillforge.entity.Exam;
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
public class CourseOverviewResponse {
    private LearningGoal course;

    @Builder.Default
    private List<CourseModuleResponse> modules = new ArrayList<>();

    @Builder.Default
    private List<Exam> assessments = new ArrayList<>();
}
