package com.skillforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.Exam;
import com.skillforge.entity.ExamAnswer;
import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.ExamQuestion;
import com.skillforge.entity.User;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.ExamAnswerRepository;
import com.skillforge.repository.ExamAttemptRepository;
import com.skillforge.repository.ExamQuestionRepository;
import com.skillforge.repository.ExamRepository;
import com.skillforge.repository.CourseCertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("null")
@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final ExamAnswerRepository examAnswerRepository;
    private final CourseCertificateRepository courseCertificateRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GeminiService geminiService;
    private final CertificateService certificateService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Exam> getInstructorExams(UUID instructorId) {
        return examRepository.findByInstructorUserId(instructorId).stream()
                .sorted(Comparator.comparing(Exam::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public Exam createExam(Exam exam) {
        if (exam.getStatus() == null) {
            exam.setStatus(Exam.ExamStatus.PUBLISHED);
        }
        if (exam.getExamType() == null) {
            exam.setExamType(Exam.ExamType.EXAM);
        }
        if (exam.getConductMethod() == null) {
            exam.setConductMethod(Exam.ConductMethod.QUIZ);
        }
        if (exam.getPassingScore() == null) {
            exam.setPassingScore(70);
        }
        return examRepository.save(exam);
    }

    public Exam getExam(UUID examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
    }

    public List<ExamQuestion> getExamQuestions(UUID examId) {
        return examQuestionRepository.findByExamExamIdOrderByOrderIndexAsc(examId);
    }

    public List<ExamQuestion> getAttemptQuestions(UUID examId) {
        return getQuestionsForAttempt(examId);
    }

    @Transactional
    public ExamQuestion approveQuestion(UUID questionId) {
        ExamQuestion question = examQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setApprovalStatus(ExamQuestion.ApprovalStatus.APPROVED);
        return examQuestionRepository.save(question);
    }

    @Transactional
    public ExamQuestion rejectQuestion(UUID questionId) {
        ExamQuestion question = examQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        question.setApprovalStatus(ExamQuestion.ApprovalStatus.REJECTED);
        return examQuestionRepository.save(question);
    }

    @Transactional
    public Exam publishExam(UUID examId) {
        Exam exam = getExam(examId);
        exam.setStatus(Exam.ExamStatus.PUBLISHED);
        return examRepository.save(exam);
    }

    @Transactional
    public Exam createPracticeExam(Exam exam, User learner) {
        exam.setStatus(Exam.ExamStatus.PUBLISHED);
        exam.setExamType(Exam.ExamType.PRACTICE);
        exam.setLearnerOwner(learner);
        if (exam.getConductMethod() == null) {
            exam.setConductMethod(Exam.ConductMethod.QUIZ);
        }
        if (exam.getPassingScore() == null) {
            exam.setPassingScore(70);
        }
        return examRepository.save(exam);
    }

    @Transactional
    public Exam createPracticeExamFromTemplate(UUID sourceExamId, User learner) {
        Exam sourceExam = getExam(sourceExamId);

        Exam practiceExam = Exam.builder()
                .title(sourceExam.getTitle() + " Practice")
                .description(sourceExam.getDescription())
                .course(sourceExam.getCourse())
                .instructor(sourceExam.getInstructor())
                .learnerOwner(learner)
                .sourceExam(sourceExam)
                .totalQuestions(sourceExam.getTotalQuestions())
                .durationMinutes(sourceExam.getDurationMinutes())
                .status(Exam.ExamStatus.PUBLISHED)
                .learningGoals(sourceExam.getLearningGoals())
                .examType(Exam.ExamType.PRACTICE)
                .conductMethod(sourceExam.getConductMethod())
                .passingScore(sourceExam.getPassingScore())
                .build();

        Exam savedExam = examRepository.save(practiceExam);
        List<ExamQuestion> clonedQuestions = getExamQuestions(sourceExamId).stream()
                .filter(question -> question.getApprovalStatus() != ExamQuestion.ApprovalStatus.REJECTED)
                .map(question -> ExamQuestion.builder()
                        .exam(savedExam)
                        .questionText(question.getQuestionText())
                        .questionType(question.getQuestionType())
                        .optionA(question.getOptionA())
                        .optionB(question.getOptionB())
                        .optionC(question.getOptionC())
                        .optionD(question.getOptionD())
                        .correctAnswer(question.getCorrectAnswer())
                        .difficulty(question.getDifficulty())
                        .topic(question.getTopic())
                        .aiConfidence(question.getAiConfidence())
                        .approvalStatus(ExamQuestion.ApprovalStatus.APPROVED)
                        .codeSnippet(question.getCodeSnippet())
                        .objective(question.getObjective())
                        .orderIndex(question.getOrderIndex())
                        .build())
                .toList();

        examQuestionRepository.saveAll(clonedQuestions);
        return savedExam;
    }

    public List<Exam> getLearnerExams(UUID learnerId) {
        List<UUID> enrolledCourseIds = enrollmentRepository.findByLearnerUserId(learnerId).stream()
                .filter(enrollment -> enrollment.getStatus() != Enrollment.EnrollmentStatus.DROPPED)
                .map(enrollment -> enrollment.getGoal().getGoalId())
                .toList();

        Map<UUID, Exam> exams = new LinkedHashMap<>();
        examRepository.findByStatus(Exam.ExamStatus.PUBLISHED).stream()
                .filter(exam -> exam.getExamType() != Exam.ExamType.PRACTICE)
                .filter(exam -> {
                    if (exam.getCourse() == null) {
                        return true;
                    }
                    boolean isCoursePublished = Boolean.TRUE.equals(exam.getCourse().getIsPublished());
                    boolean isEnrolled = enrolledCourseIds.contains(exam.getCourse().getGoalId());
                    return isCoursePublished || isEnrolled;
                })
                .forEach(exam -> exams.put(exam.getExamId(), exam));

        examRepository.findByLearnerOwnerUserId(learnerId)
                .forEach(exam -> exams.put(exam.getExamId(), exam));

        return exams.values().stream()
                .sorted(Comparator.comparing(Exam::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Transactional
    public ExamAttempt startExam(UUID examId, User learner) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        validateExamAccess(exam, learner);

        if (exam.getExamType() != Exam.ExamType.PRACTICE && exam.getStatus() != Exam.ExamStatus.PUBLISHED) {
            throw new RuntimeException("This assessment is not open yet");
        }

        List<ExamQuestion> questions = getQuestionsForAttempt(examId);
        if (questions.isEmpty()) {
            throw new RuntimeException("This assessment has no questions yet");
        }

        List<ExamAttempt> existingAttempts = examAttemptRepository.findByLearnerUserIdAndExamExamIdAndStatusOrderByStartTimeDesc(
                learner.getUserId(),
                examId,
                ExamAttempt.AttemptStatus.IN_PROGRESS);

        if (!existingAttempts.isEmpty()) {
            return existingAttempts.get(0);
        }

        ExamAttempt attempt = ExamAttempt.builder()
                .exam(exam)
                .learner(learner)
                .status(ExamAttempt.AttemptStatus.IN_PROGRESS)
                .currentQuestion(1)
                .totalQuestions(questions.size())
                .skillLevel(exam.getCourse() != null && exam.getCourse().getDifficultyLevel() != null
                        ? exam.getCourse().getDifficultyLevel().name()
                        : "INTERMEDIATE")
                .build();
        return examAttemptRepository.save(attempt);
    }

    @Transactional
    public ExamAnswer submitAnswer(UUID attemptId, UUID questionId, String selectedAnswer) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        ExamQuestion question = examQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!question.getExam().getExamId().equals(attempt.getExam().getExamId())) {
            throw new RuntimeException("Question does not belong to this attempt");
        }

        GradeResult grade = gradeQuestion(question, selectedAnswer);
        ExamAnswer answer = examAnswerRepository.findByAttemptAttemptIdAndQuestionQuestionId(attemptId, questionId)
                .orElse(ExamAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .build());

        answer.setSelectedAnswer(selectedAnswer);
        answer.setIsCorrect(grade.correct());
        answer.setAwardedScore(grade.score());
        answer.setFeedback(grade.feedback());
        answer.setTimeTakenSeconds(30);

        ExamAnswer savedAnswer = examAnswerRepository.save(answer);
        int answeredCount = examAnswerRepository.findByAttemptAttemptId(attemptId).size();
        attempt.setCurrentQuestion(Math.min(attempt.getTotalQuestions(), answeredCount + 1));
        examAttemptRepository.save(attempt);

        return savedAnswer;
    }

    @Transactional
    public ExamAttempt finishExam(UUID attemptId) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        List<ExamQuestion> questions = getQuestionsForAttempt(attempt.getExam().getExamId());
        Map<UUID, ExamAnswer> answersByQuestionId = examAnswerRepository.findByAttemptAttemptId(attemptId).stream()
                .collect(Collectors.toMap(answer -> answer.getQuestion().getQuestionId(), answer -> answer, (left, right) -> right));

        double totalScore = 0.0;
        for (ExamQuestion question : questions) {
            ExamAnswer answer = answersByQuestionId.get(question.getQuestionId());
            if (answer != null && answer.getAwardedScore() != null) {
                totalScore += answer.getAwardedScore();
            }
        }

        double score = questions.isEmpty() ? 0.0 : totalScore / questions.size();
        attempt.setStatus(ExamAttempt.AttemptStatus.COMPLETED);
        attempt.setScore(Math.round(score * 10.0) / 10.0);
        attempt.setEndTime(LocalDateTime.now());
        attempt.setCurrentQuestion(attempt.getTotalQuestions());
        ExamAttempt savedAttempt = examAttemptRepository.save(attempt);
        certificateService.issueIfEligible(savedAttempt);
        markEnrollmentCompletedIfPassed(savedAttempt);
        return savedAttempt;
    }

    public List<ExamAttempt> getLearnerAttempts(UUID learnerId) {
        return examAttemptRepository.findByLearnerUserIdOrderByStartTimeDesc(learnerId);
    }

    public List<ExamAttempt> getExamAttemptsByExamId(UUID examId) {
        return examAttemptRepository.findByExamExamIdOrderByStartTimeDesc(examId);
    }

    public ExamAttempt getAttempt(UUID attemptId) {
        return examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
    }

    public List<ExamAnswer> getAttemptAnswers(UUID attemptId) {
        return examAnswerRepository.findByAttemptAttemptId(attemptId);
    }

    public Map<String, Object> getExamStats(UUID instructorId) {
        List<Exam> exams = getInstructorExams(instructorId);
        long pendingApprovals = exams.stream()
                .mapToLong(exam -> examQuestionRepository.countByExamExamIdAndApprovalStatus(
                        exam.getExamId(),
                        ExamQuestion.ApprovalStatus.PENDING))
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExams", exams.size());
        stats.put("pendingApprovals", pendingApprovals);
        stats.put("publishedExams", exams.stream()
                .filter(exam -> exam.getStatus() == Exam.ExamStatus.PUBLISHED)
                .count());
        return stats;
    }

    @Transactional
    public List<ExamQuestion> addQuestions(UUID examId, List<ExamQuestion> questions) {
        Exam exam = getExam(examId);
        int startIndex = getExamQuestions(examId).size();

        for (int index = 0; index < questions.size(); index++) {
            ExamQuestion question = questions.get(index);
            question.setExam(exam);
            question.setOrderIndex(startIndex + index + 1);
            if (question.getApprovalStatus() == null) {
                question.setApprovalStatus(ExamQuestion.ApprovalStatus.PENDING);
            }
            sanitizeQuestion(question);
        }

        return examQuestionRepository.saveAll(questions);
    }

    @Transactional
    public List<ExamQuestion> addPracticeQuestions(UUID examId, List<ExamQuestion> questions) {
        Exam exam = getExam(examId);
        int startIndex = getExamQuestions(examId).size();

        for (int index = 0; index < questions.size(); index++) {
            ExamQuestion question = questions.get(index);
            question.setExam(exam);
            question.setOrderIndex(startIndex + index + 1);
            question.setApprovalStatus(ExamQuestion.ApprovalStatus.APPROVED);
            sanitizeQuestion(question);
        }

        return examQuestionRepository.saveAll(questions);
    }

    @Transactional
    public void deleteExam(UUID examId) {
        Exam exam = getExam(examId);
        List<ExamAttempt> attempts = examAttemptRepository.findByExamExamId(examId);
        if (!attempts.isEmpty()) {
            List<UUID> attemptIds = attempts.stream()
                    .map(ExamAttempt::getAttemptId)
                    .toList();
            courseCertificateRepository.deleteByExamAttemptAttemptIdIn(attemptIds);
            examAnswerRepository.deleteByAttemptAttemptIdIn(attemptIds);
            examAttemptRepository.deleteAll(attempts);
        }
        examQuestionRepository.deleteAll(getExamQuestions(examId));
        examRepository.delete(exam);
    }

    private void validateExamAccess(Exam exam, User learner) {
        if (exam.getLearnerOwner() != null && !exam.getLearnerOwner().getUserId().equals(learner.getUserId())) {
            throw new RuntimeException("This practice exam belongs to another learner");
        }

        if (exam.getCourse() != null && exam.getLearnerOwner() == null) {
            boolean enrolled = enrollmentRepository.existsByLearnerAndGoal(learner, exam.getCourse());
            if (enrolled) {
                return;
            }

            boolean coursePublished = Boolean.TRUE.equals(exam.getCourse().getIsPublished());
            if (exam.getStatus() == Exam.ExamStatus.PUBLISHED && coursePublished) {
                Enrollment enrollment = Enrollment.builder()
                        .learner(learner)
                        .goal(exam.getCourse())
                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                        .progressPercentage(BigDecimal.ZERO)
                        .build();
                enrollmentRepository.save(enrollment);
                return;
            }

            throw new RuntimeException("Enroll in the course before taking this assessment");
        }
    }

    private List<ExamQuestion> getQuestionsForAttempt(UUID examId) {
        List<ExamQuestion> orderedQuestions = getExamQuestions(examId).stream()
                .filter(question -> question.getApprovalStatus() != ExamQuestion.ApprovalStatus.REJECTED)
                .sorted(Comparator.comparing(ExamQuestion::getOrderIndex, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        boolean hasApprovedQuestions = orderedQuestions.stream()
                .anyMatch(question -> question.getApprovalStatus() == ExamQuestion.ApprovalStatus.APPROVED);

        if (!hasApprovedQuestions) {
            return orderedQuestions;
        }

        return orderedQuestions.stream()
                .filter(question -> question.getApprovalStatus() == ExamQuestion.ApprovalStatus.APPROVED)
                .toList();
    }

    private GradeResult gradeQuestion(ExamQuestion question, String selectedAnswer) {
        String answer = selectedAnswer == null ? "" : selectedAnswer.trim();
        if (answer.isBlank()) {
            return new GradeResult(false, 0.0, "No answer submitted.");
        }

        return switch (question.getQuestionType()) {
            case MCQ, CODE -> gradeOptionQuestion(question, answer);
            case TRUE_FALSE -> gradeTrueFalseQuestion(question, answer);
            case FLASHCARD -> gradeFlashcardQuestion(answer);
            case TEXT -> gradeTextQuestion(question, answer);
        };
    }

    private GradeResult gradeOptionQuestion(ExamQuestion question, String selectedAnswer) {
        String selectedValue = resolveOptionValue(question, selectedAnswer);
        String correctValue = resolveOptionValue(question, question.getCorrectAnswer());
        boolean isCorrect = selectedValue.equalsIgnoreCase(correctValue);

        return new GradeResult(
                isCorrect,
                isCorrect ? 100.0 : 0.0,
                isCorrect ? "Correct answer." : "Expected answer: " + correctValue);
    }

    private GradeResult gradeTrueFalseQuestion(ExamQuestion question, String selectedAnswer) {
        boolean isCorrect = question.getCorrectAnswer().trim().equalsIgnoreCase(selectedAnswer.trim());
        return new GradeResult(
                isCorrect,
                isCorrect ? 100.0 : 0.0,
                isCorrect ? "Correct answer." : "Expected answer: " + question.getCorrectAnswer());
    }

    private GradeResult gradeFlashcardQuestion(String selectedAnswer) {
        boolean isCorrect = "Got it".equalsIgnoreCase(selectedAnswer);
        return new GradeResult(
                isCorrect,
                isCorrect ? 100.0 : 0.0,
                isCorrect ? "Self-check marked as mastered." : "Marked for additional review.");
    }

    private GradeResult gradeTextQuestion(ExamQuestion question, String selectedAnswer) {
        try {
            String response = geminiService.gradeDescriptiveAnswer(
                    question.getQuestionText(),
                    question.getCorrectAnswer(),
                    selectedAnswer);

            JsonNode root = objectMapper.readTree(response);
            double score = root.path("score").asDouble(fallbackTextScore(question.getCorrectAnswer(), selectedAnswer));
            boolean isCorrect = root.path("isCorrect").asBoolean(score >= 70.0);
            String feedback = root.path("feedback").asText(
                    isCorrect ? "Answer meets the expected criteria." : "Answer needs more detail.");

            return new GradeResult(isCorrect, Math.max(0.0, Math.min(100.0, score)), feedback);
        } catch (Exception ignored) {
            double score = fallbackTextScore(question.getCorrectAnswer(), selectedAnswer);
            boolean isCorrect = score >= 70.0;
            return new GradeResult(
                    isCorrect,
                    score,
                    isCorrect
                            ? "Answer matches the expected concepts."
                            : "Answer only partially matches the expected concepts.");
        }
    }

    private double fallbackTextScore(String expectedAnswer, String learnerAnswer) {
        Set<String> expectedTokens = tokenize(expectedAnswer);
        Set<String> answerTokens = tokenize(learnerAnswer);

        if (expectedTokens.isEmpty() || answerTokens.isEmpty()) {
            return 0.0;
        }

        long overlap = expectedTokens.stream()
                .filter(answerTokens::contains)
                .count();

        double ratio = (double) overlap / expectedTokens.size();
        return Math.round(Math.min(100.0, ratio * 100.0) * 10.0) / 10.0;
    }

    private Set<String> tokenize(String text) {
        return Arrays.stream((text == null ? "" : text).toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
                .filter(token -> token.length() > 2)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String resolveOptionValue(ExamQuestion question, String rawValue) {
        String value = rawValue == null ? "" : rawValue.trim();
        return switch (value.toUpperCase(Locale.ROOT)) {
            case "A" -> Optional.ofNullable(question.getOptionA()).orElse(value);
            case "B" -> Optional.ofNullable(question.getOptionB()).orElse(value);
            case "C" -> Optional.ofNullable(question.getOptionC()).orElse(value);
            case "D" -> Optional.ofNullable(question.getOptionD()).orElse(value);
            default -> value;
        };
    }

    private record GradeResult(boolean correct, double score, String feedback) {
    }

    private void markEnrollmentCompletedIfPassed(ExamAttempt attempt) {
        if (attempt == null || attempt.getExam() == null || attempt.getLearner() == null) {
            return;
        }

        Exam exam = attempt.getExam();
        if (exam.getExamType() == Exam.ExamType.PRACTICE || exam.getCourse() == null) {
            return;
        }

        double score = attempt.getScore() == null ? 0.0 : attempt.getScore();
        int passingScore = exam.getPassingScore() == null ? 70 : exam.getPassingScore();
        if (score < passingScore) {
            return;
        }

        enrollmentRepository.findByLearnerAndGoal(attempt.getLearner(), exam.getCourse())
                .ifPresent(enrollment -> {
                    if (enrollment.getStatus() == Enrollment.EnrollmentStatus.DROPPED) {
                        return;
                    }
                    LocalDateTime now = LocalDateTime.now();
                    enrollment.setProgressPercentage(BigDecimal.valueOf(100.0));
                    enrollment.setStatus(Enrollment.EnrollmentStatus.COMPLETED);
                    enrollment.setCompletedAt(enrollment.getCompletedAt() == null ? now : enrollment.getCompletedAt());
                    enrollment.setLastAccessed(now);
                    enrollmentRepository.save(enrollment);
                });
    }

    private void sanitizeQuestion(ExamQuestion question) {
        question.setQuestionText(truncate(question.getQuestionText(), 500));
        question.setOptionA(truncate(question.getOptionA(), 255));
        question.setOptionB(truncate(question.getOptionB(), 255));
        question.setOptionC(truncate(question.getOptionC(), 255));
        question.setOptionD(truncate(question.getOptionD(), 255));
        question.setCorrectAnswer(truncate(question.getCorrectAnswer(), 255));
        question.setTopic(truncate(question.getTopic(), 100));
        question.setObjective(truncate(question.getObjective(), 255));
        question.setCodeSnippet(truncate(question.getCodeSnippet(), 1000));
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.length() <= maxLength) {
            return trimmed;
        }
        return trimmed.substring(0, maxLength);
    }
}
