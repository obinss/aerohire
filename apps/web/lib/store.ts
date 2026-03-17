import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// ── Types ────────────────────────────────────────────────────────────────

export type AppStatus =
    | "Saved"
    | "Auto_Applied"
    | "Interviewing"
    | "Rejected"
    | "Offer";

export interface Job {
    id: string;
    title: string;
    company: string;
    description: string;
    url: string;
    source: string;
    postedDate: string | null;
    requiredQualifications: string[] | null;
    createdAt: string;
}

export interface Application {
    id: string;
    jobId: string;
    status: AppStatus;
    matchScore: number | null;
    appliedDate: string | null;
    createdAt: string;
    job: Job;
}

export interface Document {
    id: string;
    applicationId: string;
    type: "Custom_CV" | "Cover_Letter";
    contentMarkdown: string | null;
    s3Url: string | null;
}

export interface User {
    id: string;
    email: string;
    subscriptionTier: "free" | "pro" | "enterprise";
    profile: {
        baseResumeText?: string;
        parsedSkills?: string[];
        experienceYears?: number;
        targetRoles?: string[];
    } | null;
}

// ── State Interfaces ─────────────────────────────────────────────────────

interface AppState {
    // Auth
    user: User | null;
    token: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;

    // Applications
    applications: Application[];
    setApplications: (apps: Application[]) => void;
    updateApplicationStatus: (id: string, status: AppStatus) => void;
    addApplication: (app: Application) => void;

    // Selected application (for drawer)
    selectedApplicationId: string | null;
    drawerOpen: boolean;
    openDrawer: (id: string) => void;
    closeDrawer: () => void;

    // Documents
    documents: Record<string, Document[]>; // keyed by applicationId
    setDocuments: (applicationId: string, docs: Document[]) => void;

    // UI
    isCVModalOpen: boolean;
    setCVModalOpen: (open: boolean) => void;
    isProcessingCV: boolean;
    setProcessingCV: (processing: boolean) => void;

    // Jobs
    jobs: Job[];
    setJobs: (jobs: Job[]) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            (set) => ({
                // Auth
                user: null,
                token: null,
                setUser: (user) => set({ user }),
                setToken: (token) => set({ token }),
                logout: () => set({ user: null, token: null, applications: [], jobs: [] }),

                // Applications
                applications: [],
                setApplications: (applications) => set({ applications }),
                updateApplicationStatus: (id, status) =>
                    set((state) => ({
                        applications: state.applications.map((app) =>
                            app.id === id ? { ...app, status } : app
                        ),
                    })),
                addApplication: (app) =>
                    set((state) => ({ applications: [...state.applications, app] })),

                // Drawer
                selectedApplicationId: null,
                drawerOpen: false,
                openDrawer: (id) => set({ selectedApplicationId: id, drawerOpen: true }),
                closeDrawer: () => set({ drawerOpen: false, selectedApplicationId: null }),

                // Documents
                documents: {},
                setDocuments: (applicationId, docs) =>
                    set((state) => ({
                        documents: { ...state.documents, [applicationId]: docs },
                    })),

                // UI
                isCVModalOpen: false,
                setCVModalOpen: (isCVModalOpen) => set({ isCVModalOpen }),
                isProcessingCV: false,
                setProcessingCV: (isProcessingCV) => set({ isProcessingCV }),

                // Jobs
                jobs: [],
                setJobs: (jobs) => set({ jobs }),
            }),
            {
                name: "aerohire-store",
                partialize: (state) => ({
                    user: state.user,
                    token: state.token,
                }),
            }
        )
    )
);
