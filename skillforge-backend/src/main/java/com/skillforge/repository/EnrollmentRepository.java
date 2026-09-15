package com.skillforge.repository;

import com.skillforge.entity.Enrollment;
import com.skillforge.entity.LearningGoal;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByLearner(User learner);

    List<Enrollment> findByLearnerUserId(UUID learnerId);

    List<Enrollment> findByGoal(LearningGoal goal);

    Optional<Enrollment> findByLearnerAndGoal(User learner, LearningGoal goal);

    boolean existsByLearnerAndGoal(User learner, LearningGoal goal);

    long countByGoal(LearningGoal goal);

    List<Enrollment> findByGoalIn(List<LearningGoal> goals);
}
