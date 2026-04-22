// Auth
export interface SiswaLoginRequest {
    full_name: string;
    class_id: string;
}

export interface GuruLoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        full_name: string;
        role: "guru" | "siswa";
    };
}

// API Response wrapper
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Progress
export interface UnlockStatusResponse {
    canProcced: boolean;
    currentMission: number;
    teamCompletionCount: number;
    teamTotalCount: number;
}