import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
const INTERNAL_SERVER_MESSAGE = 'Something went wrong on the server. Please try again in a moment.';

const normalizeApiErrorMessage = (error: AxiosError) => {
    const payload = error.response?.data;
    if (!payload || typeof payload !== 'object' || !('message' in payload)) {
        return;
    }

    const message = String((payload as { message?: unknown }).message ?? '');
    if (!message) {
        return;
    }

    if (/jdbc exception|sql|hibernate|position:\s*\d+/i.test(message)) {
        (payload as { message: string }).message = INTERNAL_SERVER_MESSAGE;
    }
};

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;

        // Handle 401 Unauthorized or 403 Forbidden - try to refresh token
        if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { token: newToken, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem('token', newToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - clear tokens and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available - redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        if (!error.response && error.code === 'ECONNABORTED') {
            (error as AxiosError & { response: unknown }).response = {
                data: { message: 'Request timed out. Please try again.' },
                status: 408,
                statusText: 'Request Timeout',
                headers: {},
                config: error.config ?? {},
            };
        }

        normalizeApiErrorMessage(error);
        return Promise.reject(error);
    }
);

export default apiClient;
