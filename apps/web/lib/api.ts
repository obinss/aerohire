const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Request Helper ───────────────────────────────────────────────────────

async function request<T>(
    path: string,
    options: RequestInit & { token?: string } = {}
): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
    };

    const response = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

// ── Auth API ─────────────────────────────────────────────────────────────

export const authApi = {
    register: (email: string, password: string) =>
        request<{ access_token: string; user: unknown }>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    login: (email: string, password: string) =>
        request<{ access_token: string; user: unknown }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    me: (token: string) =>
        request<unknown>("/users/me", { token }),

    updateProfile: (token: string, data: unknown) =>
        request<unknown>("/users/me/profile", {
            method: "PUT",
            token,
            body: JSON.stringify(data),
        }),
};

// ── Jobs API ──────────────────────────────────────────────────────────────

export const jobsApi = {
    list: (token: string, page = 1, limit = 20) =>
        request<unknown[]>(`/jobs?page=${page}&limit=${limit}`, { token }),

    get: (token: string, id: string) =>
        request<unknown>(`/jobs/${id}`, { token }),
};

// ── Applications API ──────────────────────────────────────────────────────

export const applicationsApi = {
    list: (token: string) =>
        request<unknown[]>("/applications", { token }),

    create: (token: string, jobId: string) =>
        request<unknown>("/applications", {
            method: "POST",
            token,
            body: JSON.stringify({ job_id: jobId }),
        }),

    updateStatus: (token: string, id: string, status: string) =>
        request<unknown>(`/applications/${id}/status`, {
            method: "PATCH",
            token,
            body: JSON.stringify({ status }),
        }),
};

// ── Documents API ─────────────────────────────────────────────────────────

export const documentsApi = {
    get: (token: string, id: string) =>
        request<unknown>(`/documents/${id}`, { token }),

    listForApplication: (token: string, applicationId: string) =>
        request<unknown[]>(`/documents?application_id=${applicationId}`, { token }),
};

// ── AI API ────────────────────────────────────────────────────────────────

export const aiApi = {
    parseCV: (token: string, cvText: string) =>
        request<{ skills: string[]; experience_years: number; education: unknown[]; tools: string[] }>(
            "/ai/parse-cv",
            {
                method: "POST",
                token,
                body: JSON.stringify({ cv_text: cvText }),
            }
        ),

    generateCoverLetter: (token: string, applicationId: string) =>
        request<{ content_markdown: string }>("/ai/generate-cover-letter", {
            method: "POST",
            token,
            body: JSON.stringify({ application_id: applicationId }),
        }),

    matchScore: (token: string, jobId: string) =>
        request<{ score: number; explanation: string }>("/ai/match-score", {
            method: "POST",
            token,
            body: JSON.stringify({ job_id: jobId }),
        }),
};

// ── Scraper API ───────────────────────────────────────────────────────────

export const scraperApi = {
    trigger: (token: string) =>
        request<{ task_id: string; status: string }>("/scraper/trigger", {
            method: "POST",
            token,
        }),
};
