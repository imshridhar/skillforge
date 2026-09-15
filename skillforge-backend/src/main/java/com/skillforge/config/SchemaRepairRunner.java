package com.skillforge.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SchemaRepairRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        repairLegacyExamsTable();
        repairExamEnumConstraints();
        repairExamTextColumns();
        repairLearningContentTypeConstraint();
        repairExamQuestionTypeConstraint();
        repairExamQuestionTextColumns();
        repairExamAnswerTextColumns();
    }

    /**
     * Drop all check constraints on learning_content so Hibernate can recreate them
     * with all current enum values (MODULE, FLASHCARD_SET, INTERACTIVE, etc.).
     */
    private void repairLearningContentTypeConstraint() {
        if (!tableExists("learning_content")) {
            return;
        }
        try {
            jdbcTemplate.execute(
                    "DO $$ DECLARE " +
                    "   c_name text; " +
                    "BEGIN " +
                    "   FOR c_name IN (SELECT conname FROM pg_constraint WHERE conrelid = 'learning_content'::regclass AND contype = 'c') " +
                    "   LOOP " +
                    "      EXECUTE 'ALTER TABLE learning_content DROP CONSTRAINT IF EXISTS ' || c_name; " +
                    "   END LOOP; " +
                    "END $$;");
            log.info("Dropped all check constraints on learning_content (Hibernate will recreate).");
        } catch (Exception e) {
            log.warn("Could not drop learning_content check constraints: {}", e.getMessage());
        }
    }

    /**
     * Drop all check constraints on exam_questions so Hibernate can recreate them
     * with all current question types (MCQ, CODE, TRUE_FALSE, FLASHCARD, TEXT).
     */
    private void repairExamQuestionTypeConstraint() {
        if (!tableExists("exam_questions")) {
            return;
        }
        try {
            jdbcTemplate.execute(
                    "DO $$ DECLARE " +
                    "   c_name text; " +
                    "BEGIN " +
                    "   FOR c_name IN (SELECT conname FROM pg_constraint WHERE conrelid = 'exam_questions'::regclass AND contype = 'c') " +
                    "   LOOP " +
                    "      EXECUTE 'ALTER TABLE exam_questions DROP CONSTRAINT IF EXISTS ' || c_name; " +
                    "   END LOOP; " +
                    "END $$;");
            log.info("Dropped all check constraints on exam_questions (Hibernate will recreate).");
        } catch (Exception e) {
            log.warn("Could not drop exam_questions check constraints: {}", e.getMessage());
        }
    }

    /**
     * Drop all check constraints on exams so Hibernate can recreate them
     * with current enum values (status, exam_type, conduct_method).
     */
    private void repairExamEnumConstraints() {
        if (!tableExists("exams")) {
            return;
        }
        try {
            jdbcTemplate.execute(
                    "DO $$ DECLARE " +
                    "   c_name text; " +
                    "BEGIN " +
                    "   FOR c_name IN (SELECT conname FROM pg_constraint WHERE conrelid = 'exams'::regclass AND contype = 'c') " +
                    "   LOOP " +
                    "      EXECUTE 'ALTER TABLE exams DROP CONSTRAINT IF EXISTS ' || c_name; " +
                    "   END LOOP; " +
                    "END $$;");
            log.info("Dropped all check constraints on exams (Hibernate will recreate).");
        } catch (Exception e) {
            log.warn("Could not drop exams check constraints: {}", e.getMessage());
        }
    }

    /**
     * Ensure large text columns for exam descriptions and learning goals.
     */
    private void repairExamTextColumns() {
        if (!tableExists("exams")) {
            return;
        }

        List<String> statements = List.of(
                "ALTER TABLE IF EXISTS exams ALTER COLUMN description TYPE TEXT",
                "ALTER TABLE IF EXISTS exams ALTER COLUMN learning_goals TYPE TEXT");

        for (String statement : statements) {
            try {
                jdbcTemplate.execute(statement);
            } catch (Exception e) {
                log.warn("Could not update exams text columns: {}", e.getMessage());
                break;
            }
        }
    }

    /**
     * Ensure large text columns for exam questions (correct answers and options).
     * This prevents constraint violations when AI-generated text exceeds legacy varchar limits.
     */
    private void repairExamQuestionTextColumns() {
        if (!tableExists("exam_questions")) {
            return;
        }

        List<String> statements = List.of(
                "ALTER TABLE IF EXISTS exam_questions ALTER COLUMN question_text TYPE TEXT",
                "ALTER TABLE IF EXISTS exam_questions ALTER COLUMN correct_answer TYPE TEXT",
                "ALTER TABLE IF EXISTS exam_questions ALTER COLUMN option_a TYPE TEXT",
                "ALTER TABLE IF EXISTS exam_questions ALTER COLUMN option_b TYPE TEXT",
                "ALTER TABLE IF EXISTS exam_questions ALTER COLUMN option_c TYPE TEXT",
                "ALTER TABLE IF EXISTS exam_questions ALTER COLUMN option_d TYPE TEXT",
                "ALTER TABLE IF EXISTS exam_questions ALTER COLUMN code_snippet TYPE TEXT",
                "ALTER TABLE IF EXISTS exam_questions ALTER COLUMN topic TYPE TEXT",
                "ALTER TABLE IF EXISTS exam_questions ALTER COLUMN objective TYPE TEXT");

        for (String statement : statements) {
            try {
                jdbcTemplate.execute(statement);
            } catch (Exception e) {
                log.warn("Could not update exam_questions text columns: {}", e.getMessage());
                break;
            }
        }
    }

    /**
     * Ensure large text columns for exam answers (selected answer + feedback).
     */
    private void repairExamAnswerTextColumns() {
        if (!tableExists("exam_answers")) {
            return;
        }

        List<String> statements = List.of(
                "ALTER TABLE IF EXISTS exam_answers ALTER COLUMN selected_answer TYPE TEXT",
                "ALTER TABLE IF EXISTS exam_answers ALTER COLUMN feedback TYPE TEXT");

        for (String statement : statements) {
            try {
                jdbcTemplate.execute(statement);
            } catch (Exception e) {
                log.warn("Could not update exam_answers text columns: {}", e.getMessage());
                break;
            }
        }
    }

    private void repairLegacyExamsTable() {
        if (!tableExists("exams")) {
            return;
        }

        List<String> statements = List.of(
                "ALTER TABLE IF EXISTS exams ADD COLUMN IF NOT EXISTS exam_type VARCHAR(255) DEFAULT 'EXAM'",
                "ALTER TABLE IF EXISTS exams ADD COLUMN IF NOT EXISTS conduct_method VARCHAR(255) DEFAULT 'QUIZ'",
                "ALTER TABLE IF EXISTS exams ADD COLUMN IF NOT EXISTS learning_goals VARCHAR(500)",
                "ALTER TABLE IF EXISTS exams ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP",
                "ALTER TABLE IF EXISTS exams ADD COLUMN IF NOT EXISTS learner_owner_id UUID",
                "ALTER TABLE IF EXISTS exams ADD COLUMN IF NOT EXISTS source_exam_id UUID",
                "ALTER TABLE IF EXISTS exams ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 70",
                "ALTER TABLE IF EXISTS exams ALTER COLUMN course_id DROP NOT NULL",
                "ALTER TABLE IF EXISTS exams ALTER COLUMN instructor_id DROP NOT NULL");

        statements.forEach(jdbcTemplate::execute);

        log.info("Verified legacy exams table columns before repository access.");
    }

    private boolean tableExists(String tableName) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                        select exists (
                            select 1
                            from information_schema.tables
                            where lower(table_name) = lower(?)
                        )
                        """,
                Boolean.class,
                tableName);

        return Boolean.TRUE.equals(exists);
    }
}
