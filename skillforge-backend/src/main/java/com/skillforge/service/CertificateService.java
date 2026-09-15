package com.skillforge.service;

import com.skillforge.entity.CourseCertificate;
import com.skillforge.entity.Exam;
import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.LearningGoal;
import com.skillforge.entity.User;
import com.skillforge.repository.CourseCertificateRepository;
import com.skillforge.repository.ExamAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CertificateService {

    private final CourseCertificateRepository certificateRepository;
    private final ExamAttemptRepository examAttemptRepository;

    public Optional<CourseCertificate> issueIfEligible(ExamAttempt attempt) {
        if (attempt == null || attempt.getExam() == null) {
            return Optional.empty();
        }

        Exam exam = attempt.getExam();
        if (exam.getExamType() == Exam.ExamType.PRACTICE) {
            return Optional.empty();
        }

        LearningGoal course = exam.getCourse();
        if (course == null || attempt.getLearner() == null) {
            return Optional.empty();
        }

        Double score = attempt.getScore();
        if (score == null || score < exam.getPassingScore()) {
            return Optional.empty();
        }

        return certificateRepository.findByLearnerAndCourse(attempt.getLearner(), course)
                .or(() -> Optional.of(certificateRepository.save(CourseCertificate.builder()
                        .learner(attempt.getLearner())
                        .course(course)
                        .examAttempt(attempt)
                        .score(score)
                        .certificateNumber(generateCertificateNumber())
                        .build())));
    }

    public CourseCertificate getCertificateForAttempt(UUID attemptId, User learner) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getLearner().getUserId().equals(learner.getUserId())) {
            throw new RuntimeException("Not authorized to access this certificate");
        }

        LearningGoal course = attempt.getExam().getCourse();
        if (course == null) {
            throw new RuntimeException("Certificate not found");
        }

        Optional<CourseCertificate> directMatch = certificateRepository.findByExamAttemptAttemptId(attemptId);
        if (directMatch.isPresent()) {
            CourseCertificate certificate = directMatch.get();
            if (!certificate.getLearner().getUserId().equals(learner.getUserId())) {
                throw new RuntimeException("Not authorized to access this certificate");
            }
            if (certificate.getCourse() != null
                    && certificate.getCourse().getGoalId().equals(course.getGoalId())) {
                return certificate;
            }
        }

        return certificateRepository.findByLearnerAndCourse(learner, course)
                .or(() -> issueIfEligible(attempt))
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
    }

    public CourseCertificate getCertificate(UUID certificateId, User learner) {
        CourseCertificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        if (!certificate.getLearner().getUserId().equals(learner.getUserId())) {
            throw new RuntimeException("Not authorized to access this certificate");
        }

        return certificate;
    }

    public List<CourseCertificate> getCertificatesForLearner(User learner) {
        return certificateRepository.findByLearnerUserId(learner.getUserId());
    }

    public byte[] renderCertificateHtml(CourseCertificate certificate) {
        String issuedDate = certificate.getIssuedAt() != null
                ? certificate.getIssuedAt().toLocalDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))
                : LocalDate.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));

        String html = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <title>SkillForge Certificate</title>
                  <style>
                    body { font-family: 'Georgia', serif; background: #f8fafc; padding: 40px; }
                    .certificate { background: #ffffff; border: 6px solid #0f172a; padding: 48px; max-width: 900px; margin: auto; }
                    .header { text-align: center; margin-bottom: 32px; }
                    .title { font-size: 36px; font-weight: 700; margin: 0; }
                    .subtitle { font-size: 16px; color: #475569; margin-top: 8px; }
                    .content { text-align: center; margin: 32px 0; font-size: 18px; color: #0f172a; }
                    .name { font-size: 28px; font-weight: 700; margin: 12px 0; }
                    .course { font-size: 22px; font-weight: 600; margin: 12px 0; }
                    .footer { display: flex; justify-content: space-between; margin-top: 48px; font-size: 14px; color: #475569; }
                    .badge { text-transform: uppercase; letter-spacing: 2px; font-size: 12px; color: #0f172a; }
                  </style>
                </head>
                <body>
                  <div class="certificate">
                    <div class="header">
                      <div class="badge">SkillForge</div>
                      <h1 class="title">Certificate of Completion</h1>
                      <div class="subtitle">This certifies that</div>
                    </div>
                    <div class="content">
                      <div class="name">%s</div>
                      <div>has successfully completed</div>
                      <div class="course">%s</div>
                      <div>with a score of <strong>%s%%</strong></div>
                    </div>
                    <div class="footer">
                      <div>Issued: %s</div>
                      <div>Certificate ID: %s</div>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                certificate.getLearner().getFirstName() + " " + certificate.getLearner().getLastName(),
                certificate.getCourse().getTitle(),
                certificate.getScore() != null ? Math.round(certificate.getScore()) : "-",
                issuedDate,
                certificate.getCertificateNumber()
        );

        return html.getBytes(StandardCharsets.UTF_8);
    }

    private String generateCertificateNumber() {
        return "SF-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
