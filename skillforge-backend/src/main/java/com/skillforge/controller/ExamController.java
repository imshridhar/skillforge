package com.skillforge.controller;

import com.skillforge.entity.Exam;
import com.skillforge.entity.ExamAnswer;
import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.ExamQuestion;
import com.skillforge.entity.LearningGoal;
import com.skillforge.entity.User;
import com.skillforge.repository.LearningGoalRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.UserPrincipal;
import com.skillforge.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;
    private final UserRepository userRepository;
    private final LearningGoalRepository learningGoalRepository;

    @GetMapping("/instructor/exams")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getInstructorExams(@AuthenticationPrincipal UserPrincipal principal) {
        User instructor = getCurrentUser(principal);
        return ResponseEntity.ok(examService.getInstructorExams(instructor.getUserId()).stream()
                .map(this::toExamResponse)
                .toList());
    }

    @PostMapping("/instructor/exams")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Exam> createExam(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        User instructor = getCurrentUser(principal);
        LearningGoal course = learningGoalRepository.findById(UUID.fromString((String) body.get("courseId")))
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Exam exam = Exam.builder()
                .title((String) body.get("title"))
                .description((String) body.getOrDefault("description", ""))
                .course(course)
                .instructor(instructor)
                .totalQuestions(asInteger(body.get("totalQuestions"), 10))
                .durationMinutes(asInteger(body.get("durationMinutes"), 30))
                .status(parseEnum(body.get("status"), Exam.ExamStatus.class, Exam.ExamStatus.PUBLISHED))
                .learningGoals((String) body.getOrDefault("learningGoals", ""))
                .examType(parseEnum(body.get("examType"), Exam.ExamType.class, Exam.ExamType.EXAM))
                .conductMethod(parseEnum(body.get("conductMethod"), Exam.ConductMethod.class, Exam.ConductMethod.QUIZ))
                .passingScore(asInteger(body.get("passingScore"), 70))
                .build();

        return ResponseEntity.ok(examService.createExam(exam));
    }

    @GetMapping("/instructor/exams/{examId}/questions")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ExamQuestion>> getExamQuestions(@PathVariable UUID examId) {
        return ResponseEntity.ok(examService.getExamQuestions(examId));
    }

    @PutMapping("/instructor/exams/questions/{questionId}/approve")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ExamQuestion> approveQuestion(@PathVariable UUID questionId) {
        return ResponseEntity.ok(examService.approveQuestion(questionId));
    }

    @PutMapping("/instructor/exams/questions/{questionId}/reject")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ExamQuestion> rejectQuestion(@PathVariable UUID questionId) {
        return ResponseEntity.ok(examService.rejectQuestion(questionId));
    }

    @PutMapping("/instructor/exams/{examId}/publish")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Exam> publishExam(@PathVariable UUID examId) {
        return ResponseEntity.ok(examService.publishExam(examId));
    }

    @PostMapping("/instructor/exams/{examId}/questions/batch")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ExamQuestion>> addQuestionsBatch(
            @PathVariable UUID examId,
            @RequestBody List<Object> questionsData) {
        return ResponseEntity.ok(examService.addQuestions(examId, parseQuestions(questionsData, false)));
    }

    @DeleteMapping("/instructor/exams/{examId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, String>> deleteExam(@PathVariable UUID examId) {
        examService.deleteExam(examId);
        return ResponseEntity.ok(Map.of("message", "Exam deleted successfully"));
    }

    @GetMapping("/instructor/exams/stats")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getExamStats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(examService.getExamStats(principal.getId()));
    }

    @GetMapping("/instructor/exams/{examId}/attempts")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ExamAttempt>> getExamAttemptsForInstructor(@PathVariable UUID examId) {
        return ResponseEntity.ok(examService.getExamAttemptsByExamId(examId));
    }

    @GetMapping("/learner/exams")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAvailableExams(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(examService.getLearnerExams(principal.getId()).stream()
                .map(this::toExamResponse)
                .toList());
    }

    @PostMapping("/learner/exams/practice")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Exam> createPracticeExam(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        User learner = getCurrentUser(principal);

        if (body.get("sourceExamId") != null) {
            return ResponseEntity.ok(examService.createPracticeExamFromTemplate(
                    UUID.fromString(body.get("sourceExamId").toString()),
                    learner));
        }

        LearningGoal course = null;
        if (body.get("courseId") != null && !body.get("courseId").toString().isBlank()) {
            course = learningGoalRepository.findById(UUID.fromString(body.get("courseId").toString()))
                    .orElseThrow(() -> new RuntimeException("Course not found"));
        }

        Exam exam = Exam.builder()
                .title((String) body.get("title"))
                .description((String) body.getOrDefault("description", ""))
                .course(course)
                .totalQuestions(asInteger(body.get("totalQuestions"), 10))
                .durationMinutes(asInteger(body.get("durationMinutes"), 30))
                .learningGoals((String) body.getOrDefault("learningGoals", ""))
                .conductMethod(parseEnum(body.get("conductMethod"), Exam.ConductMethod.class, Exam.ConductMethod.QUIZ))
                .passingScore(asInteger(body.get("passingScore"), 70))
                .build();

        return ResponseEntity.ok(examService.createPracticeExam(exam, learner));
    }

    @PostMapping("/learner/exams/{examId}/questions/generate")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ExamQuestion>> addPracticeQuestionsBatch(
            @PathVariable UUID examId,
            @RequestBody List<Object> questionsData) {
        return ResponseEntity.ok(examService.addPracticeQuestions(examId, parseQuestions(questionsData, true)));
    }

    @PostMapping("/learner/exams/{examId}/start")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ExamAttempt> startExam(
            @PathVariable UUID examId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(examService.startExam(examId, getCurrentUser(principal)));
    }

    @PostMapping("/learner/exams/attempts/{attemptId}/answer")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ExamAnswer> submitAnswer(
            @PathVariable UUID attemptId,
            @RequestBody Map<String, String> body) {
        UUID questionId = UUID.fromString(body.get("questionId"));
        return ResponseEntity.ok(examService.submitAnswer(attemptId, questionId, body.get("selectedAnswer")));
    }

    @PostMapping("/learner/exams/attempts/{attemptId}/submit")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ExamAttempt> finishExam(@PathVariable UUID attemptId) {
        return ResponseEntity.ok(examService.finishExam(attemptId));
    }

    @GetMapping("/learner/exams/attempts")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ExamAttempt>> getMyAttempts(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(examService.getLearnerAttempts(principal.getId()));
    }

    @GetMapping("/learner/exams/attempts/{attemptId}")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ExamAttempt> getAttempt(@PathVariable UUID attemptId) {
        return ResponseEntity.ok(examService.getAttempt(attemptId));
    }

    @GetMapping("/learner/exams/attempts/{attemptId}/questions")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ExamQuestion>> getAttemptQuestions(@PathVariable UUID attemptId) {
        ExamAttempt attempt = examService.getAttempt(attemptId);
        return ResponseEntity.ok(examService.getAttemptQuestions(attempt.getExam().getExamId()));
    }

    @GetMapping("/learner/exams/attempts/{attemptId}/answers")
    @PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ExamAnswer>> getAttemptAnswers(@PathVariable UUID attemptId) {
        return ResponseEntity.ok(examService.getAttemptAnswers(attemptId));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private List<ExamQuestion> parseQuestions(List<?> questionsData, boolean autoApprove) {
        List<ExamQuestion> questions = new ArrayList<>();
        int skipped = 0;

        if (questionsData == null || questionsData.isEmpty()) {
            return questions;
        }

        for (Object rawQuestion : questionsData) {
            Map<String, Object> questionData = coerceQuestionMap(rawQuestion);
            if (questionData == null || questionData.isEmpty()) {
                if (autoApprove) {
                    skipped++;
                    continue;
                }
                throw new RuntimeException("Invalid question payload. Each question must be an object.");
            }
            ExamQuestion.QuestionType questionType = parseQuestionType(questionData.get("questionType"));
            String questionText = extractQuestionText(questionData);
            if (questionText == null || questionText.isBlank()) {
                if (autoApprove) {
                    skipped++;
                    continue;
                }
                throw new RuntimeException("Question text is required for all assessment items.");
            }

            String correctAnswer = extractCorrectAnswer(questionData);

            String optionA = asTrimmedString(questionData.get("optionA"));
            String optionB = asTrimmedString(questionData.get("optionB"));
            String optionC = asTrimmedString(questionData.get("optionC"));
            String optionD = asTrimmedString(questionData.get("optionD"));

            List<?> options = extractOptionsList(questionData);
            optionA = firstNonBlank(optionA, optionFromList(options, 0));
            optionB = firstNonBlank(optionB, optionFromList(options, 1));
            optionC = firstNonBlank(optionC, optionFromList(options, 2));
            optionD = firstNonBlank(optionD, optionFromList(options, 3));

            List<String> optionList = java.util.stream.Stream.of(optionA, optionB, optionC, optionD)
                    .filter(value -> value != null && !value.isBlank())
                    .toList();

            if (questionType == ExamQuestion.QuestionType.TEXT) {
                if (!optionList.isEmpty()) {
                    questionType = ExamQuestion.QuestionType.MCQ;
                } else if (isTrueFalseAnswer(correctAnswer)) {
                    questionType = ExamQuestion.QuestionType.TRUE_FALSE;
                }
            }

            if (questionType == ExamQuestion.QuestionType.MCQ && optionList.isEmpty() && isTrueFalseAnswer(correctAnswer)) {
                questionType = ExamQuestion.QuestionType.TRUE_FALSE;
            }

            if ((questionType == ExamQuestion.QuestionType.MCQ || questionType == ExamQuestion.QuestionType.CODE)
                    && optionList.isEmpty()) {
                if (autoApprove) {
                    skipped++;
                    continue;
                }
                throw new RuntimeException("MCQ and code questions must include answer options.");
            }

            if (questionData.get("aiConfidence") != null && isPlaceholderQuestion(questionText, optionList)) {
                if (autoApprove) {
                    skipped++;
                    continue;
                }
                throw new RuntimeException("AI returned placeholder questions. Configure a valid Gemini API key/model and try again.");
            }

            correctAnswer = normalizeTrueFalseAnswer(questionType, correctAnswer);

            String topic = firstNonBlank(asTrimmedString(questionData.get("topic")), "General");
            String objective = asTrimmedString(questionData.get("objective"));

            ExamQuestion.ExamQuestionBuilder builder = ExamQuestion.builder()
                    .questionText(questionText != null ? questionText : "Untitled question")
                    .questionType(questionType)
                    .optionA(optionA)
                    .optionB(optionB)
                    .optionC(optionC)
                    .optionD(optionD)
                    .correctAnswer(correctAnswer != null ? correctAnswer : "")
                    .topic(topic)
                    .objective(objective != null ? objective : "");

            builder.difficulty(parseEnum(
                    questionData.get("difficulty"),
                    ExamQuestion.DifficultyLevel.class,
                    ExamQuestion.DifficultyLevel.MEDIUM));

            if (questionData.get("aiConfidence") != null) {
                builder.aiConfidence(asDouble(questionData.get("aiConfidence"), 0.0));
            }
            String codeSnippet = asTrimmedString(questionData.get("codeSnippet"));
            if (codeSnippet != null) {
                builder.codeSnippet(codeSnippet);
            }
            if (autoApprove) {
                builder.approvalStatus(ExamQuestion.ApprovalStatus.APPROVED);
            }

            questions.add(builder.build());
        }

        if (questions.isEmpty() && !questionsData.isEmpty()) {
            if (skipped > 0) {
                throw new RuntimeException("No valid questions were generated. Try again with a different topic or question count.");
            }
            throw new RuntimeException("Question data is required for all assessment items.");
        }

        return questions;
    }

    private String optionFromList(List<?> options, int index) {
        if (options == null || index < 0 || index >= options.size()) {
            return null;
        }
        return extractOptionText(options.get(index));
    }

    private String extractOptionText(Object option) {
        if (option == null) {
            return null;
        }
        if (option instanceof String text) {
            return asTrimmedString(text);
        }
        if (option instanceof Map<?, ?> map) {
            Object text = map.get("text");
            if (text != null) {
                return asTrimmedString(text.toString());
            }
            Object value = map.get("value");
            if (value != null) {
                return asTrimmedString(value.toString());
            }
            Object label = map.get("label");
            if (label != null) {
                return asTrimmedString(label.toString());
            }
        }
        return asTrimmedString(option.toString());
    }

    private String asTrimmedString(Object value) {
        if (value == null) {
            return null;
        }
        String text = value.toString().trim();
        return text.isEmpty() ? null : text;
    }

    private String firstNonBlank(String primary, String fallback) {
        return primary != null && !primary.isBlank() ? primary : fallback;
    }

    private String extractQuestionText(Map<String, Object> questionData) {
        return firstNonBlank(
                asTrimmedString(questionData.get("questionText")),
                firstNonBlank(
                        asTrimmedString(questionData.get("question")),
                        firstNonBlank(
                                asTrimmedString(questionData.get("prompt")),
                                firstNonBlank(
                                        asTrimmedString(questionData.get("statement")),
                                        firstNonBlank(
                                                asTrimmedString(questionData.get("front")),
                                                firstNonBlank(
                                                        asTrimmedString(questionData.get("term")),
                                                        asTrimmedString(questionData.get("title"))))))));
    }

    private String extractCorrectAnswer(Map<String, Object> questionData) {
        return firstNonBlank(
                asTrimmedString(questionData.get("correctAnswer")),
                firstNonBlank(
                        asTrimmedString(questionData.get("answer")),
                        firstNonBlank(
                                asTrimmedString(questionData.get("expectedAnswer")),
                                firstNonBlank(
                                        asTrimmedString(questionData.get("response")),
                                        firstNonBlank(
                                                asTrimmedString(questionData.get("back")),
                                                firstNonBlank(
                                                        asTrimmedString(questionData.get("definition")),
                                                        asTrimmedString(questionData.get("solution"))))))));
    }

    private Map<String, Object> coerceQuestionMap(Object rawQuestion) {
        if (rawQuestion == null) {
            return null;
        }
        if (rawQuestion instanceof Map<?, ?> map) {
            Map<String, Object> normalized = new LinkedHashMap<>();
            map.forEach((key, value) -> normalized.put(String.valueOf(key), value));
            return normalized;
        }
        if (rawQuestion instanceof String text) {
            String trimmed = text.trim();
            if (trimmed.isEmpty()) {
                return null;
            }
            Map<String, Object> questionMap = new LinkedHashMap<>();
            questionMap.put("questionText", trimmed);
            return questionMap;
        }
        if (rawQuestion instanceof Number || rawQuestion instanceof Boolean) {
            Map<String, Object> questionMap = new LinkedHashMap<>();
            questionMap.put("questionText", rawQuestion.toString());
            return questionMap;
        }
        return null;
    }

    private List<?> extractOptionsList(Map<String, Object> questionData) {
        Object optionsRaw = questionData.get("options");
        if (optionsRaw instanceof List<?> list) {
            return list;
        }
        optionsRaw = questionData.get("choices");
        if (optionsRaw instanceof List<?> list) {
            return list;
        }
        optionsRaw = questionData.get("answers");
        if (optionsRaw instanceof List<?> list) {
            return list;
        }
        optionsRaw = questionData.get("answerOptions");
        if (optionsRaw instanceof List<?> list) {
            return list;
        }
        return null;
    }

    private boolean isPlaceholderQuestion(String questionText, List<String> options) {
        String normalizedQuestion = normalize(questionText);
        if (normalizedQuestion.startsWith("sample question") || normalizedQuestion.startsWith("untitled question")) {
            return true;
        }

        if (options == null || options.isEmpty()) {
            return false;
        }

        List<String> normalizedOptions = options.stream()
                .map(this::normalize)
                .filter(value -> value != null && !value.isBlank())
                .toList();

        if (normalizedOptions.size() >= 4) {
            List<String> optionPlaceholders = List.of("option a", "option b", "option c", "option d");
            if (normalizedOptions.subList(0, 4).equals(optionPlaceholders)) {
                return true;
            }
            List<String> letterPlaceholders = List.of("a", "b", "c", "d");
            return normalizedOptions.subList(0, 4).equals(letterPlaceholders);
        }

        return false;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private boolean isTrueFalseAnswer(String answer) {
        if (answer == null) {
            return false;
        }
        String normalized = answer.trim().toLowerCase(Locale.ROOT);
        return normalized.equals("true") || normalized.equals("false")
                || normalized.equals("t") || normalized.equals("f")
                || normalized.equals("yes") || normalized.equals("no");
    }

    private String normalizeTrueFalseAnswer(ExamQuestion.QuestionType questionType, String answer) {
        if (questionType != ExamQuestion.QuestionType.TRUE_FALSE || answer == null) {
            return answer;
        }
        String normalized = answer.trim().toLowerCase(Locale.ROOT);
        if (normalized.equals("true") || normalized.equals("t") || normalized.equals("yes")) {
            return "True";
        }
        if (normalized.equals("false") || normalized.equals("f") || normalized.equals("no")) {
            return "False";
        }
        return answer;
    }

    private ExamQuestion.QuestionType parseQuestionType(Object rawType) {
        if (rawType == null) {
            return ExamQuestion.QuestionType.MCQ;
        }
        if (rawType instanceof ExamQuestion.QuestionType questionType) {
            return questionType;
        }

        String normalized = rawType.toString().trim().toUpperCase(Locale.ROOT);
        if (normalized.isBlank()) {
            return ExamQuestion.QuestionType.MCQ;
        }

        normalized = normalized.replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_+|_+$", "");

        switch (normalized) {
            case "QUESTION_ANSWER":
            case "SHORT_ANSWER":
            case "SHORTANSWER":
            case "Q_AND_A":
            case "QNA":
                return ExamQuestion.QuestionType.TEXT;
            case "FLASH_CARDS":
            case "FLASH_CARD":
            case "FLASHCARD":
                return ExamQuestion.QuestionType.FLASHCARD;
            case "TRUE_FALSE":
            case "TRUEFALSE":
            case "TRUE_OR_FALSE":
            case "TRUEFALSE_QUESTION":
                return ExamQuestion.QuestionType.TRUE_FALSE;
            case "MCQ":
            case "MULTIPLE_CHOICE":
            case "MULTIPLE_CHOICE_QUESTION":
            case "MULTIPLECHOICE":
                return ExamQuestion.QuestionType.MCQ;
            case "CODE":
            case "CODE_SNIPPET":
            case "CODING":
                return ExamQuestion.QuestionType.CODE;
            default:
                break;
        }

        try {
            return ExamQuestion.QuestionType.valueOf(normalized);
        } catch (IllegalArgumentException ignored) {
            return ExamQuestion.QuestionType.TEXT;
        }
    }

    private int asInteger(Object value, int fallback) {
        if (value == null) {
            return fallback;
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ignored) {
            return fallback;
        }
    }

    private double asDouble(Object value, double fallback) {
        if (value == null) {
            return fallback;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        String text = value.toString().trim();
        if (text.isEmpty()) {
            return fallback;
        }
        text = text.replace("%", "");
        try {
            return Double.parseDouble(text);
        } catch (NumberFormatException ignored) {
            return fallback;
        }
    }

    private <T extends Enum<T>> T parseEnum(Object rawValue, Class<T> enumType, T fallback) {
        if (rawValue == null) {
            return fallback;
        }

        try {
            return Enum.valueOf(enumType, rawValue.toString().trim().toUpperCase().replace('-', '_').replace(' ', '_'));
        } catch (IllegalArgumentException ignored) {
            return fallback;
        }
    }

    private Map<String, Object> toExamResponse(Exam exam) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("examId", exam.getExamId());
        response.put("title", exam.getTitle());
        response.put("description", exam.getDescription());
        response.put("course", exam.getCourse());
        response.put("instructor", exam.getInstructor());
        response.put("learnerOwner", exam.getLearnerOwner());
        response.put("sourceExam", exam.getSourceExamSummary());
        response.put("totalQuestions", exam.getTotalQuestions());
        response.put("durationMinutes", exam.getDurationMinutes());
        response.put("status", exam.getStatus());
        response.put("scheduledDate", exam.getScheduledDate());
        response.put("learningGoals", exam.getLearningGoals());
        response.put("examType", exam.getExamType());
        response.put("conductMethod", exam.getConductMethod());
        response.put("passingScore", exam.getPassingScore());
        response.put("createdAt", exam.getCreatedAt());
        response.put("updatedAt", exam.getUpdatedAt());
        return response;
    }
}
