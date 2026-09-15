package com.skillforge.repository;

import com.skillforge.entity.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, UUID> {
    List<ExamAttempt> findByLearnerUserId(UUID learnerId);

    List<ExamAttempt> findByExamExamId(UUID examId);

    List<ExamAttempt> findByLearnerUserIdOrderByStartTimeDesc(UUID learnerId);

    List<ExamAttempt> findByExamExamIdOrderByStartTimeDesc(UUID examId);

    List<ExamAttempt> findByLearnerUserIdAndExamExamIdAndStatusOrderByStartTimeDesc(UUID learnerId, UUID examId,
            ExamAttempt.AttemptStatus status);

    List<ExamAttempt> findByExamInstructorUserId(UUID instructorId);
}
