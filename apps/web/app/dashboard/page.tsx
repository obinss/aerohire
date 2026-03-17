"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    Briefcase,
    TrendingUp,
    Clock,
    Plane,
    Zap,
    ChevronRight,
    BellRing,
    Upload,
} from "lucide-react";
import Link from "next/link";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { CVUploadModal } from "@/components/CVUploadModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";

// Mock data — replaced by real API data in production
const activityData = [
    { week: "W1", applications: 3, interviews: 0 },
    { week: "W2", applications: 7, interviews: 1 },
    { week: "W3", applications: 5, interviews: 2 },
    { week: "W4", applications: 12, interviews: 3 },
    { week: "W5", applications: 9, interviews: 4 },
    { week: "W6", applications: 14, interviews: 5 },
];

const pipelineData = [
    { name: "Saved", value: 8, color: "#8D96A8" },
    { name: "Applied", value: 15, color: "#D4AF37" },
    { name: "Interviewing", value: 5, color: "#60A5FA" },
    { name: "Offer", value: 2, color: "#34D399" },
];

const recentAlerts = [
    { title: "Principal Engineer", company: "Stripe", score: 94, time: "2m ago" },
    { title: "Staff Product Designer", company: "Linear", score: 91, time: "18m ago" },
    { title: "Engineering Manager", company: "Vercel", score: 87, time: "1h ago" },
];

const metrics = [
    { label: "Active Applications", value: "30", delta: "+5 this week", icon: Briefcase, positive: true },
    { label: "Avg. Match Score", value: "88%", delta: "+3% this month", icon: TrendingUp, positive: true },
    { label: "Interviews Booked", value: "5", delta: "+2 this week", icon: Clock, positive: true },
    { label: "Pending Auto-Apply", value: "12", delta: "4 new today", icon: Zap, positive: null },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass rounded-lg p-3 border border-gold/20">
                <p className="text-steel text-xs mb-1 font-mono">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} className="text-sm font-medium" style={{ color: p.color }}>
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const { setCVModalOpen } = useAppStore();

    return (
        <div className="min-h-screen bg-[#FAF9F6] dark:bg-charcoal text-charcoal dark:text-white hud-grid flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-black/5 dark:border-white/5 glass-dark flex flex-col py-6 px-4 fixed top-0 left-0 bottom-0 z-40">
                <Link href="/" className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
                        <Plane className="w-4 h-4 text-charcoal rotate-45" />
                    </div>
                    <span className="font-display text-lg font-semibold">
                        Aero<span className="text-gold">Hire</span>
                    </span>
                </Link>

                <nav className="flex flex-col gap-1 flex-1">
                    <Link href="/dashboard" className="nav-item-active">
                        <BarChart3 className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <Link href="/pipeline" className="nav-item">
                        <Briefcase className="w-4 h-4" />
                        Pipeline
                    </Link>
                    <Link href="/dashboard" className="nav-item">
                        <BellRing className="w-4 h-4" />
                        Alerts
                    </Link>
                    <Link href="/dashboard" className="nav-item">
                        <Zap className="w-4 h-4" />
                        AI Studio
                    </Link>
                </nav>

                <div className="pt-4 border-t border-white/5">
                    <button
                        onClick={() => setCVModalOpen(true)}
                        className="nav-item w-full text-left"
                    >
                        <Upload className="w-4 h-4 text-gold" />
                        <span className="text-gold">Upload CV</span>
                    </button>
                </div>

                <div className="mt-4 glass-gold rounded-xl p-4 flex justify-between items-start">
                    <div>
                        <p className="text-xs text-steel font-mono uppercase tracking-widest mb-1">Tier</p>
                        <p className="text-gold font-display font-semibold">Executive Pro</p>
                        <p className="text-steel-dark dark:text-steel text-xs mt-1">Unlimited AI generation</p>
                    </div>
                    <ThemeToggle />
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {/* Header */}
                <motion.div
                    className="flex items-start justify-between mb-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <p className="text-steel text-xs font-mono uppercase tracking-widest mb-1">
                            AEROHIRE · CONTROL TOWER
                        </p>
                        <h1 className="font-display text-4xl font-semibold">
                            Good morning,{" "}
                            <span className="text-gold-gradient">Commander.</span>
                        </h1>
                        <p className="text-steel-dark dark:text-steel text-sm mt-1 font-sans">
                            You have 3 new high-match opportunities since your last session.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-steel text-xs font-mono">SCRAPER · LIVE</span>
                    </div>
                </motion.div>

                {/* Metrics Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {metrics.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <motion.div
                                key={m.label}
                                className="metric-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="label">{m.label}</p>
                                    <Icon className="w-4 h-4 text-steel" />
                                </div>
                                <p className="font-display text-3xl font-semibold text-charcoal dark:text-white">{m.value}</p>
                                <p
                                    className={`text-xs font-sans ${m.positive === true
                                            ? "text-emerald-400"
                                            : m.positive === false
                                                ? "text-red-400"
                                                : "text-steel"
                                        }`}
                                >
                                    {m.delta}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Application Velocity */}
                    <motion.div
                        className="card lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-display text-xl font-semibold">Application Velocity</h2>
                                <p className="text-steel text-xs font-sans mt-1">Weekly applications vs. interviews</p>
                            </div>
                            <span className="badge status-applied">Last 6 weeks</span>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="steelGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8D96A8" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8D96A8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="week" tick={{ fill: "#8D96A8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#8D96A8", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="applications" stroke="#D4AF37" fill="url(#goldGrad)" strokeWidth={2} name="Applications" />
                                <Area type="monotone" dataKey="interviews" stroke="#8D96A8" fill="url(#steelGrad)" strokeWidth={2} name="Interviews" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Pipeline Breakdown */}
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.6 }}
                    >
                        <h2 className="font-display text-xl font-semibold mb-6">Pipeline Breakdown</h2>
                        <div className="flex justify-center mb-4">
                            <PieChart width={180} height={180}>
                                <Pie
                                    data={pipelineData}
                                    cx={90} cy={90}
                                    innerRadius={55} outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pipelineData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} opacity={0.85} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </div>
                        <div className="space-y-2">
                            {pipelineData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                                        <span className="text-steel-dark dark:text-steel text-xs font-sans">{item.name}</span>
                                    </div>
                                    <span className="text-charcoal dark:text-white text-sm font-mono">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* AI Match Alerts */}
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-display text-xl font-semibold">Match Alerts</h2>
                            <p className="text-steel text-xs font-sans mt-1">Roles above your 85% threshold</p>
                        </div>
                        <Link href="/pipeline" className="btn-ghost text-xs flex items-center gap-1">
                            View all <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentAlerts.map((alert, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-4 p-4 glass-dark rounded-xl hover:border-gold/20 border border-transparent transition-all duration-200 cursor-pointer"
                                whileHover={{ x: 4 }}
                            >
                                <div className="w-10 h-10 glass-gold rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Plane className="w-5 h-5 text-gold" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-charcoal dark:text-white font-medium text-sm">{alert.title}</p>
                                    <p className="text-steel-dark dark:text-steel text-xs">{alert.company}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gold font-mono font-bold text-lg">{alert.score}%</p>
                                    <p className="text-steel-dark dark:text-steel text-xs">{alert.time}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-steel/40" />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>

            <CVUploadModal />
        </div>
    );
}
