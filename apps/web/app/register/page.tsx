"use client";

import { motion } from "framer-motion";
import { Plane, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function RegisterPage() {
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
            const { access_token } = await authApi.register(email, password);
            setToken(access_token);
            
            // Fetch and store user profile
            const userData = await authApi.me(access_token);
            setUser(userData as any);

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to register. Email may already be in use.");
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
                    <h1 className="font-display text-2xl font-semibold mb-2 text-center">Request Access</h1>
                    <p className="text-steel-dark dark:text-steel text-sm text-center mb-8 font-sans">
                        Setup your AeroHire commander profile.
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
                                minLength={6}
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
                                    Establish Protocol
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-steel-dark dark:text-steel">
                        Already have clearance?{" "}
                        <Link href="/login" className="text-gold font-medium hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
