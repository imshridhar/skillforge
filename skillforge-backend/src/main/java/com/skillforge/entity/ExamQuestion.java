package com.skillforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exam_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "question_id")
    private UUID questionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "questions" })
    private Exam exam;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QuestionType questionType = QuestionType.MCQ;

    @Column(columnDefinition = "TEXT")
    private String optionA;

    @Column(columnDefinition = "TEXT")
    private String optionB;

    @Column(columnDefinition = "TEXT")
    private String optionC;

    @Column(columnDefinition = "TEXT")
    private String optionD;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String correctAnswer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;

    @Column(columnDefinition = "TEXT")
    private String topic;

    @Column
    @Builder.Default
    private Double aiConfidence = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String codeSnippet;

    @Column(columnDefinition = "TEXT")
    private String objective;

    @Column
    private Integer orderIndex;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum QuestionType {
        MCQ, CODE, TRUE_FALSE, FLASHCARD, TEXT
    }

    public enum DifficultyLevel {
        EASY, MEDIUM, HARD
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
