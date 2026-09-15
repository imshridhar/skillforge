import apiClient from '../../api/apiClient';
import type { LoginCredentials, RegisterData, User } from '../../types';

interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

interface PasswordResetResponse {
    message: string;
    resetToken?: string;
    expiresAt?: string;
}

export const authAPI = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/auth/me');
        return response.data;
    },

    refreshToken: async (): Promise<{ token: string; refreshToken: string }> => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }

        const response = await apiClient.post<{ token: string; refreshToken: string }>(
            '/auth/refresh',
            { refreshToken }
        );
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    },

    requestPasswordReset: async (email: string): Promise<PasswordResetResponse> => {
        const response = await apiClient.post<PasswordResetResponse>('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<PasswordResetResponse> => {
        const response = await apiClient.post<PasswordResetResponse>('/auth/reset-password', {
            token,
            newPassword,
        });
        return response.data;
    },
};
