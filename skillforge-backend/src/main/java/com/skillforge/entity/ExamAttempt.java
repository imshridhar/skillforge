package com.skillforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "exam_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attempt_id")
    private UUID attemptId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "questions" })
    private Exam exam;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "learner_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "passwordHash", "updatedAt" })
    private User learner;

    @CreationTimestamp
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Column
    @Builder.Default
    private Double score = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @Column
    @Builder.Default
    private Integer currentQuestion = 1;

    @Column
    @Builder.Default
    private Integer totalQuestions = 0;

    @Column(length = 50)
    private String skillLevel;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ExamAnswer> answers;

    public enum AttemptStatus {
        IN_PROGRESS, COMPLETED, TIMED_OUT
    }
}
