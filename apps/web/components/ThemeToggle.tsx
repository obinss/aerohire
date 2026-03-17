"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-8 h-8" />;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-steel-dark dark:text-steel hover:text-charcoal dark:hover:text-gold"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </button>
    );
}
