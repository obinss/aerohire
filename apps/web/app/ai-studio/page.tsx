"use client";

import { motion } from "framer-motion";
import {
    Briefcase, BarChart3, Zap, BellRing, Upload, Plane, CheckCircle2, FileText, FileSearch, Sparkles, LogOut
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { CVUploadModal } from "@/components/CVUploadModal";
import { aiApi, applicationsApi } from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIStudioPage() {
    const { setCVModalOpen, user, logout, token } = useAppStore();
    const [activeTab, setActiveTab] = useState<"parser" | "match" | "generator">("parser");
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string>("");
    
    // Match Loading State
    const [matchScore, setMatchScore] = useState<number | null>(null);
    const [matchExplanation, setMatchExplanation] = useState<string>("");
    const [isScoring, setIsScoring] = useState(false);

    // Generator Loading State
    const [coverLetter, setCoverLetter] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if(token) {
            applicationsApi.list(token).then((res: any) => setApplications(res)).catch(console.error);
        }
    }, [token]);

    const handleMatchScore = async () => {
        if(!selectedAppId || !token) return;
        setIsScoring(true);
        try {
            const app = applications.find(a => a.id === selectedAppId);
            if(app) {
                const result = await aiApi.matchScore(token, app.jobId);
                setMatchScore(result.score);
                setMatchExplanation(result.explanation);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to compute match score. Have you uploaded your CV?");
        } finally {
            setIsScoring(false);
        }
    };

    const handleGenerate = async () => {
         if(!selectedAppId || !token) return;
         setIsGenerating(true);
         try {
             const result = await aiApi.generateCoverLetter(token, selectedAppId);
             setCoverLetter(result.content_markdown);
         } catch (err) {
             console.error(err);
             alert("Failed to generate document.");
         } finally {
             setIsGenerating(false);
         }
    };

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
                    <Link href="/pipeline" className="nav-item group">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium text-[13px] tracking-wide">Pipeline</span>
                    </Link>
                    <Link href="/dashboard" className="nav-item group relative">
                        <BellRing className="w-4 h-4" />
                        <span className="font-medium text-[13px] tracking-wide">Alerts</span>
                    </Link>
                    <Link href="/ai-studio" className="nav-item-active">
                        <Zap className="w-4 h-4 text-gold" />
                        <span className="font-medium text-[13px] tracking-wide text-gold">AI Studio</span>
                    </Link>
                </nav>

                <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.04] mb-4 space-y-1">
                    <button 
                        onClick={() => setCVModalOpen(true)} 
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md border border-gold/20 bg-gold/5 hover:bg-gold/10 transition-colors text-left"
                    >
                        <Upload className="w-4 h-4 text-gold/80" />
                        <span className="text-gold text-[13px] font-medium tracking-wide">Upload CV Profile</span>
                    </button>
                    <button 
                        onClick={() => {
                            logout();
                            if(typeof window !== "undefined") window.location.href = "/";
                        }} 
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors text-left text-red-500/80 hover:text-red-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-[13px] font-medium tracking-wide">Logout</span>
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

            {/* Main Content */}
            <main className="flex-1 ml-[260px] p-8 md:p-10 lg:p-12 overflow-y-auto relative z-10">
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
                                Generator Core
                            </p>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight mb-3">
                            AI <span className="text-gold">Studio.</span>
                        </h1>
                        <p className="text-steel-dark dark:text-steel/80 text-sm md:text-base leading-relaxed font-sans font-light">
                            Deploy fine-tuned LLMs to parse your baseline experience, calculate precise match vectors against listings, and author ATS-optimized documents.
                        </p>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-black/5 dark:border-white/5 pb-px">
                     <button
                        onClick={() => setActiveTab("parser")}
                        className={`pb-4 px-2 text-sm font-medium transition-all ${activeTab === "parser" ? "text-gold border-b-2 border-gold" : "text-steel-dark dark:text-steel hover:text-charcoal dark:hover:text-white"}`}
                     >
                        <div className="flex items-center gap-2">
                             <FileText className="w-4 h-4" />
                             CV Intelligence
                        </div>
                     </button>
                      <button
                        onClick={() => setActiveTab("match")}
                        className={`pb-4 px-2 text-sm font-medium transition-all ${activeTab === "match" ? "text-gold border-b-2 border-gold" : "text-steel-dark dark:text-steel hover:text-charcoal dark:hover:text-white"}`}
                     >
                        <div className="flex items-center gap-2">
                             <FileSearch className="w-4 h-4" />
                             Match Scoring
                        </div>
                     </button>
                      <button
                        onClick={() => setActiveTab("generator")}
                        className={`pb-4 px-2 text-sm font-medium transition-all ${activeTab === "generator" ? "text-gold border-b-2 border-gold" : "text-steel-dark dark:text-steel hover:text-charcoal dark:hover:text-white"}`}
                     >
                        <div className="flex items-center gap-2">
                             <Sparkles className="w-4 h-4" />
                             Doc Generation
                        </div>
                     </button>
                </div>

                {/* Content Areas */}
                <motion.div
                    className="card min-h-[400px]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    key={activeTab} // re-animate on tab switch
                >
                    {activeTab === "parser" && (
                         <div className="flex flex-col items-center justify-center text-center h-[300px]">
                              <div className="w-16 h-16 rounded-2xl glass-gold mb-6 flex items-center justify-center">
                                   <FileText className="w-8 h-8 text-gold" />
                              </div>
                              <h3 className="font-display text-xl mb-2">CV Intelligence Engine</h3>
                              <p className="text-steel dark:text-steel/80 text-sm mb-6 max-w-md">
                                  {user?.profile?.baseResumeText ? "Your profile is parsed and active." : "Upload your raw resume text to extract skills and baseline experience vectors."}
                              </p>
                              {}
                              <button onClick={() => setCVModalOpen(true)} className="btn-primary py-3 px-6">
                                  {user?.profile?.baseResumeText ? "Update CV" : "Upload CV"}
                              </button>
                         </div>
                    )}

                    {activeTab === "match" && (
                         <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                               <div className="w-16 h-16 rounded-2xl glass-navy mb-6 flex items-center justify-center">
                                   <FileSearch className="w-8 h-8 text-blue-400" />
                              </div>
                              <h3 className="font-display text-xl mb-2">Opportunity Matching</h3>
                              <p className="text-steel dark:text-steel/80 text-sm mb-6 max-w-md text-center">
                                  Select a saved job from your pipeline to calculate the objective match score using cosine similarity.
                              </p>
                              
                              <div className="w-full max-w-md space-y-4">
                                  <select 
                                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-gold"
                                      value={selectedAppId}
                                      onChange={(e) => setSelectedAppId(e.target.value)}
                                  >
                                      <option value="" disabled>Select an Application Sequence...</option>
                                      {applications.map(app => (
                                          <option key={app.id} value={app.id}>
                                              {app.job?.title} at {app.job?.company}
                                          </option>
                                      ))}
                                  </select>
                                  
                                  <button 
                                      onClick={handleMatchScore} 
                                      disabled={!selectedAppId || isScoring}
                                      className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                      {isScoring ? "Computing Vector Trajectory..." : "Run Analysis Target"}
                                  </button>
                              </div>

                              {matchScore !== null && (
                                  <motion.div 
                                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                                      className="mt-8 p-6 glass-dark border border-gold/20 rounded-xl max-w-xl w-full text-left"
                                  >
                                      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                                          <span className="text-sm font-mono text-steel uppercase tracking-widest">Alignment Score</span>
                                          <span className="text-2xl font-display text-gold">{matchScore}%</span>
                                      </div>
                                      <p className="text-sm text-steel leading-relaxed">{matchExplanation}</p>
                                  </motion.div>
                              )}
                         </div>
                    )}

                     {activeTab === "generator" && (
                          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                              <div className="w-16 h-16 rounded-2xl glass-gold mb-6 flex items-center justify-center">
                                   <Sparkles className="w-8 h-8 text-gold" />
                              </div>
                              <h3 className="font-display text-xl mb-2">Document Generation</h3>
                              <p className="text-steel dark:text-steel/80 text-sm mb-6 max-w-md text-center">
                                  Generate highly calibrated, ATS-optimized cover letters tailored precisely to a specific application in your pipeline.
                              </p>
                             
                              <div className="w-full max-w-md space-y-4">
                                  <select 
                                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-gold"
                                      value={selectedAppId}
                                      onChange={(e) => setSelectedAppId(e.target.value)}
                                  >
                                      <option value="" disabled>Select Target Application...</option>
                                      {applications.map(app => (
                                          <option key={app.id} value={app.id}>
                                              {app.job?.title} at {app.job?.company}
                                          </option>
                                      ))}
                                  </select>
                                  
                                  <button 
                                      onClick={handleGenerate} 
                                      disabled={!selectedAppId || isGenerating}
                                      className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                      {isGenerating ? "Synthesizing Document..." : "Generate Cover Letter"}
                                  </button>
                              </div>

                              {coverLetter && (
                                   <motion.div 
                                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                                      className="mt-8 p-6 bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 shadow-xl rounded-xl max-w-3xl w-full text-left overflow-y-auto max-h-[600px] prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-headings:font-display prose-headings:text-charcoal dark:prose-headings:text-white"
                                  >
                                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{coverLetter}</ReactMarkdown>
                                  </motion.div>
                              )}
                         </div>
                    )}
                </motion.div>
            </main>

            <CVUploadModal />
        </div>
    );
}
