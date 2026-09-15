package com.skillforge.config;

import com.skillforge.entity.*;
import com.skillforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@SuppressWarnings("null")
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final LearningGoalRepository learningGoalRepository;
        private final EnrollmentRepository enrollmentRepository;
        private final ExamRepository examRepository;
        private final ExamQuestionRepository examQuestionRepository;
        private final LearningContentRepository learningContentRepository;
        private final ExamAttemptRepository examAttemptRepository;
        private final ExamAnswerRepository examAnswerRepository;
        private final SystemConfigRepository systemConfigRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                // Create demo users
                createUserIfNotExists("admin@skillforge.com", "admin123", "Admin", "User",
                                User.Role.ADMIN);
                User instructor = createUserIfNotExists("instructor@skillforge.com", "instructor123", "Shridhar",
                                "Havinal", User.Role.INSTRUCTOR);
                User learner = createUserIfNotExists("learner@skillforge.com", "learner123", "Spoorti",
                                "Arakeri", User.Role.LEARNER);

                // Create demo learning goals
                if (learningGoalRepository.count() == 0 && instructor != null) {
                        createDemoData(instructor, learner);
                }

                // Create system config
                if (systemConfigRepository.count() == 0) {
                        systemConfigRepository.save(SystemConfig.builder().build());
                }

                System.out.println("-----");
                System.out.println("SkillForge Backend Started Successfully!");
                System.out.println("-----");
                System.out.println("credentials:");
                System.out.println("  Admin: admin@skillforge.com / admin123");
                System.out.println("  Instructor: instructor@skillforge.com / instructor123");
                System.out.println("  Learner: learner@skillforge.com / learner123");
                System.out.println("-----");
        }

        private User createUserIfNotExists(String email, String password, String firstName, String lastName,
                        User.Role role) {
                if (!userRepository.existsByEmail(email)) {
                        User user = User.builder()
                                        .email(email)
                                        .passwordHash(passwordEncoder.encode(password))
                                        .firstName(firstName)
                                        .lastName(lastName)
                                        .role(role)
                                        .isActive(true)
                                        .isVerified(true)
                                        .build();
                        return Objects.requireNonNull(userRepository.save(user));
                }
                return userRepository.findByEmail(email).orElse(null);
        }

        private void createDemoData(User instructor, User learner) {
                // === Learning Goals (Courses) ===
                LearningGoal mlCourse = learningGoalRepository.save(LearningGoal.builder()
                                .instructor(instructor)
                                .title("Advanced Machine Learning Algorithms")
                                .description("Deep dive into neural networks, backpropagation, gradient descent, and modern ML architectures.")
                                .subject("Artificial Intelligence")
                                .difficultyLevel(LearningGoal.DifficultyLevel.ADVANCED)
                                .learningOutcomes(
                                                "Understand neural networks||Implement backpropagation||Optimize with gradient descent")
                                .isPublished(true)
                                .build());

                LearningGoal reactCourse = learningGoalRepository.save(LearningGoal.builder()
                                .instructor(instructor)
                                .title("React.js Fundamentals")
                                .description("Build modern web applications using React, Redux, and component architecture.")
                                .subject("Web Development")
                                .difficultyLevel(LearningGoal.DifficultyLevel.INTERMEDIATE)
                                .learningOutcomes(
                                                "Build React components||Manage state with Redux||Integrate REST APIs")
                                .isPublished(true)
                                .build());

                learningGoalRepository.save(LearningGoal.builder()
                                .instructor(instructor)
                                .title("Spring Boot Microservices")
                                .description("Design and implement microservice architectures using Spring Boot and Spring Cloud.")
                                .subject("Backend Development")
                                .difficultyLevel(LearningGoal.DifficultyLevel.ADVANCED)
                                .learningOutcomes(
                                                "Build microservices||Implement service discovery||Deploy with Docker")
                                .isPublished(true)
                                .build());

                LearningGoal dsCourse = learningGoalRepository.save(LearningGoal.builder()
                                .instructor(instructor)
                                .title("Data Structures & Algorithms")
                                .description("Master trees, graphs, heaps, and algorithmic problem solving techniques.")
                                .subject("Computer Science")
                                .difficultyLevel(LearningGoal.DifficultyLevel.INTERMEDIATE)
                                .learningOutcomes(
                                                "Implement trees and graphs||Analyze time complexity||Solve algorithmic problems")
                                .isPublished(true)
                                .build());

                learningGoalRepository.save(LearningGoal.builder()
                                .instructor(instructor)
                                .title("Python Data Structures")
                                .description("Strengthen your algorithmic thinking with Python-based data structures course.")
                                .subject("Computer Science")
                                .difficultyLevel(LearningGoal.DifficultyLevel.BEGINNER)
                                .learningOutcomes("Python fundamentals||Lists and dictionaries||Algorithm design")
                                .isPublished(true)
                                .build());

                learningGoalRepository.save(LearningGoal.builder()
                                .instructor(instructor)
                                .title("PostgreSQL Optimization")
                                .description("Advanced techniques for PostgreSQL query optimization and database tuning.")
                                .subject("Database")
                                .difficultyLevel(LearningGoal.DifficultyLevel.ADVANCED)
                                .learningOutcomes("Query optimization||Index strategies||Performance tuning")
                                .isPublished(true)
                                .build());

                learningContentRepository.save(LearningContent.builder()
                                .goal(mlCourse)
                                .title("Module 1: Neural Network Basics")
                                .contentType(LearningContent.ContentType.MODULE)
                                .contentText("Understand neurons, activation functions, and forward propagation.")
                                .durationMinutes(90)
                                .difficultyLevel(mlCourse.getDifficultyLevel())
                                .orderIndex(1)
                                .metadata("AI-generated outline")
                                .build());

                LearningContent reactModule = learningContentRepository.save(LearningContent.builder()
                                .goal(reactCourse)
                                .title("Module 1: React Foundations")
                                .contentType(LearningContent.ContentType.MODULE)
                                .contentText("Components, JSX, props, and state management basics.")
                                .durationMinutes(75)
                                .difficultyLevel(reactCourse.getDifficultyLevel())
                                .orderIndex(1)
                                .metadata("Recommended learning path")
                                .build());

                learningContentRepository.save(LearningContent.builder()
                                .goal(reactCourse)
                                .parentContent(reactModule)
                                .title("Intro Video")
                                .contentType(LearningContent.ContentType.VIDEO)
                                .contentUrl("https://example.com/react-intro")
                                .contentText("Welcome to React fundamentals.")
                                .durationMinutes(15)
                                .difficultyLevel(reactCourse.getDifficultyLevel())
                                .orderIndex(1)
                                .metadata("Starter lesson")
                                .build());

                learningContentRepository.save(LearningContent.builder()
                                .goal(reactCourse)
                                .parentContent(reactModule)
                                .title("Hooks Notes")
                                .contentType(LearningContent.ContentType.NOTE)
                                .contentText("useState, useEffect, derived state, and side-effect patterns.")
                                .durationMinutes(25)
                                .difficultyLevel(reactCourse.getDifficultyLevel())
                                .orderIndex(2)
                                .metadata("Revision notes")
                                .build());

                LearningContent dsModule = learningContentRepository.save(LearningContent.builder()
                                .goal(dsCourse)
                                .title("Module 1: Trees and Graphs")
                                .contentType(LearningContent.ContentType.MODULE)
                                .contentText("Explore advanced traversal and shortest-path strategies.")
                                .durationMinutes(80)
                                .difficultyLevel(dsCourse.getDifficultyLevel())
                                .orderIndex(1)
                                .metadata("Exam-aligned module")
                                .build());

                learningContentRepository.save(LearningContent.builder()
                                .goal(dsCourse)
                                .parentContent(dsModule)
                                .title("Traversal Cheat Sheet")
                                .contentType(LearningContent.ContentType.DOCUMENT)
                                .contentText("In-order, pre-order, post-order, BFS, DFS quick reference.")
                                .durationMinutes(20)
                                .difficultyLevel(dsCourse.getDifficultyLevel())
                                .orderIndex(1)
                                .metadata("Downloadable study guide")
                                .build());

                // === Enrollments ===
                if (learner != null) {
                        enrollmentRepository.save(Enrollment.builder()
                                        .learner(learner)
                                        .goal(mlCourse)
                                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                                        .progressPercentage(new BigDecimal("75.0"))
                                        .build());

                        enrollmentRepository.save(Enrollment.builder()
                                        .learner(learner)
                                        .goal(reactCourse)
                                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                                        .progressPercentage(new BigDecimal("45.0"))
                                        .build());

                        enrollmentRepository.save(Enrollment.builder()
                                        .learner(learner)
                                        .goal(dsCourse)
                                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                                        .progressPercentage(new BigDecimal("92.0"))
                                        .build());
                }

                // === Exams ===
                Exam dsExam = examRepository.save(Exam.builder()
                                .title("Midterm 2026")
                                .description("Generated based on Learning Goals: Advanced Trees, Graphs, and Heaps.")
                                .course(dsCourse)
                                .instructor(instructor)
                                .totalQuestions(25)
                                .durationMinutes(120)
                                .status(Exam.ExamStatus.DRAFT)
                                .learningGoals("Advanced Trees, Graphs, and Heaps")
                                .scheduledDate(LocalDateTime.now().plusDays(14))
                                .build());

                examRepository.save(Exam.builder()
                                .title("Advanced Java Certification")
                                .description("Final certification exam for ML course.")
                                .course(mlCourse)
                                .instructor(instructor)
                                .totalQuestions(15)
                                .durationMinutes(60)
                                .status(Exam.ExamStatus.PUBLISHED)
                                .conductMethod(Exam.ConductMethod.MCQ)
                                .scheduledDate(LocalDateTime.now().plusDays(7))
                                .build());

                // === Exam Questions (DS Exam) ===
                examQuestionRepository.save(ExamQuestion.builder()
                                .exam(dsExam)
                                .questionText("What is the worst-case time complexity for searching in a Binary Search Tree (BST)?")
                                .questionType(ExamQuestion.QuestionType.MCQ)
                                .optionA("O(1)")
                                .optionB("O(log n)")
                                .optionC("O(n)")
                                .optionD("O(n log n)")
                                .correctAnswer("O(n)")
                                .difficulty(ExamQuestion.DifficultyLevel.EASY)
                                .topic("Binary Trees")
                                .aiConfidence(0.98)
                                .approvalStatus(ExamQuestion.ApprovalStatus.APPROVED)
                                .objective("Understand complexity analysis of tree operations")
                                .orderIndex(1)
                                .build());

                examQuestionRepository.save(ExamQuestion.builder()
                                .exam(dsExam)
                                .questionText("Which algorithm is best suited for finding the shortest path in a weighted graph with non-negative edge weights?")
                                .questionType(ExamQuestion.QuestionType.MCQ)
                                .optionA("Dijkstra's Algorithm")
                                .optionB("Bellman-Ford Algorithm")
                                .optionC("Prim's Algorithm")
                                .optionD("Kruskal's Algorithm")
                                .correctAnswer("Dijkstra's Algorithm")
                                .difficulty(ExamQuestion.DifficultyLevel.MEDIUM)
                                .topic("Graphs")
                                .aiConfidence(0.85)
                                .approvalStatus(ExamQuestion.ApprovalStatus.PENDING)
                                .objective("Apply graph traversal algorithms")
                                .orderIndex(2)
                                .build());

                examQuestionRepository.save(ExamQuestion.builder()
                                .exam(dsExam)
                                .questionText("Analyze the following code snippet. What will be the state of the array after the heapify operation on index 1?")
                                .questionType(ExamQuestion.QuestionType.CODE)
                                .optionA("[10, 5, 15, 2, 4, 3]")
                                .optionB("[15, 10, 5, 2, 4, 3]")
                                .optionC("[10, 5, 3, 2, 4, 15]")
                                .optionD("[5, 10, 15, 2, 4, 3]")
                                .correctAnswer("[10, 5, 15, 2, 4, 3]")
                                .difficulty(ExamQuestion.DifficultyLevel.HARD)
                                .topic("Heaps")
                                .aiConfidence(0.72)
                                .approvalStatus(ExamQuestion.ApprovalStatus.PENDING)
                                .codeSnippet("def heapify(arr, n, i):\n    largest = i\n    l = 2 * i + 1\n    r = 2 * i + 2\n    if l < n and arr[i] < arr[l]:\n        largest = l\n    # ... rest of implementation\narr = [10, 5, 3, 2, 4, 15]\n# Assume Max Heap logic")
                                .objective("Trace heap operations code")
                                .orderIndex(3)
                                .build());

                examQuestionRepository.save(ExamQuestion.builder()
                                .exam(dsExam)
                                .questionText("In a BST, which traversal yields the node values in sorted ascending order?")
                                .questionType(ExamQuestion.QuestionType.MCQ)
                                .optionA("In-order traversal")
                                .optionB("Pre-order traversal")
                                .optionC("Post-order traversal")
                                .optionD("Level-order traversal")
                                .correctAnswer("In-order traversal")
                                .difficulty(ExamQuestion.DifficultyLevel.EASY)
                                .topic("BST")
                                .aiConfidence(0.99)
                                .approvalStatus(ExamQuestion.ApprovalStatus.APPROVED)
                                .objective("Identify traversal properties")
                                .orderIndex(4)
                                .build());

                if (learner != null) {
                        if (dsExam != null) {
                                ExamAttempt attempt = examAttemptRepository.save(ExamAttempt.builder()
                                                .exam(dsExam)
                                                .learner(learner)
                                                .status(ExamAttempt.AttemptStatus.COMPLETED)
                                                .currentQuestion(1)
                                                .totalQuestions(1)
                                                .score(84.0)
                                                .endTime(LocalDateTime.now().minusDays(1))
                                                .skillLevel("ADVANCED")
                                                .build());

                                ExamQuestion sampleQuestion = examQuestionRepository.findByExamExamIdOrderByOrderIndexAsc(dsExam.getExamId())
                                                .stream()
                                                .findFirst()
                                                .orElse(null);

                                if (sampleQuestion != null) {
                                        examAnswerRepository.save(ExamAnswer.builder()
                                                        .attempt(attempt)
                                                        .question(sampleQuestion)
                                                        .selectedAnswer("A")
                                                        .isCorrect(true)
                                                        .awardedScore(100.0)
                                                        .feedback("Strong grasp of the core concept.")
                                                        .timeTakenSeconds(35)
                                                        .build());
                                }
                        }
                }
        }
}
