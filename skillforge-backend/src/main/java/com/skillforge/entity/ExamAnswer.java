package com.skillforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exam_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "answer_id")
    private UUID answerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "answers" })
    private ExamAttempt attempt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private ExamQuestion question;

    @Column(columnDefinition = "TEXT")
    private String selectedAnswer;

    @Column
    @Builder.Default
    private Boolean isCorrect = false;

    @Column
    @Builder.Default
    private Double awardedScore = 0.0;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column
    private Integer timeTakenSeconds;

    @CreationTimestamp
    private LocalDateTime answeredAt;
}
