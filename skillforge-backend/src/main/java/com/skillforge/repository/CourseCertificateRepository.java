package com.skillforge.repository;

import com.skillforge.entity.CourseCertificate;
import com.skillforge.entity.LearningGoal;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;
import java.util.UUID;

@Repository
public interface CourseCertificateRepository extends JpaRepository<CourseCertificate, UUID> {
    Optional<CourseCertificate> findByLearnerAndCourse(User learner, LearningGoal course);

    Optional<CourseCertificate> findByExamAttemptAttemptId(UUID attemptId);

    List<CourseCertificate> findByLearnerUserId(UUID learnerId);

    void deleteByExamAttemptAttemptIdIn(Collection<UUID> attemptIds);
}
