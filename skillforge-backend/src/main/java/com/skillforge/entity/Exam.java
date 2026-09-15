package com.skillforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "exam_id")
    private UUID examId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "contents", "instructor" })
    private LearningGoal course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instructor_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "passwordHash", "updatedAt" })
    private User instructor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "learner_owner_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "passwordHash", "updatedAt" })
    private User learnerOwner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_exam_id")
    @Getter(AccessLevel.NONE)
    @JsonIgnore
    private Exam sourceExam;

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ExamStatus status = ExamStatus.DRAFT;

    private LocalDateTime scheduledDate;

    @Column(columnDefinition = "TEXT")
    private String learningGoals;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'EXAM'")
    @Builder.Default
    private ExamType examType = ExamType.EXAM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'QUIZ'")
    @Builder.Default
    private ConductMethod conductMethod = ConductMethod.QUIZ;

    @Column(nullable = false)
    @Builder.Default
    private Integer passingScore = 70;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ExamQuestion> questions;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @JsonProperty("sourceExam")
    public SourceExamSummary getSourceExamSummary() {
        if (sourceExam == null) {
            return null;
        }

        return new SourceExamSummary(sourceExam.getExamId(), sourceExam.getTitle());
    }

    public enum ExamStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }

    public enum ExamType {
        EXAM, QUIZ, PRACTICE
    }

    public enum ConductMethod {
        QUIZ, MCQ, TRUE_FALSE, QUESTION_ANSWER, FLASH_CARDS, MIXED
    }

    public record SourceExamSummary(UUID examId, String title) {
    }
}
