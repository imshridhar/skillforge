package com.skillforge.repository;

import com.skillforge.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, UUID> {
    List<ExamQuestion> findByExamExamIdOrderByOrderIndexAsc(UUID examId);

    long countByExamExamIdAndApprovalStatus(UUID examId, ExamQuestion.ApprovalStatus status);
}