package com.skillforge.dto.response;

import java.util.List;
import java.util.UUID;

public record InstructorAnalyticsResponse(
        List<CourseAnalytics> courses,
        List<LearnerAnalytics> learners,
        Summary summary
) {
    public record CourseAnalytics(
            UUID goalId,
            String title,
            int totalEnrolled,
            double avgProgress,
            int completedCount,
            double avgExamScore,
            int attemptsCount
    ) {
    }

    public record LearnerAnalytics(
            UUID learnerId,
            String name,
            String email,
            UUID courseId,
            String courseTitle,
            double progress,
            String status
    ) {
    }

    public record Summary(
            int totalStudents,
            int totalCompleted,
            double avgProgress,
            double avgExamScore
    ) {
    }
}
