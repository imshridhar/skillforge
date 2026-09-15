package com.skillforge.repository;

import com.skillforge.entity.LearningGoal;
import com.skillforge.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningGoalRepository extends JpaRepository<LearningGoal, UUID> {
    List<LearningGoal> findByInstructor(User instructor);

    Page<LearningGoal> findByIsPublishedTrue(Pageable pageable);

    List<LearningGoal> findBySubjectContainingIgnoreCase(String subject);
}
