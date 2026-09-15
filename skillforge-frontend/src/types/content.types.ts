// Content and learning types
export interface LearningGoal {
    goalId: string;
    instructorId: string;
    title: string;
    description?: string;
    subject: string;
    difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    prerequisites?: string[];
    learningOutcomes?: string[];
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LearningContent {
    contentId: string;
    goalId: string;
    title: string;
    contentType: 'MODULE' | 'VIDEO' | 'NOTE' | 'DOCUMENT' | 'TEXT' | 'PDF' | 'INTERACTIVE' | 'QUIZ' | 'FLASHCARD_SET';
    contentUrl?: string;
    contentText?: string;
    durationMinutes?: number;
    difficultyLevel: string;
    orderIndex: number;
    metadata?: Record<string, unknown>;
}

export interface Enrollment {
    enrollmentId: string;
    learnerId: string;
    goalId: string;
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'DROPPED';
    progressPercentage: number;
    enrolledAt: string;
    completedAt?: string;
    lastAccessed?: string;
    goal?: LearningGoal;
}

export interface PracticeExercise {
    exerciseId: string;
    contentId: string;
    questionText: string;
    questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'CODE' | 'ESSAY';
    options?: { id: string; text: string }[];
    correctAnswer?: string;
    explanation?: string;
    difficultyLevel: string;
    points: number;
}

export interface ProgressTracking {
    progressId: string;
    learnerId: string;
    contentId: string;
    enrollmentId: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    completionPercentage: number;
    timeSpentSeconds: number;
    lastAccessed?: string;
    completedAt?: string;
}
