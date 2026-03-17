"use client";

import { motion } from "framer-motion";
import { Plane, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
    const router = useRouter();
    const { setToken, setUser } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const { access_token } = await authApi.login(email, password);
            setToken(access_token);
            
            // Fetch and store user profile
            const userData = await authApi.me(access_token);
            setUser(userData as any);

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to authenticate. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = async (provider: "google" | "apple") => {
        setIsLoading(true);
        setError(null);
        try {
            // Mock OAuth integration for demo
            const mockEmail = `commander@${provider}.com`;
            const mockId = `${provider}_123456789`;
            
            const { access_token } = await authApi.oauthLogin(mockEmail, provider, mockId);
            setToken(access_token);
            
            const userData = await authApi.me(access_token);
            setUser(userData as any);

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || `Failed to authenticate with ${provider}.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FAF9F6] dark:bg-charcoal text-charcoal dark:text-white flex flex-col items-center justify-center p-6 relative">
             <div className="absolute inset-0 block pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.03),transparent_50%)]" />
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] dark:opacity-[0.015] mix-blend-overlay" />
            </div>

            <motion.div 
                className="w-full max-w-md z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link href="/" className="flex items-center gap-3 mb-10 justify-center">
                    <div className="w-10 h-10 bg-gold rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        <Plane className="w-5 h-5 text-charcoal rotate-45" />
                    </div>
                    <span className="font-display text-2xl font-semibold">
                        Aero<span className="text-gold">Hire</span>
                    </span>
                </Link>

                <div className="glass rounded-2xl p-8 border border-black/5 dark:border-white/5 shadow-xl">
                    <h1 className="font-display text-2xl font-semibold mb-2 text-center">Security Clearance</h1>
                    <p className="text-steel-dark dark:text-steel text-sm text-center mb-8 font-sans">
                        Enter your credentials to access the operational dashboard.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-steel-dark dark:text-steel mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all font-sans"
                                placeholder="commander@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono uppercase tracking-widest text-steel-dark dark:text-steel mb-2">
                                Access Code
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all font-sans"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Authorize Access
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
                        <span className="text-xs uppercase tracking-widest text-steel font-mono">Or authorize via</span>
                        <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => handleOAuth("google")}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors text-sm font-medium"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button 
                            onClick={() => handleOAuth("apple")}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors text-sm font-medium"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 4c-1.3 0-2.6.5-3.5 1.4-1-1-2.3-1.4-3.5-1.4-2.8 0-5 2.2-5 5 0 2.2 1.3 4.1 3.2 4.8.8.3 1.7.5 2.6.5.9 0 1.8-.2 2.6-.5 1.9-.7 3.2-2.6 3.2-4.8 0-2.8-2.2-5-5-5zm-3.5 8c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z"/>
                                <path d="M16.3 14c-.6.8-1.3 1.6-2.2 2-1.1.5-2.2.5-3.3 0-.9-.4-1.6-1.2-2.2-2-1.1-1.4-1.6-3.2-1.6-5.1 0-2.9 1.7-5.5 4.3-6.6.9-.4 1.8-.6 2.7-.6 1.4 0 2.8.5 3.9 1.3 1.2 1 2.1 2.4 2.1 4 0 2.1-.9 3.9-2.3 5.3-1.6 1.7-3.9 2.5-6.2 2.2-2.4-.2-4.6-1.4-6.1-3.2-.8-1-1.4-2.1-1.7-3.4-.3-1.3-.2-2.7.2-3.9"/>
                            </svg>
                            Apple
                        </button>
                    </div>

                    <p className="mt-6 text-center text-sm text-steel-dark dark:text-steel">
                        No clearance?{" "}
                        <Link href="/register" className="text-gold font-medium hover:underline">
                            Request Access Protocol
                        </Link>
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
