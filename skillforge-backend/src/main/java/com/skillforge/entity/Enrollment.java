package com.skillforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "learner_id", "goal_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "enrollment_id")
    private UUID enrollmentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "learner_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "passwordHash", "updatedAt" })
    private User learner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "goal_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "contents" })
    private LearningGoal goal;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Column(name = "progress_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "enrolled_at", updatable = false)
    private LocalDateTime enrolledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_accessed")
    private LocalDateTime lastAccessed;

    public enum EnrollmentStatus {
        ACTIVE, COMPLETED, PAUSED, DROPPED
    }
}
