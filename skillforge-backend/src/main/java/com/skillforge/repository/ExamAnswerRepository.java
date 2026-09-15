package com.skillforge.repository;

import com.skillforge.entity.ExamAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;
import java.util.UUID;

@Repository
public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, UUID> {
    List<ExamAnswer> findByAttemptAttemptId(UUID attemptId);

    Optional<ExamAnswer> findByAttemptAttemptIdAndQuestionQuestionId(UUID attemptId, UUID questionId);

    void deleteByAttemptAttemptIdIn(Collection<UUID> attemptIds);
}
