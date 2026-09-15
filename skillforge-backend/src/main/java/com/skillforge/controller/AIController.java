package com.skillforge.controller;

import com.skillforge.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIController {

    private final GeminiService geminiService;

    @Autowired
    public AIController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * Endpoint for generating a course syllabus plan.
     * Expected body: { "subject": "Machine Learning", "difficulty": "BEGINNER" }
     */
    @PostMapping("/generate-course")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> generateCoursePlan(@RequestBody Map<String, String> request) {
        String subject = request.getOrDefault("subject", "General Topic");
        String difficulty = request.getOrDefault("difficulty", "INTERMEDIATE");

        try {
            String jsonResult = geminiService.generateCoursePlan(subject, difficulty);
            return ResponseEntity.ok(jsonResult);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Failed to generate course plan: " + e.getMessage()
            ));
        }
    }

    /**
     * Endpoint for generating exam multiple-choice questions.
     * Expected body: { "topics": "Machine Learning, Neural Nets", "count": 5 }
     */
    @PostMapping("/generate-exam")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'LEARNER', 'ADMIN')")
    public ResponseEntity<?> generateExamQuestions(@RequestBody Map<String, Object> request) {
        String topics = (String) request.getOrDefault("topics", "");
        String format = (String) request.getOrDefault("format", "MIXED");

        int count = 5;
        if (request.containsKey("count")) {
            try {
                count = Integer.parseInt(request.get("count").toString());
            } catch (NumberFormatException ignored) {
            }
        }

        try {
            String jsonResult = geminiService.generateExamQuestions(topics, count, format);
            return ResponseEntity.ok(jsonResult);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Failed to generate exam questions: " + e.getMessage()
            ));
        }
    }

    /**
     * Endpoint for generating a brief quiz based on video/lesson content.
     * Expected body: { "contentContext": "summary of the video..." }
     */
    @PostMapping("/generate-quiz")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'LEARNER')")
    public ResponseEntity<?> generateVideoQuiz(@RequestBody Map<String, String> request) {
        String contentContext = request.getOrDefault("contentContext", "");

        try {
            String jsonResult = geminiService.generateVideoQuiz(contentContext);
            return ResponseEntity.ok(jsonResult);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Failed to generate quiz: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/generate-flashcards")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'LEARNER')")
    public ResponseEntity<?> generateFlashcards(@RequestBody Map<String, Object> request) {
        String topics = (String) request.getOrDefault("topics", "");
        int count = Integer.parseInt(request.getOrDefault("count", 8).toString());

        try {
            return ResponseEntity.ok(geminiService.generateFlashcards(topics, count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Failed to generate flashcards: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/suggest-content")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> suggestLearningContent(@RequestBody Map<String, String> request) {
        String subject = request.getOrDefault("subject", "General Topic");
        String difficulty = request.getOrDefault("difficulty", "INTERMEDIATE");
        String goals = request.getOrDefault("goals", "");

        try {
            return ResponseEntity.ok(geminiService.suggestLearningContent(subject, difficulty, goals));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Failed to suggest learning content: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/grade-answer")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'LEARNER')")
    public ResponseEntity<?> gradeAnswer(@RequestBody Map<String, String> request) {
        String question = request.getOrDefault("question", "");
        String expectedAnswer = request.getOrDefault("expectedAnswer", "");
        String learnerAnswer = request.getOrDefault("learnerAnswer", "");

        try {
            return ResponseEntity.ok(geminiService.gradeDescriptiveAnswer(question, expectedAnswer, learnerAnswer));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Failed to grade answer: " + e.getMessage()
            ));
        }
    }

}
