import type { ConductMethod, Exam, ExamAttempt, ExamQuestion } from '../api/courseAPI';

export const extractOptionText = (opt: any): string => {
    if (!opt) return '';
    if (typeof opt === 'string') return opt;
    if (opt.text) return opt.text;
    if (opt.value) return opt.value;
    if (opt.label) return opt.label;
    return String(opt);
};

export const conductMethodOptions: Array<{ value: ConductMethod; label: string }> = [
    { value: 'QUIZ', label: 'Quiz' },
    { value: 'MCQ', label: 'MCQ' },
    { value: 'TRUE_FALSE', label: 'True / False' },
    { value: 'QUESTION_ANSWER', label: 'Question - Answer' },
    { value: 'FLASH_CARDS', label: 'Flash Cards' },
    { value: 'MIXED', label: 'Mixed' },
];

export const conductMethodLabel = (method?: ConductMethod) =>
    conductMethodOptions.find((option) => option.value === method)?.label ?? method ?? 'Quiz';

export const questionTypeForMethod = (method: ConductMethod): ExamQuestion['questionType'] => {
    switch (method) {
        case 'TRUE_FALSE':
            return 'TRUE_FALSE';
        case 'QUESTION_ANSWER':
            return 'TEXT';
        case 'FLASH_CARDS':
            return 'FLASHCARD';
        default:
            return 'MCQ';
    }
};

export const isAssessmentOpen = (exam: Exam) => exam.examType === 'PRACTICE' || exam.status === 'PUBLISHED';

export const isAttemptPassed = (attempt: Pick<ExamAttempt, 'score' | 'exam'>) =>
    (attempt.score ?? 0) >= (attempt.exam?.passingScore ?? 70);

export const getQuestionOptions = (question: ExamQuestion) =>
    (() => {
        const direct = [
            { value: 'A', text: question.optionA },
            { value: 'B', text: question.optionB },
            { value: 'C', text: question.optionC },
            { value: 'D', text: question.optionD },
        ].filter((option): option is { value: 'A' | 'B' | 'C' | 'D'; text: string } => Boolean(option.text));

        if (direct.length) {
            return direct;
        }

        const fallback = Array.isArray(question.options) ? question.options : [];
        return fallback
            .slice(0, 4)
            .map((option, index) => ({
                value: String.fromCharCode(65 + index) as 'A' | 'B' | 'C' | 'D',
                text: extractOptionText(option),
            }))
            .filter((option): option is { value: 'A' | 'B' | 'C' | 'D'; text: string } => Boolean(option.text));
    })();

export const resolveAnswerText = (question: ExamQuestion, answer?: string | null) => {
    if (!answer) {
        return '';
    }

    const normalized = answer.trim().toUpperCase();
    const option = getQuestionOptions(question).find((candidate) => candidate.value === normalized);
    return option?.text ?? answer;
};

export const parseAiJson = <T>(raw: string | T): T => {
    if (typeof raw !== 'string') {
        return raw;
    }

    const cleaned = raw.startsWith('```json')
        ? raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
        : raw;

    try {
        return JSON.parse(cleaned) as T;
    } catch (error) {
        const arrayStart = cleaned.indexOf('[');
        const arrayEnd = cleaned.lastIndexOf(']');
        if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
            return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1)) as T;
        }

        const objectStart = cleaned.indexOf('{');
        const objectEnd = cleaned.lastIndexOf('}');
        if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
            return JSON.parse(cleaned.slice(objectStart, objectEnd + 1)) as T;
        }

        throw error;
    }
};

const normalizePlaceholderText = (value?: string | null) =>
    (value ?? '').trim().toLowerCase();

export const isPlaceholderQuestion = (questionText: string, options: string[] = []) => {
    const normalizedQuestion = normalizePlaceholderText(questionText);
    if (!normalizedQuestion || normalizedQuestion.startsWith('sample question') || normalizedQuestion.startsWith('untitled question')) {
        return true;
    }

    if (options.length < 4) {
        return false;
    }

    const normalizedOptions = options.map((option) => normalizePlaceholderText(option));
    const optionPlaceholders = ['option a', 'option b', 'option c', 'option d'];
    if (normalizedOptions.slice(0, 4).every((option, index) => option === optionPlaceholders[index])) {
        return true;
    }

    const letterPlaceholders = ['a', 'b', 'c', 'd'];
    return normalizedOptions.slice(0, 4).every((option, index) => option === letterPlaceholders[index]);
};

export const extractOptionList = (rawOptions: unknown): string[] => {
    if (!Array.isArray(rawOptions)) {
        return [];
    }
    return rawOptions
        .map((option) => extractOptionText(option))
        .filter((option) => Boolean(option && option.trim()));
};
