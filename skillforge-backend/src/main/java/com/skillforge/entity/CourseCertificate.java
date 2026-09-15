package com.skillforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "course_certificates",
        uniqueConstraints = @UniqueConstraint(columnNames = { "learner_id", "course_id" })
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "certificate_id")
    private UUID certificateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learner_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "passwordHash", "updatedAt" })
    private User learner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private LearningGoal course;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private ExamAttempt examAttempt;

    @Column(name = "certificate_number", length = 50, nullable = false)
    private String certificateNumber;

    @Column(name = "score")
    private Double score;

    @CreationTimestamp
    @Column(name = "issued_at", updatable = false)
    private LocalDateTime issuedAt;
}
