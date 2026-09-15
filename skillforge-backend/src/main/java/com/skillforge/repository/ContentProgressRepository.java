package com.skillforge.repository;

import com.skillforge.entity.ContentProgress;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.LearningContent;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentProgressRepository extends JpaRepository<ContentProgress, UUID> {
    Optional<ContentProgress> findByLearnerAndContent(User learner, LearningContent content);

    List<ContentProgress> findByEnrollment(Enrollment enrollment);

    long countByEnrollmentAndStatus(Enrollment enrollment, ContentProgress.Status status);
}
