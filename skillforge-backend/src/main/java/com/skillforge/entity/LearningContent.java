package com.skillforge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "learning_content")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningContent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "content_id")
    private UUID contentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    @JsonIgnore
    private LearningGoal goal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_content_id")
    @JsonIgnore
    private LearningContent parentContent;

    @OneToMany(mappedBy = "parentContent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<LearningContent> childContents;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    @Column(name = "content_url", length = 500)
    private String contentUrl;

    @Column(name = "content_text", columnDefinition = "TEXT")
    private String contentText;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", nullable = false)
    private LearningGoal.DifficultyLevel difficultyLevel;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ContentType {
        MODULE, VIDEO, NOTE, DOCUMENT, TEXT, PDF, INTERACTIVE, QUIZ, FLASHCARD_SET
    }
}
