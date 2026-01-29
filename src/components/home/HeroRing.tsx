import { useEffect, useState } from 'react';
import { clsx } from "clsx";

export default function HeroRing() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // If preferred reduced motion, render static ring
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return (
            <div className="relative w-[600px] h-[600px] rounded-full border border-primary/20 bg-primary/5 blur-3xl"></div>
        );
    }

    return (
        <div className={clsx("relative w-[800px] h-[800px] flex items-center justify-center transition-opacity duration-1000", mounted ? "opacity-100" : "opacity-0")}>
            {/* Core Glow */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow"></div>

            {/* Orbit Rings (SVG for performance) */}
            <svg
                viewBox="0 0 800 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full animate-spin-slow-reverse opacity-30"
            >
                <circle cx="400" cy="400" r="300" stroke="url(#gradient1)" strokeWidth="1" strokeDasharray="10 20" strokeLinecap="round" />
                <circle cx="400" cy="400" r="380" stroke="url(#gradient1)" strokeWidth="0.5" strokeDasharray="4 30" strokeOpacity="0.5" />
                <defs>
                    <linearGradient id="gradient1" x1="0" y1="0" x2="800" y2="800" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0A84FF" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#0A84FF" />
                        <stop offset="1" stopColor="#0A84FF" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Secondary Ring */}
            <svg
                viewBox="0 0 800 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full animate-spin-slow opacity-40"
            >
                <circle cx="400" cy="400" r="250" stroke="#00C2FF" strokeWidth="1" strokeDasharray="80 120" strokeLinecap="round" />
            </svg>

            {/* Floating particles (simulated via CSS) */}
            <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute top-[20%] left-[50%] w-2 h-2 bg-primary rounded-full blur-[1px] opacity-60"></div>
                <div className="absolute top-[60%] left-[20%] w-1.5 h-1.5 bg-blue-300 rounded-full blur-[1px] opacity-40"></div>
                <div className="absolute top-[80%] right-[30%] w-1 h-1 bg-primary rounded-full blur-[0.5px] opacity-50"></div>
            </div>
        </div>
    );
}
