package com.skillforge.config;

import com.skillforge.entity.*;
import com.skillforge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LearningGoalRepository learningGoalRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExamRepository examRepository;
    private final LearningContentRepository learningContentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already contains data — checking for missing course content.");
            seedCourseContentForExistingCourses();
            return;
        }

        log.info("Seeding database with sample data...");

        // ─── Users ─────────────────────────────────────────────────────────
        String hash = passwordEncoder.encode("password123");

        userRepository.save(User.builder()
                .email("admin@skillforge.io")
                .passwordHash(hash)
                .firstName("Rajesh")
                .lastName("Sharma")
                .role(User.Role.ADMIN)
                .isActive(true)
                .isVerified(true)
                .build());

        User instructor1 = userRepository.save(User.builder()
                .email("shridhar.havinal@skillforge.io")
                .passwordHash(hash)
                .firstName("Shridhar")
                .lastName("Havinal")
                .role(User.Role.INSTRUCTOR)
                .isActive(true)
                .isVerified(true)
                .build());

        User instructor2 = userRepository.save(User.builder()
                .email("priya.patel@skillforge.io")
                .passwordHash(hash)
                .firstName("Priya")
                .lastName("Patel")
                .role(User.Role.INSTRUCTOR)
                .isActive(true)
                .isVerified(true)
                .build());

        User learner1 = userRepository.save(User.builder()
                .email("spoorti.arakeri@university.edu")
                .passwordHash(hash)
                .firstName("Spoorti")
                .lastName("Arakeri")
                .role(User.Role.LEARNER)
                .isActive(true)
                .isVerified(true)
                .build());

        User learner2 = userRepository.save(User.builder()
                .email("ananya.desai@student.edu")
                .passwordHash(hash)
                .firstName("Ananya")
                .lastName("Desai")
                .role(User.Role.LEARNER)
                .isActive(true)
                .isVerified(true)
                .build());

        User learner3 = userRepository.save(User.builder()
                .email("rahul.kumar@student.edu")
                .passwordHash(hash)
                .firstName("Rahul")
                .lastName("Kumar")
                .role(User.Role.LEARNER)
                .isActive(true)
                .isVerified(true)
                .build());

        User learner4 = userRepository.save(User.builder()
                .email("meera.nair@student.edu")
                .passwordHash(hash)
                .firstName("Meera")
                .lastName("Nair")
                .role(User.Role.LEARNER)
                .isActive(true)
                .isVerified(true)
                .build());

        // ─── Courses (Learning Goals) ──────────────────────────────────────
        LearningGoal course1 = learningGoalRepository.save(LearningGoal.builder()
                .instructor(instructor1)
                .title("React.js Fundamentals")
                .description(
                        "Master React.js from the ground up. Learn components, hooks, state management, and build modern single-page applications.")
                .subject("Frontend Development")
                .difficultyLevel(LearningGoal.DifficultyLevel.INTERMEDIATE)
                .prerequisites("HTML||CSS||JavaScript basics")
                .learningOutcomes("Build SPAs with React||Use hooks and context||Manage application state")
                .isPublished(true)
                .build());

        LearningGoal course2 = learningGoalRepository.save(LearningGoal.builder()
                .instructor(instructor1)
                .title("Spring Boot Microservices")
                .description(
                        "Design and build production-ready microservices with Spring Boot, including service discovery, API gateways, and distributed tracing.")
                .subject("Backend Development")
                .difficultyLevel(LearningGoal.DifficultyLevel.ADVANCED)
                .prerequisites("Java Core||Spring Framework||REST APIs")
                .learningOutcomes("Build microservices architecture||Implement service discovery||Deploy with Docker")
                .isPublished(true)
                .build());

        LearningGoal course3 = learningGoalRepository.save(LearningGoal.builder()
                .instructor(instructor2)
                .title("PostgreSQL Optimization")
                .description(
                        "Deep dive into PostgreSQL performance tuning. Learn query optimization, indexing strategies, and database scaling patterns.")
                .subject("Database Engineering")
                .difficultyLevel(LearningGoal.DifficultyLevel.ADVANCED)
                .prerequisites("SQL basics||Relational database concepts")
                .learningOutcomes("Optimize complex queries||Design efficient indexes||Scale PostgreSQL databases")
                .isPublished(true)
                .build());

        LearningGoal course4 = learningGoalRepository.save(LearningGoal.builder()
                .instructor(instructor2)
                .title("Python for Data Science")
                .description(
                        "Learn Python programming for data analysis, visualization, and machine learning fundamentals using pandas, matplotlib, and scikit-learn.")
                .subject("Data Science")
                .difficultyLevel(LearningGoal.DifficultyLevel.BEGINNER)
                .prerequisites("Basic programming concepts")
                .learningOutcomes("Analyze data with pandas||Create visualizations||Build ML models")
                .isPublished(true)
                .build());

        LearningGoal course5 = learningGoalRepository.save(LearningGoal.builder()
                .instructor(instructor1)
                .title("System Design Principles")
                .description(
                        "Master the fundamentals of designing scalable distributed systems, including load balancing, caching, database sharding, and messaging queues.")
                .subject("System Design")
                .difficultyLevel(LearningGoal.DifficultyLevel.ADVANCED)
                .prerequisites("Web development experience||Database knowledge")
                .learningOutcomes("Design scalable architectures||Apply CAP theorem||Choose appropriate databases")
                .isPublished(true)
                .build());

        seedCourseContent(List.of(course1, course2, course3, course4, course5));


        // ─── Enrollments ───────────────────────────────────────────────────
        enrollmentRepository.saveAll(List.of(
                Enrollment.builder()
                        .learner(learner1).goal(course1)
                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                        .progressPercentage(new BigDecimal("72.50"))
                        .lastAccessed(LocalDateTime.now().minusHours(2))
                        .build(),
                Enrollment.builder()
                        .learner(learner1).goal(course2)
                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                        .progressPercentage(new BigDecimal("35.00"))
                        .lastAccessed(LocalDateTime.now().minusDays(1))
                        .build(),
                Enrollment.builder()
                        .learner(learner2).goal(course1)
                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                        .progressPercentage(new BigDecimal("88.00"))
                        .lastAccessed(LocalDateTime.now().minusHours(5))
                        .build(),
                Enrollment.builder()
                        .learner(learner2).goal(course4)
                        .status(Enrollment.EnrollmentStatus.COMPLETED)
                        .progressPercentage(new BigDecimal("100.00"))
                        .completedAt(LocalDateTime.now().minusDays(3))
                        .lastAccessed(LocalDateTime.now().minusDays(3))
                        .build(),
                Enrollment.builder()
                        .learner(learner3).goal(course2)
                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                        .progressPercentage(new BigDecimal("55.00"))
                        .lastAccessed(LocalDateTime.now().minusHours(8))
                        .build(),
                Enrollment.builder()
                        .learner(learner3).goal(course3)
                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                        .progressPercentage(new BigDecimal("20.00"))
                        .lastAccessed(LocalDateTime.now().minusDays(2))
                        .build(),
                Enrollment.builder()
                        .learner(learner4).goal(course4)
                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                        .progressPercentage(new BigDecimal("45.00"))
                        .lastAccessed(LocalDateTime.now().minusHours(12))
                        .build(),
                Enrollment.builder()
                        .learner(learner4).goal(course5)
                        .status(Enrollment.EnrollmentStatus.ACTIVE)
                        .progressPercentage(new BigDecimal("10.00"))
                        .lastAccessed(LocalDateTime.now().minusDays(4))
                        .build()));

        // ─── Exams ─────────────────────────────────────────────────────────
        examRepository.saveAll(List.of(
                Exam.builder()
                        .title("Advanced Java Certification")
                        .description("Comprehensive exam covering Java concurrency, streams, and design patterns.")
                        .course(course2)
                        .instructor(instructor1)
                        .totalQuestions(25)
                        .durationMinutes(120)
                        .status(Exam.ExamStatus.PUBLISHED)
                        .scheduledDate(LocalDateTime.now().plusDays(7))
                        .learningGoals("Concurrency, Streams, Design Patterns")
                        .build(),
                Exam.builder()
                        .title("React Component Quiz")
                        .description("Test your knowledge of React component patterns, hooks, and state management.")
                        .course(course1)
                        .instructor(instructor1)
                        .totalQuestions(15)
                        .durationMinutes(60)
                        .status(Exam.ExamStatus.PUBLISHED)
                        .scheduledDate(LocalDateTime.now().plusDays(13))
                        .learningGoals("Components, Hooks, State")
                        .build(),
                Exam.builder()
                        .title("SQL Performance Optimization")
                        .description("Exam on query optimization, indexing, and PostgreSQL-specific tuning techniques.")
                        .course(course3)
                        .instructor(instructor2)
                        .totalQuestions(20)
                        .durationMinutes(90)
                        .status(Exam.ExamStatus.PUBLISHED)
                        .scheduledDate(LocalDateTime.now().plusDays(20))
                        .learningGoals("Query Optimization, Indexing, Tuning")
                        .build(),
                Exam.builder()
                        .title("Spring Boot Security Deep Dive")
                        .description("Draft exam covering Spring Security, OAuth2, and JWT authentication.")
                        .course(course2)
                        .instructor(instructor1)
                        .totalQuestions(20)
                        .durationMinutes(60)
                        .status(Exam.ExamStatus.DRAFT)
                        .learningGoals("Spring Security, OAuth2, JWT")
                        .build()));

        log.info("Database seeded successfully with {} users, {} courses, {} enrollments, {} exams.",
                userRepository.count(),
                learningGoalRepository.count(),
                enrollmentRepository.count(),
                examRepository.count());
    }

    private void seedCourseContentForExistingCourses() {
        List<LearningGoal> existing = learningGoalRepository.findAll();
        if (existing.isEmpty()) {
            return;
        }

        seedCourseContent(existing);
    }

    private void seedCourseContent(List<LearningGoal> courses) {
        for (LearningGoal course : courses) {
            if (course == null) {
                continue;
            }

            boolean hasModules = !learningContentRepository
                    .findByGoalAndParentContentIsNullOrderByOrderIndexAsc(course)
                    .isEmpty();

            if (hasModules) {
                continue;
            }

            switch (course.getTitle()) {
                case "React.js Fundamentals" -> seedReactFundamentals(course);
                case "Spring Boot Microservices" -> seedSpringBootMicroservices(course);
                case "PostgreSQL Optimization" -> seedPostgresOptimization(course);
                case "Python for Data Science" -> seedPythonDataScience(course);
                case "System Design Principles" -> seedSystemDesign(course);
                default -> {
                    // Skip unknown titles to avoid polluting custom data.
                }
            }
        }
    }

    private LearningContent createModule(LearningGoal goal, int order, String title, String description, int duration, String metadata) {
        return learningContentRepository.save(LearningContent.builder()
                .goal(goal)
                .title(title)
                .contentType(LearningContent.ContentType.MODULE)
                .contentText(description)
                .durationMinutes(duration)
                .difficultyLevel(goal.getDifficultyLevel())
                .orderIndex(order)
                .metadata(metadata)
                .build());
    }

    private LearningContent createContent(
            LearningGoal goal,
            LearningContent module,
            int order,
            String title,
            LearningContent.ContentType type,
            String url,
            String text,
            int duration,
            String metadata) {
        return learningContentRepository.save(LearningContent.builder()
                .goal(goal)
                .parentContent(module)
                .title(title)
                .contentType(type)
                .contentUrl(url)
                .contentText(text)
                .durationMinutes(duration)
                .difficultyLevel(goal.getDifficultyLevel())
                .orderIndex(order)
                .metadata(metadata)
                .build());
    }

    private void seedReactFundamentals(LearningGoal course) {
        LearningContent module1 = createModule(
                course,
                1,
                "Module 1: React Foundations",
                "Understand components, JSX, and the mental model behind declarative UIs.",
                90,
                "React core concepts and best practices");

        createContent(
                course,
                module1,
                1,
                "Welcome to React (Video)",
                LearningContent.ContentType.VIDEO,
                "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                "Kick off the course with a guided walkthrough of React fundamentals.",
                18,
                "Instructor-led walkthrough");

        createContent(
                course,
                module1,
                2,
                "Component Mindset (Text)",
                LearningContent.ContentType.TEXT,
                null,
                "Learn how to break screens into reusable components and think in data flows.",
                12,
                "Key ideas and examples");

        String jsxQuiz = """
                {
                  "questions": [
                    {
                      "question": "What is the primary benefit of JSX?",
                      "options": ["It compiles to HTML at runtime", "It lets you write UI and logic together", "It replaces JavaScript", "It only works with class components"],
                      "answer": "It lets you write UI and logic together",
                      "explanation": "JSX keeps rendering logic co-located with the UI tree."
                    },
                    {
                      "question": "Which hook stores local component state?",
                      "options": ["useEffect", "useMemo", "useState", "useCallback"],
                      "answer": "useState",
                      "explanation": "useState returns a state value and setter."
                    }
                  ]
                }
                """;

        createContent(
                course,
                module1,
                3,
                "JSX & Hooks Quick Quiz",
                LearningContent.ContentType.QUIZ,
                null,
                "Answer a few checks to validate your React basics.",
                10,
                jsxQuiz);

        LearningContent module2 = createModule(
                course,
                2,
                "Module 2: State, Effects, and Data Flow",
                "Dive into hooks, component lifecycle, and managing data.",
                75,
                "Hands-on module with exercises");

        createContent(
                course,
                module2,
                1,
                "useState & useEffect Notes",
                LearningContent.ContentType.NOTE,
                null,
                "useState handles local state, while useEffect syncs with side effects like APIs or subscriptions.",
                20,
                "Revision notes for later review");

        createContent(
                course,
                module2,
                2,
                "Component Checklist (Document)",
                LearningContent.ContentType.DOCUMENT,
                null,
                "Checklist: break UI into components, map props, verify data flow, and test interaction points.",
                15,
                "Printable checklist");

        createContent(
                course,
                module2,
                3,
                "Hooks Cheat Sheet (PDF)",
                LearningContent.ContentType.PDF,
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                "Quick reference for the most common hooks.",
                8,
                "Downloadable PDF reference");
    }

    private void seedSpringBootMicroservices(LearningGoal course) {
        LearningContent module1 = createModule(
                course,
                1,
                "Module 1: Microservice Architecture",
                "Design boundaries, service contracts, and deployment topology.",
                85,
                "Architecture essentials");

        createContent(
                course,
                module1,
                1,
                "Architecture Overview (Video)",
                LearningContent.ContentType.VIDEO,
                "https://www.youtube.com/watch?v=5qap5aO4i9A",
                "See how microservices map to business domains.",
                14,
                "Visual walkthrough");

        createContent(
                course,
                module1,
                2,
                "Service Boundary Workshop (Interactive)",
                LearningContent.ContentType.INTERACTIVE,
                "https://excalidraw.com",
                "Use the canvas to sketch service boundaries and data flow.",
                25,
                "{\"instructions\": \"Sketch your service map and annotate ownership.\"}");

        createContent(
                course,
                module1,
                3,
                "Service Contracts (Text)",
                LearningContent.ContentType.TEXT,
                null,
                "Define APIs with clear ownership, versioning strategy, and backward compatibility.",
                18,
                "Contract-first guidance");

        LearningContent module2 = createModule(
                course,
                2,
                "Module 2: Resilience & Observability",
                "Build confidence with tracing, metrics, and resilience patterns.",
                70,
                "Reliability toolkit");

        createContent(
                course,
                module2,
                1,
                "Circuit Breaker Patterns",
                LearningContent.ContentType.DOCUMENT,
                null,
                "Learn when to use retries, timeouts, and circuit breakers to protect services.",
                20,
                "Pattern summary");

        createContent(
                course,
                module2,
                2,
                "Monitoring Checklist",
                LearningContent.ContentType.NOTE,
                null,
                "Track golden signals: latency, traffic, errors, and saturation.",
                12,
                "Ops notes");
    }

    private void seedPostgresOptimization(LearningGoal course) {
        LearningContent module1 = createModule(
                course,
                1,
                "Module 1: Query Planning",
                "Understand the planner, EXPLAIN, and query execution strategies.",
                80,
                "Planner deep dive");

        createContent(
                course,
                module1,
                1,
                "Reading EXPLAIN Plans",
                LearningContent.ContentType.DOCUMENT,
                null,
                "Learn to interpret sequential scans, index scans, and join strategies.",
                20,
                "Hands-on walkthrough");

        createContent(
                course,
                module1,
                2,
                "Execution Plan Guide (PDF)",
                LearningContent.ContentType.PDF,
                "https://www.orimi.com/pdf-test.pdf",
                "Download the annotated EXPLAIN plan guide.",
                12,
                "PDF reference");

        LearningContent module2 = createModule(
                course,
                2,
                "Module 2: Index Strategy",
                "Choose the right index type for each workload.",
                75,
                "Index tuning lab");

        String indexFlashcards = """
                {
                  "cards": [
                    {"front": "When to use a B-tree index?", "back": "For equality and range queries on sortable data."},
                    {"front": "What does a GIN index optimize?", "back": "Containment queries on arrays, JSONB, and full-text search."},
                    {"front": "BRIN index best for?", "back": "Large, naturally ordered tables with sequential access patterns."}
                  ]
                }
                """;

        createContent(
                course,
                module2,
                1,
                "Indexing Flashcards",
                LearningContent.ContentType.FLASHCARD_SET,
                null,
                "Review index types and use cases.",
                10,
                indexFlashcards);

        String indexQuiz = """
                {
                  "questions": [
                    {
                      "question": "Which index is ideal for JSONB containment queries?",
                      "options": ["HASH", "GIN", "BRIN", "SP-GiST"],
                      "answer": "GIN",
                      "explanation": "GIN is built for inverted data structures like JSONB."
                    },
                    {
                      "question": "What does a partial index target?",
                      "options": ["All rows", "A filtered subset of rows", "Only foreign keys", "Only temporary tables"],
                      "answer": "A filtered subset of rows",
                      "explanation": "Partial indexes cover rows that meet a predicate."
                    }
                  ]
                }
                """;

        createContent(
                course,
                module2,
                2,
                "Index Selection Quiz",
                LearningContent.ContentType.QUIZ,
                null,
                "Check your understanding of index strategies.",
                12,
                indexQuiz);
    }

    private void seedPythonDataScience(LearningGoal course) {
        LearningContent module1 = createModule(
                course,
                1,
                "Module 1: Pandas Foundations",
                "Clean, shape, and analyze data using pandas.",
                70,
                "Data preparation");

        createContent(
                course,
                module1,
                1,
                "Pandas Intro (Video)",
                LearningContent.ContentType.VIDEO,
                "https://www.youtube.com/watch?v=vmEHCJofslg",
                "A quick walkthrough of DataFrame basics.",
                16,
                "Guided demo");

        createContent(
                course,
                module1,
                2,
                "DataFrame Tips",
                LearningContent.ContentType.NOTE,
                null,
                "Use .describe(), .info(), and .value_counts() to explore data fast.",
                12,
                "Notebook tips");

        createContent(
                course,
                module1,
                3,
                "Mini Lab: Cleaning Data",
                LearningContent.ContentType.TEXT,
                null,
                "Clean a messy CSV by handling nulls, duplicates, and inconsistent categories.",
                20,
                "Hands-on exercise");

        LearningContent module2 = createModule(
                course,
                2,
                "Module 2: Visualization & Storytelling",
                "Create compelling charts and explain data stories.",
                65,
                "Visualization lab");

        createContent(
                course,
                module2,
                1,
                "Visualization Notebook (Interactive)",
                LearningContent.ContentType.INTERACTIVE,
                "https://colab.research.google.com",
                "Open the notebook and try the charting prompts.",
                25,
                "{\"instructions\": \"Duplicate the notebook and build three charts.\"}");

        createContent(
                course,
                module2,
                2,
                "Visualization Cheat Sheet (PDF)",
                LearningContent.ContentType.PDF,
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                "Chart selection guide and color tips.",
                10,
                "PDF resource");
    }

    private void seedSystemDesign(LearningGoal course) {
        LearningContent module1 = createModule(
                course,
                1,
                "Module 1: Scalability Basics",
                "Learn how to scale services with load balancing and caching tiers.",
                80,
                "Scalability playbook");

        createContent(
                course,
                module1,
                1,
                "Scalability Primer (Video)",
                LearningContent.ContentType.VIDEO,
                "https://www.youtube.com/watch?v=HpdJ0oB1l8s",
                "Explore the fundamentals of scaling distributed systems.",
                14,
                "Primer");

        createContent(
                course,
                module1,
                2,
                "Load Balancing Patterns",
                LearningContent.ContentType.DOCUMENT,
                null,
                "Compare round-robin, least connections, and consistent hashing strategies.",
                18,
                "Design notes");

        LearningContent module2 = createModule(
                course,
                2,
                "Module 2: Caching & Messaging",
                "Design for performance with caches and queues.",
                70,
                "Performance patterns");

        String cacheFlashcards = """
                {
                  "cards": [
                    {"front": "Write-through cache", "back": "Writes go to cache and DB synchronously."},
                    {"front": "Write-behind cache", "back": "Cache writes asynchronously to DB."},
                    {"front": "Cache stampede", "back": "Many requests miss cache at once causing DB overload."}
                  ]
                }
                """;

        createContent(
                course,
                module2,
                1,
                "Caching Flashcards",
                LearningContent.ContentType.FLASHCARD_SET,
                null,
                "Review caching patterns and pitfalls.",
                10,
                cacheFlashcards);

        String cachingQuiz = """
                {
                  "questions": [
                    {
                      "question": "Which cache strategy minimizes stale reads but adds write latency?",
                      "options": ["Write-through", "Write-behind", "Cache-aside", "Read-through"],
                      "answer": "Write-through",
                      "explanation": "Write-through keeps cache and DB in sync on every write."
                    }
                  ]
                }
                """;

        createContent(
                course,
                module2,
                2,
                "Caching Quiz",
                LearningContent.ContentType.QUIZ,
                null,
                "Check your caching fundamentals.",
                8,
                cachingQuiz);
    }
}
