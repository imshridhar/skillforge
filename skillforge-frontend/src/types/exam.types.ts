// Exam related types
export interface ExamTemplate {
    templateId: string;
    goalId: string;
    instructorId: string;
    title: string;
    description?: string;
    totalQuestions: number;
    durationMinutes: number;
    passingScore: number;
    difficultyDistribution?: Record<string, number>;
    questionTypes?: string[];
    isApproved: boolean;
    approvedBy?: string;
    createdAt: string;
}

export interface ExamQuestion {
    questionId: string;
    questionText: string;
    questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'CODE' | 'ESSAY';
    options?: { id: string; text: string }[];
    points: number;
}

export interface ExamInstance {
    examId: string;
    templateId: string;
    learnerId: string;
    questions: ExamQuestion[];
    answers?: Record<string, string>;
    score?: number;
    maxScore: number;
    passed?: boolean;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
    startedAt?: string;
    submittedAt?: string;
    gradedAt?: string;
    aiFeedback?: Record<string, unknown>;
}

export interface SkillAssessment {
    assessmentId: string;
    learnerId: string;
    goalId: string;
    assessmentType: 'INITIAL' | 'PERIODIC' | 'FINAL';
    questions: ExamQuestion[];
    answers: Record<string, string>;
    score?: number;
    skillGaps?: string[];
    recommendedLevel?: string;
    takenAt: string;
}
