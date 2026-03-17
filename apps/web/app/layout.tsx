import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "AeroHire — Executive Career Intelligence",
        template: "%s | AeroHire",
    },
    description:
        "The world's most sophisticated AI-powered job tracking platform. Built for executives who demand results.",
    keywords: ["job search", "AI", "career", "executive", "automation"],
    authors: [{ name: "AeroHire" }],
    openGraph: {
        title: "AeroHire — Executive Career Intelligence",
        description:
            "Automated job search, intelligent matching, and precision document generation.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}
        >
            <body className="bg-[#FAF9F6] text-charcoal dark:bg-charcoal dark:text-white antialiased overflow-x-hidden transition-colors duration-300">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange={false}
                >
                    {/* Ambient background effects */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-navy/20 dark:bg-navy/40 rounded-full blur-3xl opacity-50 dark:opacity-100 transition-opacity" />
                        <div className="absolute top-1/2 left-0 w-72 h-72 bg-steel/5 rounded-full blur-3xl" />
                    </div>
                    <div className="relative z-10">{children}</div>
                </ThemeProvider>
            </body>
        </html>
    );
}
