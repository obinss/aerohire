"use client";

import { motion } from "framer-motion";
import { Plane, ExternalLink, Zap, Clock, Building2 } from "lucide-react";
import { type Application, type AppStatus } from "@/lib/store";

interface JobCardProps {
    application: Application;
    isDragging?: boolean;
    onClick: () => void;
}

const statusConfig: Record<AppStatus, { label: string; color: string; bg: string }> = {
    Saved: { label: "Saved", color: "#8D96A8", bg: "bg-steel/10" },
    Auto_Applied: { label: "Applied", color: "#D4AF37", bg: "bg-gold/10" },
    Interviewing: { label: "Interviewing", color: "#60A5FA", bg: "bg-blue-500/10" },
    Rejected: { label: "Rejected", color: "#F87171", bg: "bg-red-500/10" },
    Offer: { label: "Offer Target", color: "#34D399", bg: "bg-emerald-500/10" },
};

export function JobCard({ application, isDragging = false, onClick }: JobCardProps) {
    const status = statusConfig[application.status];
    const matchPct = application.matchScore != null
        ? Math.round(application.matchScore * 100)
        : null;

    return (
        <motion.div
            layout
            layoutId={application.id}
            onClick={onClick}
            className={`
                relative group overflow-hidden rounded-lg cursor-pointer select-none
                bg-white/80 dark:bg-charcoal/80 backdrop-blur-md border transition-all duration-300
                ${isDragging
                    ? "border-gold/50 shadow-[0_8px_30px_rgba(212,175,55,0.15)] z-50 scale-105"
                    : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                }
            `}
            whileHover={isDragging ? {} : { y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
            {/* Status Top Accent Line */}
            <div 
                className="absolute top-0 left-0 right-0 h-[2px] opacity-80" 
                style={{ backgroundColor: status.color }} 
            />

            <div className="p-4">
                {/* Header (Company & Status) */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-steel-dark dark:text-steel/80">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono uppercase tracking-wider line-clamp-1">{application.job.company}</span>
                    </div>
                    
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm ${status.bg} border border-black/5 dark:border-white/5`}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                        <span className="text-[10px] uppercase font-mono tracking-widest" style={{ color: status.color }}>
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                    <h3 className="font-display text-lg px-0.5 font-medium text-charcoal dark:text-white leading-tight line-clamp-2 group-hover:text-gold transition-colors">
                        {application.job.title}
                    </h3>
                </div>

                {/* Match Score & Date */}
                <div className="flex items-end justify-between pt-3 border-t border-black/5 dark:border-white/5">
                    
                    {/* Left: Match Score Display */}
                    <div className="flex flex-col gap-1.5">
                        {matchPct != null ? (
                            <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
                                        <circle 
                                            cx="16" cy="16" r="14" 
                                            stroke={matchPct >= 85 ? "#D4AF37" : "#8D96A8"} 
                                            strokeWidth="3" fill="none" 
                                            strokeDasharray={`${(matchPct / 100) * 88} 88`}
                                            strokeLinecap="round"
                                            className="drop-shadow-[0_0_4px_rgba(212,175,55,0.4)]"
                                        />
                                    </svg>
                                    <span className="absolute text-[9px] font-mono font-bold text-charcoal dark:text-white mt-[1px]">
                                        {matchPct}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-steel-dark dark:text-steel uppercase tracking-widest font-mono">Match</span>
                                    {matchPct >= 85 && (
                                        <span className="text-[10px] text-gold flex items-center gap-1">
                                            <Zap className="w-2.5 h-2.5 fill-gold" /> Optimal
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <span className="text-xs text-steel/50 font-mono italic">No score</span>
                        )}
                    </div>

                    {/* Right: Date & Link */}
                    <div className="flex flex-col items-end gap-2">
                        {application.appliedDate ? (
                            <div className="flex items-center gap-1.5 text-steel/60">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-mono">
                                    {new Date(application.appliedDate).toLocaleDateString("en-GB", {
                                        day: "2-digit", month: "short",
                                    })}
                                </span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-mono text-steel/40">Not applied</span>
                        )}
                        <a
                            href={application.job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center text-[10px] uppercase font-mono tracking-widest text-steel-dark dark:text-steel hover:text-charcoal dark:hover:text-white transition-colors gap-1"
                            title="Open Source"
                        >
                            {application.job.source || "Link"} <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
