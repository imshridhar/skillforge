package com.skillforge.repository;

import com.skillforge.entity.LearningContent;
import com.skillforge.entity.LearningGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningContentRepository extends JpaRepository<LearningContent, UUID> {
    List<LearningContent> findByGoal(LearningGoal goal);

    List<LearningContent> findByGoalOrderByOrderIndexAsc(LearningGoal goal);

    List<LearningContent> findByGoalAndParentContentIsNullOrderByOrderIndexAsc(LearningGoal goal);

    List<LearningContent> findByParentContentOrderByOrderIndexAsc(LearningContent parentContent);

    long countByGoalAndParentContentIsNotNull(LearningGoal goal);
}
