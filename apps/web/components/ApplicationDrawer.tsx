"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, FileCheck, Download, Sparkles, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ApplicationDrawer() {
    const { drawerOpen, closeDrawer, selectedApplicationId, applications, documents } =
        useAppStore();

    const [activeTab, setActiveTab] = useState<"cover_letter" | "cv">("cover_letter");
    const [isGenerating, setIsGenerating] = useState(false);

    const application = applications.find((a) => a.id === selectedApplicationId);
    const appDocuments = selectedApplicationId ? (documents[selectedApplicationId] ?? []) : [];
    const coverLetter = appDocuments.find((d) => d.type === "Cover_Letter");
    const customCV = appDocuments.find((d) => d.type === "Custom_CV");

    async function handleGenerate() {
        setIsGenerating(true);
        // In production: call aiApi.generateCoverLetter(token, selectedApplicationId!)
        await new Promise((r) => setTimeout(r, 2000));
        setIsGenerating(false);
    }

    return (
        <AnimatePresence>
            {drawerOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrawer}
                    />

                    {/* Drawer */}
                    <motion.aside
                        className="fixed right-0 top-0 bottom-0 w-full max-w-xl glass-dark border-l border-white/8 z-60 flex flex-col overflow-hidden"
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 30 }}
                    >
                        {/* Drawer Header */}
                        <div className="flex items-start justify-between p-6 border-b border-white/5">
                            <div>
                                <p className="text-steel text-xs font-mono uppercase tracking-wider mb-1">
                                    Application Detail
                                </p>
                                <h2 className="font-display text-xl font-semibold">
                                    {application?.job.title ?? "Loading…"}
                                </h2>
                                <p className="text-steel text-sm">{application?.job.company}</p>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="p-2 glass rounded-lg text-steel hover:text-white transition-colors mt-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Match Score Banner */}
                        {application?.matchScore != null && (
                            <div className="glass-gold mx-6 mt-4 rounded-xl px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-gold" />
                                    <span className="text-gold text-sm font-medium">AI Match Score</span>
                                </div>
                                <span className="font-display text-2xl text-gold font-semibold">
                                    {Math.round(application.matchScore * 100)}%
                                </span>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-1 mx-6 mt-4 glass rounded-lg p-1">
                            {(["cover_letter", "cv"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-sans transition-all duration-200 ${activeTab === tab
                                            ? "bg-gold/15 text-gold border border-gold/25"
                                            : "text-steel hover:text-white"
                                        }`}
                                >
                                    {tab === "cover_letter" ? (
                                        <><FileText className="w-3.5 h-3.5" /> Cover Letter</>
                                    ) : (
                                        <><FileCheck className="w-3.5 h-3.5" /> Custom CV</>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Document Content */}
                        <div className="flex-1 overflow-y-auto mx-6 my-4 glass rounded-xl p-5">
                            {activeTab === "cover_letter" ? (
                                coverLetter?.contentMarkdown ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({ children }) => <h1 className="font-display text-xl text-white">{children}</h1>,
                                                p: ({ children }) => <p className="text-steel/90 leading-relaxed text-sm mb-3">{children}</p>,
                                                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                                            }}
                                        >
                                            {coverLetter.contentMarkdown}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                                        <div className="w-16 h-16 glass-gold rounded-full flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-gold" />
                                        </div>
                                        <div>
                                            <p className="font-display text-lg text-white mb-1">No cover letter yet</p>
                                            <p className="text-steel text-sm">
                                                Generate an AI-crafted cover letter tailored to this role.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className="btn-primary"
                                        >
                                            {isGenerating ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                                            ) : (
                                                <><Sparkles className="w-4 h-4" /> Generate Cover Letter</>
                                            )}
                                        </button>
                                    </div>
                                )
                            ) : customCV?.contentMarkdown ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {customCV.contentMarkdown}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center">
                                        <FileCheck className="w-8 h-8 text-steel" />
                                    </div>
                                    <div>
                                        <p className="font-display text-lg text-white mb-1">No tailored CV</p>
                                        <p className="text-steel text-sm">
                                            Generate a version of your CV optimised for this specific role.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="btn-primary"
                                    >
                                        {isGenerating ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                                        ) : (
                                            <><Sparkles className="w-4 h-4" /> Generate Custom CV</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="flex items-center gap-3 px-6 pb-6">
                            {(coverLetter || customCV) && (
                                <button className="btn-secondary flex-1">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            )}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="btn-primary flex-1"
                            >
                                {isGenerating ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Regenerate</>
                                )}
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
