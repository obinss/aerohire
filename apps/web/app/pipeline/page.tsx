"use client";

import { motion } from "framer-motion";
import {
    Briefcase, BarChart3, Zap, BellRing, Upload, SlidersHorizontal, Plane, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { PipelineBoard } from "@/components/PipelineBoard";
import { CVUploadModal } from "@/components/CVUploadModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";

export default function PipelinePage() {
    const { setCVModalOpen } = useAppStore();

    return (
        <div className="min-h-screen bg-[#FAF9F6] dark:bg-charcoal text-charcoal dark:text-white flex relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 block pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.03),transparent_50%)]" />
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] dark:opacity-[0.015] mix-blend-overlay" />
                <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
            </div>

            {/* Sidebar */}
            <aside className="w-[260px] border-r border-black/[0.04] dark:border-white/[0.04] bg-white/80 dark:bg-charcoal/95 backdrop-blur-xl flex flex-col py-6 px-4 fixed top-0 left-0 bottom-0 z-40 transition-all shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
                <Link href="/" className="flex items-center gap-3 mb-10 px-2 group">
                    <div className="w-8 h-8 rounded-sm bg-gradient-to-b from-gold to-gold-light flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all">
                        <Plane className="w-4 h-4 text-charcoal rotate-45" />
                    </div>
                    <span className="font-display text-lg font-semibold tracking-wide">
                        Aero<span className="text-gold">Hire</span>
                    </span>
                </Link>
                
                <nav className="flex flex-col gap-1.5 flex-1">
                    <Link href="/dashboard" className="nav-item group">
                        <BarChart3 className="w-4 h-4" />
                        <span className="font-medium text-[13px] tracking-wide">Dashboard</span>
                    </Link>
                    <Link href="/pipeline" className="nav-item-active">
                        <Briefcase className="w-4 h-4 text-gold" />
                        <span className="font-medium text-[13px] tracking-wide text-gold">Pipeline</span>
                    </Link>
                    <Link href="/dashboard" className="nav-item group relative">
                        <BellRing className="w-4 h-4" />
                        <span className="font-medium text-[13px] tracking-wide">Alerts</span>
                    </Link>
                    <Link href="/dashboard" className="nav-item group">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium text-[13px] tracking-wide">AI Studio</span>
                    </Link>
                </nav>

                <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] mb-4">
                    <button 
                        onClick={() => setCVModalOpen(true)} 
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md border border-gold/20 bg-gold/5 hover:bg-gold/10 transition-colors text-left"
                    >
                        <Upload className="w-4 h-4 text-gold/80" />
                        <span className="text-gold text-[13px] font-medium tracking-wide">Upload CV Profile</span>
                    </button>
                </div>

                <div className="relative overflow-hidden rounded-lg p-4 border border-black/[0.04] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01] flex justify-between items-start">
                    <div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-bl-full blur-xl pointer-events-none" />
                        <p className="text-[10px] text-steel font-mono uppercase tracking-[0.2em] mb-1">Active Plan</p>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                            <p className="font-serif text-sm font-medium tracking-wide">Executive Pro</p>
                        </div>
                        <p className="text-steel-dark dark:text-steel/70 text-[11px] mt-2 leading-relaxed">Unlimited AI generation & real-time scraping enabled.</p>
                    </div>
                    <ThemeToggle />
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 ml-[260px] p-8 md:p-10 lg:p-12 overflow-x-auto relative z-10">
                {/* Header */}
                <motion.div
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-[1px] w-8 bg-gold/40" />
                            <p className="text-gold text-[10px] font-mono uppercase tracking-[0.3em] font-semibold">
                                Mission Control
                            </p>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight mb-3">
                            Application <span className="text-gold">Pipeline.</span>
                        </h1>
                        <p className="text-steel-dark dark:text-steel/80 text-sm md:text-base leading-relaxed font-sans font-light">
                            Monitor and manage your active applications. 
                            Status updates and AI-calibrated documents flow directly into this sector.
                        </p>
                    </div>
                    
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 hover:border-gold/30 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all text-sm font-medium text-steel-dark dark:text-steel hover:text-charcoal dark:hover:text-white">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filter Matrix</span>
                    </button>
                </motion.div>

                {/* Sleek Tip banner */}
                <motion.div
                    className="flex items-start md:items-center gap-4 p-4 mb-8 bg-gradient-to-r from-white dark:from-charcoal to-[#F5F5F0] dark:to-charcoal border-l-2 border-l-gold border-y border-r border-black/5 dark:border-white/5 rounded-r-lg shadow-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                >
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-gold" />
                    </div>
                    <p className="text-steel-dark dark:text-steel flex-1 text-sm leading-relaxed">
                        <span className="text-charcoal dark:text-white font-medium">System Alert:</span> Click any candidate card to open the AI Studio. 
                        Generated cover letters are mathematically optimized for highest ATS resonance.
                    </p>
                </motion.div>

                {/* Kanban Board */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                >
                    <PipelineBoard />
                </motion.div>
            </main>

            <CVUploadModal />
        </div>
    );
}
