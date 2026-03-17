import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                charcoal: {
                    DEFAULT: "#0A0A0A",
                    50: "#1a1a1a",
                    100: "#141414",
                    200: "#0f0f0f",
                    300: "#0A0A0A",
                },
                gold: {
                    DEFAULT: "#D4AF37",
                    light: "#E8C84B",
                    dark: "#B8952E",
                    muted: "#9A7B2A",
                },
                steel: {
                    DEFAULT: "#8D96A8",
                    light: "#A8B0C0",
                    dark: "#6B7485",
                },
                navy: {
                    DEFAULT: "#1B263B",
                    light: "#243450",
                    dark: "#111929",
                },
                glass: {
                    white: "rgba(255, 255, 255, 0.05)",
                    "white-10": "rgba(255, 255, 255, 0.10)",
                    "white-20": "rgba(255, 255, 255, 0.20)",
                    gold: "rgba(212, 175, 55, 0.10)",
                    "gold-20": "rgba(212, 175, 55, 0.20)",
                },
            },
            fontFamily: {
                display: ["Playfair Display", "Georgia", "serif"],
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "Fira Code", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "gold-gradient":
                    "linear-gradient(135deg, #D4AF37 0%, #E8C84B 50%, #B8952E 100%)",
                "dark-gradient":
                    "linear-gradient(180deg, #0A0A0A 0%, #0D0D14 50%, #0A0A0A 100%)",
                "metallic-gradient":
                    "linear-gradient(135deg, #1a1a20 0%, #0D0F16 50%, #0A0A0A 100%)",
                "navy-gradient":
                    "linear-gradient(135deg, #1B263B 0%, #243450 100%)",
            },
            boxShadow: {
                gold: "0 0 30px rgba(212, 175, 55, 0.15), 0 4px 16px rgba(0, 0, 0, 0.6)",
                "gold-lg":
                    "0 0 60px rgba(212, 175, 55, 0.25), 0 8px 32px rgba(0, 0, 0, 0.8)",
                glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                "card-hover":
                    "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.1)",
                glow: "0 0 20px rgba(212, 175, 55, 0.3)",
            },
            borderColor: {
                glass: "rgba(255, 255, 255, 0.08)",
                "glass-gold": "rgba(212, 175, 55, 0.3)",
                "gold-subtle": "rgba(212, 175, 55, 0.15)",
            },
            backdropBlur: {
                xs: "2px",
                glass: "12px",
            },
            animation: {
                "radar-spin": "radar-spin 2s linear infinite",
                "radar-ping": "radar-ping 1.5s ease-out infinite",
                "fade-in-up": "fade-in-up 0.6s ease-out forwards",
                "fade-in": "fade-in 0.4s ease-out forwards",
                "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                shimmer: "shimmer 2s linear infinite",
                "pulse-gold": "pulse-gold 2s ease-in-out infinite",
                float: "float 6s ease-in-out infinite",
            },
            keyframes: {
                "radar-spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
                "radar-ping": {
                    "0%, 100%": { opacity: "1", transform: "scale(1)" },
                    "50%": { opacity: "0.3", transform: "scale(1.2)" },
                },
                "fade-in-up": {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "slide-in-right": {
                    "0%": { transform: "translateX(100%)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                "pulse-gold": {
                    "0%, 100%": { boxShadow: "0 0 10px rgba(212, 175, 55, 0.2)" },
                    "50%": { boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
            spacing: {
                "18": "4.5rem",
                "88": "22rem",
                "112": "28rem",
                "128": "32rem",
            },
            zIndex: {
                "60": "60",
                "70": "70",
                "80": "80",
                "90": "90",
                "100": "100",
            },
        },
    },
    plugins: [],
};

export default config;
