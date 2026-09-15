import apiClient from './apiClient';

export interface UserSummary {
    userId: string;
    firstName: string;
    lastName: string;
    email?: string;
}

export interface LearningGoal {
    goalId: string;
    title: string;
    description: string;
    subject: string;
    difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    prerequisites: string;
    learningOutcomes: string;
    isPublished: boolean;
    instructor: UserSummary;
    createdAt: string;
    updatedAt: string;
}

export type CourseContentType =
    | 'MODULE'
    | 'VIDEO'
    | 'NOTE'
    | 'DOCUMENT'
    | 'TEXT'
    | 'PDF'
    | 'INTERACTIVE'
    | 'QUIZ'
    | 'FLASHCARD_SET';

export interface CourseContentItem {
    contentId: string;
    title: string;
    contentType: CourseContentType;
    contentUrl?: string;
    contentText?: string;
    durationMinutes?: number;
    orderIndex: number;
    metadata?: string;
}

export interface CourseModule {
    contentId: string;
    title: string;
    description?: string;
    durationMinutes?: number;
    orderIndex: number;
    metadata?: string;
    contents: CourseContentItem[];
}

export interface Enrollment {
    enrollmentId: string;
    learner: UserSummary;
    goal: LearningGoal;
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'DROPPED';
    progressPercentage: number;
    enrolledAt: string;
    completedAt?: string;
    lastAccessed?: string;
}

export interface ContentProgressSummary {
    progressPercentage: number;
    completedContentIds: string[];
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ExamType = 'EXAM' | 'QUIZ' | 'PRACTICE';
export type ConductMethod = 'QUIZ' | 'MCQ' | 'TRUE_FALSE' | 'QUESTION_ANSWER' | 'FLASH_CARDS' | 'MIXED';

export interface Exam {
    examId: string;
    title: string;
    description?: string;
    totalQuestions: number;
    durationMinutes: number;
    status: ExamStatus;
    examType: ExamType;
    conductMethod: ConductMethod;
    passingScore: number;
    scheduledDate?: string | null;
    learningGoals?: string;
    course?: LearningGoal | null;
    instructor?: UserSummary | null;
    learnerOwner?: UserSummary | null;
    sourceExam?: { examId: string; title: string } | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ExamQuestion {
    questionId: string;
    questionText: string;
    questionType: 'MCQ' | 'CODE' | 'TRUE_FALSE' | 'FLASHCARD' | 'TEXT';
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    options?: Array<{ text?: string; value?: string; label?: string } | string>;
    correctAnswer: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    topic: string;
    aiConfidence: number;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    codeSnippet?: string;
    objective?: string;
    orderIndex: number;
}

export interface ExamAttempt {
    attemptId: string;
    exam: Exam;
    learner?: UserSummary;
    score: number;
    startTime: string;
    endTime?: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT';
    currentQuestion: number;
    totalQuestions: number;
    skillLevel?: string;
}

export interface ExamAnswer {
    answerId: string;
    question: ExamQuestion;
    selectedAnswer: string;
    isCorrect: boolean;
    awardedScore: number;
    feedback?: string;
    timeTakenSeconds?: number;
    answeredAt?: string;
}

export interface CourseOverview {
    course: LearningGoal;
    modules: CourseModule[];
    assessments: Exam[];
}

export interface LearnerDashboardStats {
    currentCourse: {
        courseId?: string;
        title: string;
        module: string;
        progress: number;
        status: string;
    };
    dailyGoal: {
        minutesToday: number;
        target: number;
        streak: number;
    };
    skillData: Array<{ label: string; value: number }>;
}

export interface InstructorCourseAnalytics {
    goalId: string;
    title: string;
    totalEnrolled: number;
    avgProgress: number;
    completedCount: number;
    avgExamScore: number;
    attemptsCount: number;
}

export interface InstructorLearnerAnalytics {
    learnerId: string;
    name: string;
    email: string;
    courseId: string;
    courseTitle: string;
    progress: number;
    status: string;
}

export interface InstructorAnalyticsSummary {
    totalStudents: number;
    totalCompleted: number;
    avgProgress: number;
    avgExamScore: number;
}

export interface InstructorAnalyticsResponse {
    courses: InstructorCourseAnalytics[];
    learners: InstructorLearnerAnalytics[];
    summary: InstructorAnalyticsSummary;
}

export interface CourseCertificate {
    certificateId: string;
    certificateNumber: string;
    score: number;
    issuedAt: string;
    course: LearningGoal;
    examAttempt: ExamAttempt;
}

export interface LearnerRecommendation {
    id: string;
    title: string;
    level: string;
    levelColor: string;
    description: string;
    duration: string;
    rating: number;
    learners: string;
}

export interface AdminUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'INSTRUCTOR' | 'LEARNER';
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
}

export interface CourseContentDraft {
    contentId?: string;
    title: string;
    contentType: Exclude<CourseContentType, 'MODULE'>;
    contentUrl?: string;
    contentText?: string;
    durationMinutes?: number;
    metadata?: string;
}

export interface CourseModuleDraft {
    contentId?: string;
    title: string;
    description?: string;
    durationMinutes?: number;
    metadata?: string;
    contents: CourseContentDraft[];
}

export interface CourseUpsertPayload {
    title: string;
    description: string;
    subject: string;
    difficultyLevel: LearningGoal['difficultyLevel'];
    prerequisites: string;
    learningOutcomes: string;
    modules?: CourseModuleDraft[];
}

export interface AssessmentQuestionPayload {
    questionText: string;
    questionType: ExamQuestion['questionType'];
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer: string;
    difficulty?: ExamQuestion['difficulty'];
    topic?: string;
    aiConfidence?: number;
    objective?: string;
    codeSnippet?: string | null;
}

export interface ExamCreatePayload {
    title: string;
    description: string;
    courseId: string;
    totalQuestions: number;
    durationMinutes: number;
    learningGoals: string;
    examType: ExamType;
    conductMethod: ConductMethod;
    passingScore: number;
    status?: ExamStatus;
}

export interface PracticeExamPayload {
    sourceExamId?: string;
    title?: string;
    description?: string;
    courseId?: string;
    totalQuestions?: number;
    durationMinutes?: number;
    learningGoals?: string;
    conductMethod?: ConductMethod;
    passingScore?: number;
}

export const learnerAPI = {
    getCourses: async (page = 0, size = 10): Promise<PaginatedResponse<LearningGoal>> => {
        const response = await apiClient.get(`/learner/goals?page=${page}&size=${size}`);
        return response.data;
    },

    getCourseById: async (goalId: string): Promise<LearningGoal> => {
        const response = await apiClient.get(`/learner/goals/${goalId}`);
        return response.data;
    },

    getCourseOverview: async (goalId: string): Promise<CourseOverview> => {
        const response = await apiClient.get(`/learner/goals/${goalId}/overview`);
        return response.data;
    },

    getCourseModules: async (goalId: string): Promise<CourseContentItem[]> => {
        const response = await apiClient.get(`/learner/goals/${goalId}/modules`);
        return response.data;
    },

    getMyEnrollments: async (): Promise<Enrollment[]> => {
        const response = await apiClient.get('/learner/enrollments');
        return response.data;
    },

    getContentProgress: async (goalId: string): Promise<ContentProgressSummary> => {
        const response = await apiClient.get(`/learner/goals/${goalId}/content-progress`);
        return response.data;
    },

    markContentComplete: async (contentId: string): Promise<ContentProgressSummary> => {
        const response = await apiClient.post(`/learner/contents/${contentId}/complete`);
        return response.data;
    },

    enrollInCourse: async (goalId: string): Promise<Enrollment> => {
        const response = await apiClient.post(`/learner/enroll/${goalId}`);
        return response.data;
    },

    updateProgress: async (enrollmentId: string, progress: number): Promise<Enrollment> => {
        const response = await apiClient.put(`/learner/enrollments/${enrollmentId}/progress`, { progress });
        return response.data;
    },

    dropEnrollment: async (enrollmentId: string): Promise<void> => {
        await apiClient.delete(`/learner/enrollments/${enrollmentId}`);
    },

    getDashboardStats: async (): Promise<LearnerDashboardStats> => {
        const response = await apiClient.get('/learner/dashboard/stats');
        return response.data;
    },

    getRecommendations: async (): Promise<LearnerRecommendation[]> => {
        const response = await apiClient.get('/learner/dashboard/recommendations');
        return response.data;
    },

    getUpcomingExams: async (): Promise<Record<string, unknown>[]> => {
        const response = await apiClient.get('/learner/dashboard/exams');
        return response.data;
    },

    getAttemptCertificate: async (attemptId: string): Promise<CourseCertificate> => {
        const response = await apiClient.get(`/learner/exams/attempts/${attemptId}/certificate`);
        return response.data;
    },

    getCertificates: async (): Promise<CourseCertificate[]> => {
        const response = await apiClient.get('/learner/certificates');
        return response.data;
    },

    downloadCertificate: async (certificateId: string): Promise<Blob> => {
        const response = await apiClient.get(`/learner/certificates/${certificateId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },
};

export const instructorAPI = {
    getMyCourses: async (): Promise<LearningGoal[]> => {
        const response = await apiClient.get('/instructor/goals');
        return response.data;
    },

    getCourseStructure: async (goalId: string): Promise<CourseOverview> => {
        const response = await apiClient.get(`/instructor/goals/${goalId}/structure`);
        return response.data;
    },

    createCourse: async (course: CourseUpsertPayload): Promise<LearningGoal> => {
        const response = await apiClient.post('/instructor/goals', course);
        return response.data;
    },

    updateCourse: async (goalId: string, course: CourseUpsertPayload): Promise<LearningGoal> => {
        const response = await apiClient.put(`/instructor/goals/${goalId}`, course);
        return response.data;
    },

    publishCourse: async (goalId: string): Promise<LearningGoal> => {
        const response = await apiClient.post(`/instructor/goals/${goalId}/publish`);
        return response.data;
    },

    deleteCourse: async (goalId: string): Promise<void> => {
        await apiClient.delete(`/instructor/goals/${goalId}`);
    },

    addCourseModule: async (goalId: string, moduleData: CourseModuleDraft): Promise<CourseModule> => {
        const response = await apiClient.post(`/instructor/goals/${goalId}/modules`, moduleData);
        return response.data;
    },

    updateCourseModule: async (moduleId: string, moduleData: CourseModuleDraft): Promise<CourseModule> => {
        const response = await apiClient.put(`/instructor/modules/${moduleId}`, moduleData);
        return response.data;
    },

    deleteCourseModule: async (moduleId: string): Promise<void> => {
        await apiClient.delete(`/instructor/modules/${moduleId}`);
    },

    getDashboardStats: async (): Promise<Record<string, unknown>> => {
        const response = await apiClient.get('/instructor/dashboard/stats');
        return response.data;
    },

    getAnalytics: async (): Promise<InstructorAnalyticsResponse> => {
        const response = await apiClient.get('/instructor/analytics');
        return response.data;
    },
};

export interface SystemConfigData {
    configId?: string;
    adaptationSensitivity: number;
    llmTemperature: number;
    contentModel: string;
    autoRemediation: boolean;
    strictProctoring: boolean;
    appVersion: string;
    environment: string;
    region: string;
    updatedAt?: string;
}

export interface SystemStats {
    serverHealth: number;
    serverStatus: string;
    aiLatency: number;
    aiLatencyChange: string;
    activeSessions: number;
    totalLearners: number;
    totalInstructors: number;
    databaseLoad: number;
    databaseStatus: string;
    totalCourses: number;
}

export interface SystemAlert {
    id: number;
    title: string;
    message: string;
    severity: 'warning' | 'info' | 'error';
    time: string;
}

export interface UserProfile {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'INSTRUCTOR' | 'LEARNER';
    profilePictureUrl?: string;
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: string;
    createdAt: string;
}

export interface NotificationItem {
    notificationId: string;
    title: string;
    message?: string;
    severity: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    isRead: boolean;
    createdAt: string;
}

export const systemAPI = {
    getConfig: async (): Promise<SystemConfigData> => {
        const response = await apiClient.get('/admin/system/config');
        return response.data;
    },

    updateConfig: async (config: Partial<SystemConfigData>): Promise<SystemConfigData> => {
        const response = await apiClient.put('/admin/system/config', config);
        return response.data;
    },

    getStats: async (): Promise<SystemStats> => {
        const response = await apiClient.get('/admin/system/stats');
        return response.data;
    },

    getAlerts: async (): Promise<SystemAlert[]> => {
        const response = await apiClient.get('/admin/system/alerts');
        return response.data;
    },

    restartServices: async (): Promise<{ message: string }> => {
        const response = await apiClient.post('/admin/system/restart');
        return response.data;
    },
};

export const adminAPI = {
    getUsers: async (): Promise<AdminUser[]> => {
        const response = await apiClient.get('/admin/users');
        return response.data;
    },

    getCourseOverview: async (goalId: string): Promise<CourseOverview> => {
        const response = await apiClient.get(`/admin/courses/${goalId}/overview`);
        return response.data;
    },

    getUserById: async (userId: string): Promise<AdminUser> => {
        const response = await apiClient.get(`/admin/users/${userId}`);
        return response.data;
    },

    createUser: async (data: { email: string; password: string; firstName: string; lastName: string; role: string }): Promise<AdminUser> => {
        const response = await apiClient.post('/admin/users', data);
        return response.data;
    },

    updateUser: async (userId: string, data: { firstName?: string; lastName?: string; role?: string; isActive?: boolean; isVerified?: boolean }): Promise<AdminUser> => {
        const response = await apiClient.put(`/admin/users/${userId}`, data);
        return response.data;
    },

    updateUserStatus: async (userId: string, isActive: boolean, isVerified: boolean): Promise<AdminUser> => {
        const response = await apiClient.put(`/admin/users/${userId}/status`, { isActive, isVerified });
        return response.data;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await apiClient.delete(`/admin/users/${userId}`);
    },

    getStats: async (): Promise<{ totalUsers: number; learners: number; instructors: number }> => {
        const response = await apiClient.get('/admin/stats');
        return response.data;
    },
};

export const userAPI = {
    getProfile: async (): Promise<UserProfile> => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    updateProfile: async (data: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'profilePictureUrl'>>): Promise<UserProfile> => {
        const response = await apiClient.put('/users/me', data);
        return response.data;
    },
};

export const notificationAPI = {
    getNotifications: async (): Promise<NotificationItem[]> => {
        const response = await apiClient.get('/notifications');
        return response.data;
    },

    getUnreadCount: async (): Promise<{ count: number }> => {
        const response = await apiClient.get('/notifications/unread-count');
        return response.data;
    },

    markRead: async (notificationId: string): Promise<NotificationItem> => {
        const response = await apiClient.put(`/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllRead: async (): Promise<{ message: string }> => {
        const response = await apiClient.put('/notifications/read-all');
        return response.data;
    },
};

export const examAPI = {
    getInstructorExams: async (): Promise<Exam[]> => {
        const response = await apiClient.get('/instructor/exams');
        return response.data;
    },

    getExamAttemptsByInstructor: async (examId: string): Promise<ExamAttempt[]> => {
        const response = await apiClient.get(`/instructor/exams/${examId}/attempts`);
        return response.data;
    },

    createExam: async (data: ExamCreatePayload): Promise<Exam> => {
        const response = await apiClient.post('/instructor/exams', data);
        return response.data;
    },

    getExamQuestions: async (examId: string): Promise<ExamQuestion[]> => {
        const response = await apiClient.get(`/instructor/exams/${examId}/questions`);
        return response.data;
    },

    addQuestionsBatch: async (examId: string, questions: AssessmentQuestionPayload[]): Promise<ExamQuestion[]> => {
        const response = await apiClient.post(`/instructor/exams/${examId}/questions/batch`, questions);
        return response.data;
    },

    approveQuestion: async (questionId: string): Promise<ExamQuestion> => {
        const response = await apiClient.put(`/instructor/exams/questions/${questionId}/approve`);
        return response.data;
    },

    rejectQuestion: async (questionId: string): Promise<ExamQuestion> => {
        const response = await apiClient.put(`/instructor/exams/questions/${questionId}/reject`);
        return response.data;
    },

    publishExam: async (examId: string): Promise<Exam> => {
        const response = await apiClient.put(`/instructor/exams/${examId}/publish`);
        return response.data;
    },

    deleteExam: async (examId: string): Promise<void> => {
        await apiClient.delete(`/instructor/exams/${examId}`);
    },

    getInstructorCourses: async (): Promise<LearningGoal[]> => {
        const response = await apiClient.get('/instructor/goals');
        return response.data;
    },

    getAvailableExams: async (): Promise<Exam[]> => {
        const response = await apiClient.get('/learner/exams');
        return response.data;
    },

    startExam: async (examId: string): Promise<ExamAttempt> => {
        const response = await apiClient.post(`/learner/exams/${examId}/start`);
        return response.data;
    },

    createPracticeExam: async (data: PracticeExamPayload): Promise<Exam> => {
        const response = await apiClient.post('/learner/exams/practice', data);
        return response.data;
    },

    addPracticeQuestionsBatch: async (examId: string, questions: AssessmentQuestionPayload[]): Promise<ExamQuestion[]> => {
        const response = await apiClient.post(`/learner/exams/${examId}/questions/generate`, questions);
        return response.data;
    },

    getMyAttempts: async (): Promise<ExamAttempt[]> => {
        const response = await apiClient.get('/learner/exams/attempts');
        return response.data;
    },

    submitAnswer: async (attemptId: string, questionId: string, selectedAnswer: string): Promise<ExamAnswer> => {
        const response = await apiClient.post(`/learner/exams/attempts/${attemptId}/answer`, { questionId, selectedAnswer });
        return response.data;
    },

    finishExam: async (attemptId: string): Promise<ExamAttempt> => {
        const response = await apiClient.post(`/learner/exams/attempts/${attemptId}/submit`);
        return response.data;
    },

    getAttempt: async (attemptId: string): Promise<ExamAttempt> => {
        const response = await apiClient.get(`/learner/exams/attempts/${attemptId}`);
        return response.data;
    },

    getAttemptQuestions: async (attemptId: string): Promise<ExamQuestion[]> => {
        const response = await apiClient.get(`/learner/exams/attempts/${attemptId}/questions`);
        return response.data;
    },

    getAttemptAnswers: async (attemptId: string): Promise<ExamAnswer[]> => {
        const response = await apiClient.get(`/learner/exams/attempts/${attemptId}/answers`);
        return response.data;
    },
};

export const aiAPI = {
    generateCoursePlan: async (subject: string, difficulty: string): Promise<string> => {
        const response = await apiClient.post('/ai/generate-course', { subject, difficulty });
        return response.data;
    },

    generateExamQuestions: async (topics: string, count: number, format: ConductMethod | 'TEXT' | 'FLASHCARD' | 'TRUE_FALSE' | 'MCQ' | 'MIXED' = 'MIXED'): Promise<string> => {
        const response = await apiClient.post('/ai/generate-exam', { topics, count, format });
        return response.data;
    },

    generateVideoQuiz: async (contentContext: string): Promise<string> => {
        const response = await apiClient.post('/ai/generate-quiz', { contentContext });
        return response.data;
    },

    generateFlashcards: async (topics: string, count: number): Promise<string> => {
        const response = await apiClient.post('/ai/generate-flashcards', { topics, count });
        return response.data;
    },

    suggestLearningContent: async (subject: string, difficulty: string, goals: string): Promise<string> => {
        const response = await apiClient.post('/ai/suggest-content', { subject, difficulty, goals });
        return response.data;
    },

    gradeAnswer: async (question: string, expectedAnswer: string, learnerAnswer: string): Promise<string> => {
        const response = await apiClient.post('/ai/grade-answer', { question, expectedAnswer, learnerAnswer });
        return response.data;
    },
};
