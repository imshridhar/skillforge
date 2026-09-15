package com.skillforge.controller;

import com.skillforge.dto.response.CourseOverviewResponse;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.Exam;
import com.skillforge.entity.ContentProgress;
import com.skillforge.entity.CourseCertificate;
import com.skillforge.entity.LearningContent;
import com.skillforge.entity.LearningGoal;
import com.skillforge.entity.User;
import com.skillforge.repository.ContentProgressRepository;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.ExamRepository;
import com.skillforge.repository.LearningContentRepository;
import com.skillforge.repository.LearningGoalRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.UserPrincipal;
import com.skillforge.service.CertificateService;
import com.skillforge.service.CourseStructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/learner")
@PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
@RequiredArgsConstructor
public class LearnerController {

    private final LearningGoalRepository learningGoalRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final LearningContentRepository learningContentRepository;
    private final ContentProgressRepository contentProgressRepository;
    private final CourseStructureService courseStructureService;
    private final CertificateService certificateService;

    @GetMapping("/goals")
    public ResponseEntity<Page<LearningGoal>> getPublishedGoals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(learningGoalRepository.findByIsPublishedTrue(PageRequest.of(page, size)));
    }

    @GetMapping("/goals/{goalId}")
    public ResponseEntity<LearningGoal> getGoalById(@PathVariable UUID goalId) {
        LearningGoal goal = learningGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        return ResponseEntity.ok(goal);
    }

    @GetMapping("/goals/{goalId}/overview")
    public ResponseEntity<CourseOverviewResponse> getGoalOverview(
            @PathVariable UUID goalId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        LearningGoal goal = learningGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        boolean enrolled = enrollmentRepository.existsByLearnerAndGoal(learner, goal);
        if (!goal.getIsPublished() && !enrolled) {
            throw new RuntimeException("Not authorized to view this course");
        }

        List<Exam> assessments = enrolled
                ? examRepository.findByCourseGoalId(goalId)
                : examRepository.findByCourseGoalId(goalId).stream()
                        .filter(exam -> exam.getStatus() == Exam.ExamStatus.PUBLISHED)
                        .toList();

        return ResponseEntity.ok(CourseOverviewResponse.builder()
                .course(goal)
                .modules(courseStructureService.getCourseStructure(goal))
                .assessments(assessments)
                .build());
    }

    @GetMapping("/goals/{goalId}/modules")
    public ResponseEntity<List<LearningContent>> getGoalModules(
            @PathVariable UUID goalId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        LearningGoal goal = learningGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getIsPublished() && !enrollmentRepository.existsByLearnerAndGoal(learner, goal)) {
            throw new RuntimeException("Not authorized to view these modules");
        }

        return ResponseEntity.ok(learningContentRepository.findByGoalOrderByOrderIndexAsc(goal));
    }

    @GetMapping("/enrollments")
    public ResponseEntity<List<Enrollment>> getMyEnrollments(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(enrollmentRepository.findByLearner(getCurrentLearner(userPrincipal)));
    }

    @PostMapping("/enroll/{goalId}")
    public ResponseEntity<Enrollment> enrollInGoal(
            @PathVariable UUID goalId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        LearningGoal goal = learningGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (enrollmentRepository.existsByLearnerAndGoal(learner, goal)) {
            throw new RuntimeException("Already enrolled in this goal");
        }

        Enrollment enrollment = Enrollment.builder()
                .learner(learner)
                .goal(goal)
                .status(Enrollment.EnrollmentStatus.ACTIVE)
                .progressPercentage(BigDecimal.ZERO)
                .build();

        return ResponseEntity.ok(enrollmentRepository.save(enrollment));
    }

    @PutMapping("/enrollments/{enrollmentId}/progress")
    public ResponseEntity<Enrollment> updateProgress(
            @PathVariable UUID enrollmentId,
            @RequestBody Map<String, BigDecimal> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (!enrollment.getLearner().getEmail().equals(userPrincipal.getEmail())) {
            throw new RuntimeException("Not authorized to update this enrollment");
        }

        BigDecimal progress = request.get("progress");
        enrollment.setProgressPercentage(progress);
        enrollment.setLastAccessed(LocalDateTime.now());

        if (progress.compareTo(BigDecimal.valueOf(100)) >= 0) {
            enrollment.setStatus(Enrollment.EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(LocalDateTime.now());
        }

        return ResponseEntity.ok(enrollmentRepository.save(enrollment));
    }

    @GetMapping("/goals/{goalId}/content-progress")
    public ResponseEntity<Map<String, Object>> getContentProgress(
            @PathVariable UUID goalId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        LearningGoal goal = learningGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        Enrollment enrollment = enrollmentRepository.findByLearnerAndGoal(learner, goal)
                .orElseThrow(() -> new RuntimeException("Enroll in the course to track progress"));

        long totalItems = learningContentRepository.countByGoalAndParentContentIsNotNull(goal);
        long completedItems = contentProgressRepository.countByEnrollmentAndStatus(
                enrollment,
                ContentProgress.Status.COMPLETED);

        double progress = totalItems == 0
                ? 0.0
                : Math.min(100.0, (completedItems * 100.0) / totalItems);

        List<UUID> completedContentIds = contentProgressRepository.findByEnrollment(enrollment).stream()
                .filter(entry -> entry.getStatus() == ContentProgress.Status.COMPLETED)
                .map(entry -> entry.getContent().getContentId())
                .distinct()
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("progressPercentage", Math.round(progress * 10.0) / 10.0);
        result.put("completedContentIds", completedContentIds);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/contents/{contentId}/complete")
    public ResponseEntity<Map<String, Object>> markContentComplete(
            @PathVariable UUID contentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        LearningContent content = learningContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        LearningGoal goal = content.getGoal();
        Enrollment enrollment = enrollmentRepository.findByLearnerAndGoal(learner, goal)
                .orElseThrow(() -> new RuntimeException("Enroll in the course to track progress"));

        ContentProgress progress = contentProgressRepository.findByLearnerAndContent(learner, content)
                .orElseGet(() -> ContentProgress.builder()
                        .learner(learner)
                        .content(content)
                        .enrollment(enrollment)
                        .status(ContentProgress.Status.IN_PROGRESS)
                        .build());

        progress.setStatus(ContentProgress.Status.COMPLETED);
        progress.setCompletionPercentage(100);
        progress.setLastAccessed(LocalDateTime.now());
        progress.setCompletedAt(LocalDateTime.now());
        contentProgressRepository.save(progress);

        long totalItems = learningContentRepository.countByGoalAndParentContentIsNotNull(goal);
        long completedItems = contentProgressRepository.countByEnrollmentAndStatus(
                enrollment,
                ContentProgress.Status.COMPLETED);

        double percent = totalItems == 0
                ? 0.0
                : Math.min(100.0, (completedItems * 100.0) / totalItems);

        enrollment.setProgressPercentage(BigDecimal.valueOf(Math.round(percent * 10.0) / 10.0));
        enrollment.setLastAccessed(LocalDateTime.now());
        if (percent >= 100.0) {
            enrollment.setStatus(Enrollment.EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(LocalDateTime.now());
        }
        enrollmentRepository.save(enrollment);

        Map<String, Object> result = new HashMap<>();
        result.put("progressPercentage", enrollment.getProgressPercentage());
        result.put("completedContentIds", contentProgressRepository.findByEnrollment(enrollment).stream()
                .filter(entry -> entry.getStatus() == ContentProgress.Status.COMPLETED)
                .map(entry -> entry.getContent().getContentId())
                .distinct()
                .toList());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/enrollments/{enrollmentId}")
    public ResponseEntity<Map<String, String>> dropEnrollment(
            @PathVariable UUID enrollmentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (!enrollment.getLearner().getEmail().equals(userPrincipal.getEmail())) {
            throw new RuntimeException("Not authorized to drop this enrollment");
        }

        enrollment.setStatus(Enrollment.EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);
        return ResponseEntity.ok(Map.of("message", "Enrollment dropped successfully"));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        List<Enrollment> enrollments = enrollmentRepository.findByLearner(learner);

        Map<String, Object> currentCourse = new HashMap<>();
        enrollments.stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.EnrollmentStatus.ACTIVE)
                .max(Comparator.comparing(Enrollment::getProgressPercentage))
                .ifPresent(active -> {
                    currentCourse.put("courseId", active.getGoal().getGoalId());
                    currentCourse.put("title", active.getGoal().getTitle());
                    currentCourse.put("module", active.getGoal().getSubject());
                    currentCourse.put("progress", active.getProgressPercentage());
                    currentCourse.put("status", "In Progress");
                });

        long minutesToday = enrollments.stream()
                .filter(enrollment -> enrollment.getLastAccessed() != null
                        && enrollment.getLastAccessed().toLocalDate().equals(LocalDateTime.now().toLocalDate()))
                .count() * 25;

        int streak = 0;
        for (int dayOffset = 0; dayOffset < 30; dayOffset++) {
            LocalDateTime day = LocalDateTime.now().minusDays(dayOffset).truncatedTo(ChronoUnit.DAYS);
            boolean hadActivity = enrollments.stream()
                    .anyMatch(enrollment -> enrollment.getLastAccessed() != null
                            && enrollment.getLastAccessed().toLocalDate().equals(day.toLocalDate()));

            if (hadActivity) {
                streak++;
                continue;
            }
            break;
        }

        Map<String, Object> dailyGoal = Map.of(
                "minutesToday", minutesToday > 0 ? minutesToday : 45,
                "target", 60,
                "streak", streak > 0 ? streak : 1);

        Map<String, Double> skillMap = new LinkedHashMap<>();
        for (Enrollment enrollment : enrollments) {
            String subject = enrollment.getGoal().getSubject();
            double progress = enrollment.getProgressPercentage().doubleValue() / 100.0;
            skillMap.merge(subject, progress, Math::max);
        }

        if (skillMap.isEmpty()) {
            skillMap.put("General", 0.5);
        }

        List<Map<String, Object>> skillData = skillMap.entrySet().stream()
                .map(entry -> Map.<String, Object>of(
                        "label", entry.getKey(),
                        "value", Math.round(entry.getValue() * 100.0) / 100.0))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("currentCourse", currentCourse);
        result.put("dailyGoal", dailyGoal);
        result.put("skillData", skillData);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/dashboard/recommendations")
    public ResponseEntity<List<Map<String, Object>>> getRecommendations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        List<Enrollment> enrollments = enrollmentRepository.findByLearner(learner);
        List<UUID> enrolledGoalIds = enrollments.stream()
                .map(enrollment -> enrollment.getGoal().getGoalId())
                .toList();

        List<LearningGoal> allGoals = learningGoalRepository.findByIsPublishedTrue(PageRequest.of(0, 100)).getContent();
        List<Map<String, Object>> recommendations = allGoals.stream()
                .filter(goal -> !enrolledGoalIds.contains(goal.getGoalId()))
                .limit(2)
                .map(goal -> {
                    Map<String, Object> recommendation = new HashMap<>();
                    recommendation.put("id", goal.getGoalId());
                    recommendation.put("title", goal.getTitle());
                    recommendation.put("level", goal.getDifficultyLevel().name());
                    recommendation.put("description", goal.getDescription());
                    recommendation.put("levelColor",
                            goal.getDifficultyLevel() == LearningGoal.DifficultyLevel.BEGINNER
                                    ? "#10b981"
                                    : goal.getDifficultyLevel() == LearningGoal.DifficultyLevel.INTERMEDIATE
                                            ? "#f59e0b"
                                            : "#ef4444");
                    recommendation.put("duration", "4h 30m");
                    recommendation.put("rating", 4.8);
                    recommendation.put("learners", "1.2k");
                    return recommendation;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/dashboard/exams")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingExams(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        List<UUID> enrolledCourseIds = enrollmentRepository.findByLearner(learner).stream()
                .filter(enrollment -> enrollment.getStatus() == Enrollment.EnrollmentStatus.ACTIVE)
                .map(enrollment -> enrollment.getGoal().getGoalId())
                .toList();

        DateTimeFormatter monthDay = DateTimeFormatter.ofPattern("MMM dd");
        DateTimeFormatter timeFormat = DateTimeFormatter.ofPattern("h:mm a");

        List<Map<String, Object>> upcomingExams = examRepository.findByCourseGoalIdIn(enrolledCourseIds).stream()
                .filter(exam -> exam.getStatus() == Exam.ExamStatus.PUBLISHED)
                .map(exam -> {
                    Map<String, Object> examMap = new HashMap<>();
                    examMap.put("id", exam.getExamId());
                    examMap.put("title", exam.getTitle());

                    if (exam.getScheduledDate() != null) {
                        examMap.put("date", exam.getScheduledDate().format(monthDay).toUpperCase());
                        examMap.put("time", exam.getScheduledDate().format(timeFormat) + " - "
                                + exam.getScheduledDate().plusMinutes(exam.getDurationMinutes()).format(timeFormat));
                    } else {
                        examMap.put("date", "TBD");
                        examMap.put("time", "TBD");
                    }

                    examMap.put("type", exam.getConductMethod().name());
                    return examMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(upcomingExams);
    }

    @GetMapping("/exams/attempts/{attemptId}/certificate")
    public ResponseEntity<CourseCertificate> getCertificateForAttempt(
            @PathVariable UUID attemptId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        return ResponseEntity.ok(certificateService.getCertificateForAttempt(attemptId, learner));
    }

    @GetMapping("/certificates")
    public ResponseEntity<List<CourseCertificate>> getCertificates(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        return ResponseEntity.ok(certificateService.getCertificatesForLearner(learner));
    }

    @GetMapping("/certificates/{certificateId}/download")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable UUID certificateId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User learner = getCurrentLearner(userPrincipal);
        CourseCertificate certificate = certificateService.getCertificate(certificateId, learner);
        byte[] bytes = certificateService.renderCertificateHtml(certificate);

        String filename = "SkillForge-Certificate-" + certificate.getCourse().getTitle().replace(" ", "_") + ".html";
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .header("Content-Type", "text/html; charset=UTF-8")
                .body(bytes);
    }

    private User getCurrentLearner(UserPrincipal userPrincipal) {
        return userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
