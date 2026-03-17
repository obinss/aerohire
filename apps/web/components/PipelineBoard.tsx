"use client";

import { useState, useCallback } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { JobCard } from "@/components/JobCard";
import { ApplicationDrawer } from "@/components/ApplicationDrawer";
import { Application, AppStatus, useAppStore } from "@/lib/store";
import { useEffect } from "react";
import { applicationsApi } from "@/lib/api";

// ── Column Config ─────────────────────────────────────────────────────────

const COLUMNS: { id: AppStatus; label: string; accent: string }[] = [
    { id: "Saved", label: "Saved", accent: "#8D96A8" },
    { id: "Auto_Applied", label: "Applied", accent: "#D4AF37" },
    { id: "Interviewing", label: "Interviewing", accent: "#60A5FA" },
    { id: "Offer", label: "Offer", accent: "#34D399" },
    { id: "Rejected", label: "Rejected", accent: "#F87171" },
];

// ── Sortable Card Wrapper ─────────────────────────────────────────────────

function SortableJobCard({
    application,
    onClick,
}: {
    application: Application;
    onClick: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: application.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <JobCard
                application={application}
                isDragging={isDragging}
                onClick={onClick}
            />
        </div>
    );
}

// ── Column ────────────────────────────────────────────────────────────────

function KanbanColumn({
    columnId,
    label,
    accent,
    applications,
    onCardClick,
    isOver,
}: {
    columnId: AppStatus;
    label: string;
    accent: string;
    applications: Application[];
    onCardClick: (id: string) => void;
    isOver: boolean;
}) {
    return (
        <motion.div
            className={`flex flex-col min-w-[320px] w-[320px] rounded-xl overflow-hidden transition-colors duration-300
                ${isOver ? "bg-black/[0.04] dark:bg-white/[0.04]" : "bg-transparent"}
                border-x border-black/[0.03] dark:border-white/[0.03]
            `}
            animate={isOver ? { scale: 1.005 } : { scale: 1 }}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white/40 dark:bg-charcoal/40 backdrop-blur-sm border-b border-black/[0.04] dark:border-white/[0.04] sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 flex-shrink-0 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-charcoal/90 dark:text-white/90">
                        {label}
                    </span>
                </div>
                <div 
                    className="h-6 px-2.5 rounded-sm flex items-center justify-center text-[10px] font-mono font-medium border"
                    style={{ background: `${accent}15`, color: accent, borderColor: `${accent}30` }}
                >
                    {applications.length}
                </div>
            </div>

            {/* Lane Area */}
            <div 
                className={`flex flex-col gap-4 p-4 flex-1 min-h-[500px] transition-colors duration-300
                    ${isOver ? "bg-gradient-to-b from-black/[0.04] dark:from-white/[0.04] to-transparent" : "bg-gradient-to-b from-black/[0.02] dark:from-charcoal/40 to-transparent"}
                `}
            >
                <SortableContext
                    items={applications.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <AnimatePresence initial={false}>
                        {applications.map((app) => (
                            <motion.div
                                key={app.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <SortableJobCard
                                    application={app}
                                    onClick={() => onCardClick(app.id)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {applications.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                            <div className="w-12 h-12 rounded-full border border-dashed border-black/20 dark:border-white/20 mb-3 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20" />
                            </div>
                            <p className="text-steel-dark dark:text-steel text-[10px] uppercase tracking-widest font-mono">Empty Sector</p>
                        </div>
                    )}
                </SortableContext>
            </div>
        </motion.div>
    );
}

// ── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_APPLICATIONS: Application[] = [
    {
        id: "1",
        jobId: "j1",
        status: "Saved",
        matchScore: 0.91,
        appliedDate: null,
        createdAt: new Date().toISOString(),
        job: {
            id: "j1",
            title: "Senior Frontend Engineer",
            company: "Vercel",
            description: "",
            url: "https://vercel.com/careers",
            source: "linkedin",
            postedDate: null,
            requiredQualifications: null,
            createdAt: new Date().toISOString(),
        },
    },
    {
        id: "2",
        jobId: "j2",
        status: "Auto_Applied",
        matchScore: 0.88,
        appliedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        job: {
            id: "j2",
            title: "Staff UX Designer",
            company: "Linear",
            description: "",
            url: "https://linear.app/careers",
            source: "email-alert",
            postedDate: null,
            requiredQualifications: null,
            createdAt: new Date().toISOString(),
        },
    },
    {
        id: "3",
        jobId: "j3",
        status: "Interviewing",
        matchScore: 0.94,
        appliedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        job: {
            id: "j3",
            title: "Engineering Manager",
            company: "Stripe",
            description: "",
            url: "https://stripe.com/jobs",
            source: "indeed",
            postedDate: null,
            requiredQualifications: null,
            createdAt: new Date().toISOString(),
        },
    },
    {
        id: "4",
        jobId: "j4",
        status: "Offer",
        matchScore: 0.97,
        appliedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        job: {
            id: "j4",
            title: "Principal Engineer",
            company: "Airbus",
            description: "",
            url: "https://airbus.com/careers",
            source: "linkedin",
            postedDate: null,
            requiredQualifications: null,
            createdAt: new Date().toISOString(),
        },
    },
];

// ── PipelineBoard ────────────────────────────────────────────────────────

export function PipelineBoard() {
    const { applications: storeApps, updateApplicationStatus, openDrawer, setApplications, token } = useAppStore();
    const [localApps, setLocalApps] = useState<Application[]>(storeApps);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overColumnId, setOverColumnId] = useState<AppStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchApps() {
            if (!token) return;
            try {
                const results = await applicationsApi.list(token as string);
                setApplications(results as any);
                setLocalApps(results as any);
            } catch (err) {
                console.error("Failed to load apps", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchApps();
    }, [token, setApplications]);

    // Keep local synced if store changes from outside
    useEffect(() => {
        if (!isLoading) {
            setLocalApps(storeApps);
        }
    }, [storeApps, isLoading]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const activeApp = localApps.find((a) => a.id === activeId) ?? null;

    const handleDragStart = useCallback(({ active }: DragStartEvent) => {
        setActiveId(active.id as string);
    }, []);

    const handleDragOver = useCallback(
        ({ over }: DragOverEvent) => {
            if (!over) { setOverColumnId(null); return; }
            const overId = over.id as string;
            const colId = COLUMNS.find((c) => c.id === overId)?.id;
            if (colId) {
                setOverColumnId(colId);
            } else {
                const app = localApps.find((a) => a.id === overId);
                if (app) setOverColumnId(app.status);
            }
        },
        [localApps]
    );

    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            setActiveId(null);
            setOverColumnId(null);
            if (!over) return;

            const draggedApp = localApps.find((a) => a.id === active.id);
            if (!draggedApp) return;

            const overColumnId = COLUMNS.find((c) => c.id === over.id)?.id;
            const overAppColumn = localApps.find((a) => a.id === over.id)?.status;
            const newStatus = overColumnId ?? overAppColumn;

            if (!newStatus || newStatus === draggedApp.status) return;

            // Optimistic Update
            setLocalApps((prev) =>
                prev.map((a) =>
                    a.id === draggedApp.id ? { ...a, status: newStatus as AppStatus } : a
                )
            );
            
            // Try updating backed, if fails rollback
            if (token) {
                applicationsApi.updateStatus(token as string, draggedApp.id, newStatus as string).then(() => {
                    updateApplicationStatus(draggedApp.id, newStatus as AppStatus);
                }).catch(err => {
                    console.error("Failed to update status", err);
                    setLocalApps(storeApps); // Rollback
                });
            }

        },
        [localApps, updateApplicationStatus, token, storeApps]
    );

    if (isLoading) {
        return <div className="min-h-[600px] flex items-center justify-center">
             <div className="text-steel font-mono animate-pulse uppercase tracking-widest text-xs">Loading Pipeline...</div>
        </div>
    }

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px]">
                    {COLUMNS.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            columnId={col.id}
                            label={col.label}
                            accent={col.accent}
                            applications={localApps.filter((a) => a.status === col.id)}
                            onCardClick={openDrawer}
                            isOver={overColumnId === col.id}
                        />
                    ))}
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeApp && (
                        <div className="rotate-2 scale-105">
                            <JobCard application={activeApp} isDragging onClick={() => { }} />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Drawer */}
            <ApplicationDrawer />
        </>
    );
}
