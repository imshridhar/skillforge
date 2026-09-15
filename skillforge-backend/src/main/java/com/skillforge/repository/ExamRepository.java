package com.skillforge.repository;

import com.skillforge.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExamRepository extends JpaRepository<Exam, UUID> {
    List<Exam> findByInstructorUserId(UUID instructorId);

    List<Exam> findByStatus(Exam.ExamStatus status);

    List<Exam> findByCourseGoalId(UUID courseId);

    List<Exam> findByCourseGoalIdIn(Collection<UUID> courseIds);

    List<Exam> findByLearnerOwnerUserId(UUID learnerId);

}
