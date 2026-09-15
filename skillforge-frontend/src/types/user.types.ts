// User types
export interface User {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'LEARNER' | 'INSTRUCTOR' | 'ADMIN';
    profilePictureUrl?: string;
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: string;
    createdAt: string;
}

export interface LearnerProfile {
    profileId: string;
    userId: string;
    currentSkillLevel?: string;
    learningStyle?: Record<string, unknown>;
    interests?: string[];
    goals?: string[];
    timeZone?: string;
    preferredDifficulty?: string;
    aiParameters?: Record<string, unknown>;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'LEARNER' | 'INSTRUCTOR';
}
