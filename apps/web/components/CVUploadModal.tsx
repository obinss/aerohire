"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAppStore } from "@/lib/store";

type UploadState = "idle" | "scanning" | "processing" | "success" | "error";

export function CVUploadModal() {
    const { isCVModalOpen, setCVModalOpen, setProcessingCV } = useAppStore();
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [fileName, setFileName] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;
            setFileName(file.name);
            setUploadState("scanning");
            setProcessingCV(true);

            // Simulate radar scanning animation phase
            await new Promise((r) => setTimeout(r, 2000));
            setUploadState("processing");

            try {
                // In production: read file text, call aiApi.parseCV(token, text)
                await new Promise((r) => setTimeout(r, 1500));
                setUploadState("success");
            } catch {
                setErrorMsg("Failed to parse CV. Please try again.");
                setUploadState("error");
            } finally {
                setProcessingCV(false);
            }
        },
        [setProcessingCV]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "text/plain": [".txt"],
        },
        maxFiles: 1,
        disabled: uploadState !== "idle",
    });

    function handleClose() {
        setCVModalOpen(false);
        setTimeout(() => {
            setUploadState("idle");
            setFileName(null);
            setErrorMsg(null);
        }, 300);
    }

    return (
        <AnimatePresence>
            {isCVModalOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-80 flex items-center justify-center p-4"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    >
                        <div
                            className="glass-dark rounded-2xl shadow-gold-lg border border-white/8 w-full max-w-lg p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close */}
                            <button
                                onClick={handleClose}
                                className="absolute top-5 right-5 p-2 glass rounded-lg text-steel hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <p className="text-gold text-xs font-mono uppercase tracking-widest mb-2">
                                    AI Document Ingestion
                                </p>
                                <h2 className="font-display text-2xl font-semibold">Upload your CV</h2>
                                <p className="text-steel text-sm mt-1 font-sans">
                                    Our AI will parse your experience, skills, and qualifications.
                                </p>
                            </div>

                            {/* Drop Zone / State Display */}
                            {uploadState === "idle" && (
                                <div
                                    {...getRootProps()}
                                    className={`relative rounded-xl border-2 border-dashed transition-all duration-300 p-10 text-center cursor-pointer
                    ${isDragActive
                                            ? "border-gold bg-gold/8 shadow-glow"
                                            : "border-white/15 hover:border-gold/40 hover:bg-white/3"
                                        }`}
                                >
                                    <input {...getInputProps()} />
                                    <Upload
                                        className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragActive ? "text-gold" : "text-steel"
                                            }`}
                                    />
                                    <p className="font-display text-lg text-white mb-2">
                                        {isDragActive ? "Release to upload" : "Drop your CV here"}
                                    </p>
                                    <p className="text-steel text-sm font-sans">
                                        or <span className="text-gold underline underline-offset-2">browse files</span>
                                    </p>
                                    <p className="text-steel/50 text-xs mt-3 font-mono">
                                        PDF, DOC, DOCX, TXT · Max 10MB
                                    </p>
                                </div>
                            )}

                            {/* Radar Scanning Animation */}
                            {(uploadState === "scanning" || uploadState === "processing") && (
                                <div className="flex flex-col items-center py-8 gap-6">
                                    {/* Radar */}
                                    <div className="relative w-48 h-48">
                                        {/* Rings */}
                                        {[100, 72, 44].map((size, i) => (
                                            <div
                                                key={i}
                                                className="radar-ring absolute"
                                                style={{
                                                    width: `${size}%`,
                                                    height: `${size}%`,
                                                    top: `${(100 - size) / 2}%`,
                                                    left: `${(100 - size) / 2}%`,
                                                    opacity: 0.4 - i * 0.1,
                                                    animation: `radar-ping ${1.5 + i * 0.4}s ease-in-out infinite`,
                                                    animationDelay: `${i * 0.3}s`,
                                                }}
                                            />
                                        ))}
                                        {/* Sweep */}
                                        <motion.div
                                            className="absolute inset-2 radar-sweep rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        />
                                        {/* Center dot */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-gold animate-pulse" />
                                        </div>
                                        {/* Blips */}
                                        {[
                                            { top: "25%", left: "60%" },
                                            { top: "60%", left: "30%" },
                                            { top: "45%", left: "70%" },
                                        ].map((pos, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-1.5 h-1.5 rounded-full bg-gold"
                                                style={pos}
                                                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    delay: i * 0.6,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        <p className="font-display text-lg text-white mb-1">
                                            {uploadState === "scanning" ? "Scanning document…" : "Extracting entities…"}
                                        </p>
                                        <p className="text-steel text-sm font-sans">
                                            {fileName && (
                                                <span className="font-mono text-gold/80">{fileName}</span>
                                            )}
                                        </p>
                                        <div className="flex items-center justify-center gap-1.5 mt-3">
                                            {["Skills", "Experience", "Education", "Tools"].map((label, i) => (
                                                <motion.span
                                                    key={label}
                                                    className="text-[10px] font-mono text-steel bg-white/5 px-2 py-0.5 rounded"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        delay: i * 0.3,
                                                    }}
                                                >
                                                    {label}
                                                </motion.span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success */}
                            {uploadState === "success" && (
                                <motion.div
                                    className="flex flex-col items-center py-8 gap-4 text-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-display text-xl text-white mb-1">CV Processed</p>
                                        <p className="text-steel text-sm font-sans">
                                            Your profile has been updated with extracted skills and experience.
                                        </p>
                                    </div>
                                    <button onClick={handleClose} className="btn-primary mt-2">
                                        Continue to Dashboard
                                    </button>
                                </motion.div>
                            )}

                            {/* Error */}
                            {uploadState === "error" && (
                                <div className="flex flex-col items-center py-8 gap-4 text-center">
                                    <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-8 h-8 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="font-display text-xl text-white mb-1">Upload Failed</p>
                                        <p className="text-red-400 text-sm font-sans">{errorMsg}</p>
                                    </div>
                                    <button
                                        onClick={() => setUploadState("idle")}
                                        className="btn-secondary mt-2"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
