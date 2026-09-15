package com.skillforge.controller;

import com.skillforge.dto.request.CourseModuleRequest;
import com.skillforge.dto.request.CourseUpsertRequest;
import com.skillforge.dto.response.CourseModuleResponse;
import com.skillforge.dto.response.CourseOverviewResponse;
import com.skillforge.dto.response.InstructorAnalyticsResponse;
import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.Exam;
import com.skillforge.entity.LearningContent;
import com.skillforge.entity.LearningGoal;
import com.skillforge.entity.User;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.ExamAttemptRepository;
import com.skillforge.repository.ExamRepository;
import com.skillforge.repository.LearningContentRepository;
import com.skillforge.repository.LearningGoalRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.UserPrincipal;
import com.skillforge.service.CourseStructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/instructor")
@PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
@RequiredArgsConstructor
public class InstructorController {

    private final LearningGoalRepository learningGoalRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final ExamRepository examRepository;
    private final LearningContentRepository learningContentRepository;
    private final CourseStructureService courseStructureService;

    @GetMapping("/goals")
    public ResponseEntity<List<LearningGoal>> getMyGoals(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User instructor = getCurrentInstructor(userPrincipal);
        return ResponseEntity.ok(learningGoalRepository.findByInstructor(instructor));
    }

    @GetMapping("/goals/{goalId}/structure")
    public ResponseEntity<CourseOverviewResponse> getCourseStructure(
            @PathVariable UUID goalId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LearningGoal goal = getOwnedGoal(goalId, userPrincipal);

        return ResponseEntity.ok(CourseOverviewResponse.builder()
                .course(goal)
                .modules(courseStructureService.getCourseStructure(goal))
                .assessments(examRepository.findByCourseGoalId(goalId))
                .build());
    }

    @PostMapping("/goals")
    public ResponseEntity<LearningGoal> createGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CourseUpsertRequest goalRequest) {
        User instructor = getCurrentInstructor(userPrincipal);

        LearningGoal goal = LearningGoal.builder()
                .instructor(instructor)
                .title(goalRequest.getTitle())
                .description(goalRequest.getDescription())
                .subject(goalRequest.getSubject())
                .difficultyLevel(goalRequest.getDifficultyLevel())
                .prerequisites(goalRequest.getPrerequisites())
                .learningOutcomes(goalRequest.getLearningOutcomes())
                .isPublished(false)
                .build();

        LearningGoal savedGoal = learningGoalRepository.save(goal);
        if (goalRequest.getModules() != null) {
            courseStructureService.replaceCourseStructure(savedGoal, goalRequest.getModules());
        }

        return ResponseEntity.ok(savedGoal);
    }

    @PutMapping("/goals/{goalId}")
    public ResponseEntity<LearningGoal> updateGoal(
            @PathVariable UUID goalId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CourseUpsertRequest goalRequest) {
        LearningGoal goal = getOwnedGoal(goalId, userPrincipal);

        goal.setTitle(goalRequest.getTitle());
        goal.setDescription(goalRequest.getDescription());
        goal.setSubject(goalRequest.getSubject());
        goal.setDifficultyLevel(goalRequest.getDifficultyLevel());
        goal.setPrerequisites(goalRequest.getPrerequisites());
        goal.setLearningOutcomes(goalRequest.getLearningOutcomes());

        LearningGoal savedGoal = learningGoalRepository.save(goal);
        if (goalRequest.getModules() != null) {
            courseStructureService.replaceCourseStructure(savedGoal, goalRequest.getModules());
        }

        return ResponseEntity.ok(savedGoal);
    }

    @PostMapping("/goals/{goalId}/publish")
    public ResponseEntity<LearningGoal> publishGoal(
            @PathVariable UUID goalId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LearningGoal goal = getOwnedGoal(goalId, userPrincipal);
        goal.setIsPublished(true);
        return ResponseEntity.ok(learningGoalRepository.save(goal));
    }

    @DeleteMapping("/goals/{goalId}")
    public ResponseEntity<Map<String, String>> deleteGoal(
            @PathVariable UUID goalId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LearningGoal goal = getOwnedGoal(goalId, userPrincipal);
        learningGoalRepository.delete(goal);
        return ResponseEntity.ok(Map.of("message", "Goal deleted successfully"));
    }

    @PostMapping("/goals/{goalId}/modules")
    public ResponseEntity<CourseModuleResponse> addModule(
            @PathVariable UUID goalId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CourseModuleRequest moduleRequest) {
        LearningGoal goal = getOwnedGoal(goalId, userPrincipal);

        int nextIndex = learningContentRepository.findByGoalAndParentContentIsNullOrderByOrderIndexAsc(goal).size() + 1;

        LearningContent module = learningContentRepository.save(LearningContent.builder()
                .goal(goal)
                .title(moduleRequest.getTitle())
                .contentType(LearningContent.ContentType.MODULE)
                .contentText(moduleRequest.getDescription())
                .durationMinutes(moduleRequest.getDurationMinutes())
                .difficultyLevel(goal.getDifficultyLevel())
                .orderIndex(nextIndex)
                .metadata(moduleRequest.getMetadata())
                .build());

        if (moduleRequest.getContents() != null) {
            for (int index = 0; index < moduleRequest.getContents().size(); index++) {
                var contentRequest = moduleRequest.getContents().get(index);
                learningContentRepository.save(LearningContent.builder()
                        .goal(goal)
                        .parentContent(module)
                        .title(contentRequest.getTitle())
                        .contentType(contentRequest.getContentType() == null
                                ? LearningContent.ContentType.TEXT
                                : contentRequest.getContentType())
                        .contentUrl(contentRequest.getContentUrl())
                        .contentText(contentRequest.getContentText())
                        .durationMinutes(contentRequest.getDurationMinutes())
                        .difficultyLevel(goal.getDifficultyLevel())
                        .orderIndex(index + 1)
                        .metadata(contentRequest.getMetadata())
                        .build());
            }
        }

        return ResponseEntity.ok(courseStructureService.getCourseStructure(goal).stream()
                .filter(item -> item.getContentId().equals(module.getContentId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Module not found")));
    }

    @PutMapping("/modules/{moduleId}")
    public ResponseEntity<CourseModuleResponse> updateModule(
            @PathVariable UUID moduleId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CourseModuleRequest moduleRequest) {
        LearningContent module = learningContentRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        if (module.getParentContent() != null) {
            throw new RuntimeException("Only top-level modules can be updated with this endpoint");
        }

        getOwnedGoal(module.getGoal().getGoalId(), userPrincipal);

        module.setTitle(moduleRequest.getTitle());
        module.setContentText(moduleRequest.getDescription());
        module.setDurationMinutes(moduleRequest.getDurationMinutes());
        module.setMetadata(moduleRequest.getMetadata());
        learningContentRepository.save(module);

        return ResponseEntity.ok(courseStructureService.getCourseStructure(module.getGoal()).stream()
                .filter(item -> item.getContentId().equals(moduleId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Module not found")));
    }

    @DeleteMapping("/modules/{moduleId}")
    public ResponseEntity<Map<String, String>> deleteModule(
            @PathVariable UUID moduleId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LearningContent module = learningContentRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        if (module.getParentContent() != null) {
            throw new RuntimeException("Only top-level modules can be deleted with this endpoint");
        }

        LearningGoal goal = getOwnedGoal(module.getGoal().getGoalId(), userPrincipal);
        learningContentRepository.delete(module);

        List<LearningContent> remaining = learningContentRepository.findByGoalAndParentContentIsNullOrderByOrderIndexAsc(goal);
        for (int index = 0; index < remaining.size(); index++) {
            remaining.get(index).setOrderIndex(index + 1);
        }
        learningContentRepository.saveAll(remaining);

        return ResponseEntity.ok(Map.of("message", "Module deleted successfully"));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User instructor = getCurrentInstructor(userPrincipal);
        List<LearningGoal> courses = learningGoalRepository.findByInstructor(instructor);
        List<Enrollment> allEnrollments = enrollmentRepository.findByGoalIn(courses);

        List<Map<String, Object>> activeCourses = new ArrayList<>();
        BigDecimal totalProgress = BigDecimal.ZERO;
        int enrollmentCount = 0;

        for (LearningGoal course : courses) {
            List<Enrollment> courseEnrollments = allEnrollments.stream()
                    .filter(enrollment -> enrollment.getGoal().getGoalId().equals(course.getGoalId()))
                    .toList();

            BigDecimal averageScore = BigDecimal.ZERO;
            if (!courseEnrollments.isEmpty()) {
                BigDecimal sum = courseEnrollments.stream()
                        .map(Enrollment::getProgressPercentage)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                averageScore = sum.divide(BigDecimal.valueOf(courseEnrollments.size()), 1, RoundingMode.HALF_UP);
                totalProgress = totalProgress.add(sum);
                enrollmentCount += courseEnrollments.size();
            }

            Map<String, Object> courseMap = new HashMap<>();
            courseMap.put("id", course.getGoalId());
            courseMap.put("title", course.getTitle());
            courseMap.put("initial", course.getTitle().substring(0, 1));
            courseMap.put("enrolled", courseEnrollments.size());
            courseMap.put("avgScore", averageScore);
            courseMap.put("difficulty", course.getDifficultyLevel().name());
            courseMap.put("updated", course.getUpdatedAt() != null ? course.getUpdatedAt().toString() : "N/A");
            courseMap.put("moduleCount", courseStructureService.getCourseStructure(course).size());
            activeCourses.add(courseMap);
        }

        BigDecimal averageProgress = enrollmentCount > 0
                ? totalProgress.divide(BigDecimal.valueOf(enrollmentCount), 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<Exam> draftExams = examRepository.findByInstructorUserId(instructor.getUserId()).stream()
                .filter(exam -> exam.getStatus() == Exam.ExamStatus.DRAFT)
                .toList();

        List<Map<String, Object>> pendingItems = draftExams.stream()
                .map(exam -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("title", exam.getTitle());
                    item.put("type", "Draft Exam");
                    item.put("duration", exam.getDurationMinutes() + " mins");
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("avgProgress", averageProgress);
        stats.put("pendingApprovals", draftExams.size());

        Map<String, Object> result = new HashMap<>();
        result.put("activeCourses", activeCourses);
        result.put("stats", stats);
        result.put("pendingItems", pendingItems);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/analytics")
    public ResponseEntity<InstructorAnalyticsResponse> getAnalytics(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User instructor = getCurrentInstructor(userPrincipal);
        List<LearningGoal> courses = learningGoalRepository.findByInstructor(instructor);
        List<Enrollment> enrollments = enrollmentRepository.findByGoalIn(courses);
        List<ExamAttempt> attempts = examAttemptRepository.findByExamInstructorUserId(instructor.getUserId());

        Map<UUID, List<Enrollment>> enrollmentsByCourse = enrollments.stream()
                .collect(Collectors.groupingBy(enrollment -> enrollment.getGoal().getGoalId()));
        Map<UUID, List<ExamAttempt>> attemptsByCourse = attempts.stream()
                .filter(attempt -> attempt.getExam().getCourse() != null)
                .collect(Collectors.groupingBy(attempt -> attempt.getExam().getCourse().getGoalId()));

        List<InstructorAnalyticsResponse.CourseAnalytics> courseAnalytics = courses.stream()
                .map(course -> {
                    List<Enrollment> courseEnrollments = enrollmentsByCourse.getOrDefault(course.getGoalId(), List.of());
                    List<ExamAttempt> courseAttempts = attemptsByCourse.getOrDefault(course.getGoalId(), List.of());

                    int totalEnrolled = courseEnrollments.size();
                    int completedCount = (int) courseEnrollments.stream()
                            .filter(enrollment -> enrollment.getStatus() == Enrollment.EnrollmentStatus.COMPLETED
                                    || enrollment.getProgressPercentage().compareTo(BigDecimal.valueOf(100)) >= 0)
                            .count();

                    double avgProgress = courseEnrollments.isEmpty()
                            ? 0.0
                            : courseEnrollments.stream()
                                    .map(Enrollment::getProgressPercentage)
                                    .map(BigDecimal::doubleValue)
                                    .mapToDouble(Double::doubleValue)
                                    .average()
                                    .orElse(0.0);

                    List<ExamAttempt> gradedAttempts = courseAttempts.stream()
                            .filter(attempt -> attempt.getStatus() == ExamAttempt.AttemptStatus.COMPLETED)
                            .filter(attempt -> attempt.getExam().getExamType() != Exam.ExamType.PRACTICE)
                            .toList();

                    double avgExamScore = gradedAttempts.isEmpty()
                            ? 0.0
                            : gradedAttempts.stream()
                                    .map(ExamAttempt::getScore)
                                    .filter(Objects::nonNull)
                                    .mapToDouble(Double::doubleValue)
                                    .average()
                                    .orElse(0.0);

                    return new InstructorAnalyticsResponse.CourseAnalytics(
                            course.getGoalId(),
                            course.getTitle(),
                            totalEnrolled,
                            Math.round(avgProgress * 10.0) / 10.0,
                            completedCount,
                            Math.round(avgExamScore * 10.0) / 10.0,
                            gradedAttempts.size());
                })
                .toList();

        List<InstructorAnalyticsResponse.LearnerAnalytics> learnerAnalytics = enrollments.stream()
                .map(enrollment -> new InstructorAnalyticsResponse.LearnerAnalytics(
                        enrollment.getLearner().getUserId(),
                        enrollment.getLearner().getFirstName() + " " + enrollment.getLearner().getLastName(),
                        enrollment.getLearner().getEmail(),
                        enrollment.getGoal().getGoalId(),
                        enrollment.getGoal().getTitle(),
                        enrollment.getProgressPercentage().doubleValue(),
                        enrollment.getStatus().name()))
                .toList();

        int totalStudents = (int) enrollments.stream()
                .map(enrollment -> enrollment.getLearner().getUserId())
                .distinct()
                .count();
        int totalCompleted = (int) enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.EnrollmentStatus.COMPLETED)
                .count();
        double avgProgress = enrollments.isEmpty()
                ? 0.0
                : enrollments.stream()
                        .map(Enrollment::getProgressPercentage)
                        .map(BigDecimal::doubleValue)
                        .mapToDouble(Double::doubleValue)
                        .average()
                        .orElse(0.0);

        List<ExamAttempt> gradedAttempts = attempts.stream()
                .filter(attempt -> attempt.getStatus() == ExamAttempt.AttemptStatus.COMPLETED)
                .filter(attempt -> attempt.getExam().getExamType() != Exam.ExamType.PRACTICE)
                .toList();
        double avgExamScore = gradedAttempts.isEmpty()
                ? 0.0
                : gradedAttempts.stream()
                        .map(ExamAttempt::getScore)
                        .filter(Objects::nonNull)
                        .mapToDouble(Double::doubleValue)
                        .average()
                        .orElse(0.0);

        InstructorAnalyticsResponse.Summary summary = new InstructorAnalyticsResponse.Summary(
                totalStudents,
                totalCompleted,
                Math.round(avgProgress * 10.0) / 10.0,
                Math.round(avgExamScore * 10.0) / 10.0);

        return ResponseEntity.ok(new InstructorAnalyticsResponse(courseAnalytics, learnerAnalytics, summary));
    }

    private User getCurrentInstructor(UserPrincipal userPrincipal) {
        return userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private LearningGoal getOwnedGoal(UUID goalId, UserPrincipal userPrincipal) {
        LearningGoal goal = learningGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getInstructor().getEmail().equals(userPrincipal.getEmail())) {
            throw new RuntimeException("Not authorized to modify this goal");
        }

        return goal;
    }
}
