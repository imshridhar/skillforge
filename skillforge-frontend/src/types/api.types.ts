// API response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface ApiError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}
