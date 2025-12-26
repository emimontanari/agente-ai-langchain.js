// API Configuration for connecting to NestJS backend

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
    message: string;
    statusCode: number;
}

export class ApiException extends Error {
    constructor(
        public statusCode: number,
        message: string,
    ) {
        super(message);
        this.name = 'ApiException';
    }
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: response.statusText,
            }));
            throw new ApiException(response.status, errorData.message || 'Request failed');
        }

        // Handle empty responses (204 No Content)
        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    } catch (error) {
        if (error instanceof ApiException) {
            throw error;
        }
        throw new ApiException(500, 'Network error or server unavailable');
    }
}

// Helper methods for common HTTP verbs
export const api = {
    get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

    post: <T>(endpoint: string, data: unknown) =>
        apiRequest<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    put: <T>(endpoint: string, data: unknown) =>
        apiRequest<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    patch: <T>(endpoint: string, data?: unknown) =>
        apiRequest<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T>(endpoint: string) =>
        apiRequest<T>(endpoint, { method: 'DELETE' }),
};
