package com.skillforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "learning_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "goal_id")
    private UUID goalId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instructor_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "passwordHash", "updatedAt" })
    private User instructor;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level")
    private DifficultyLevel difficultyLevel;

    @Column(name = "prerequisites", columnDefinition = "TEXT")
    private String prerequisites;

    @Column(name = "learning_outcomes", columnDefinition = "TEXT")
    private String learningOutcomes;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<LearningContent> contents;

    public enum DifficultyLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    // Helper methods for array-like behavior
    public String[] getPrerequisitesArray() {
        return prerequisites != null ? prerequisites.split("\\|\\|") : new String[0];
    }

    public void setPrerequisitesArray(String[] arr) {
        this.prerequisites = arr != null ? String.join("||", arr) : null;
    }

    public String[] getLearningOutcomesArray() {
        return learningOutcomes != null ? learningOutcomes.split("\\|\\|") : new String[0];
    }

    public void setLearningOutcomesArray(String[] arr) {
        this.learningOutcomes = arr != null ? String.join("||", arr) : null;
    }
}
