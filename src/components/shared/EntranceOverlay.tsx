"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EntranceOverlayProps {
    /** Variant warna — sesuaikan dengan halaman login */
    variant?: "siswa" | "guru";
}

export default function EntranceOverlay({ variant = "siswa" }: EntranceOverlayProps) {
    const [visible, setVisible] = useState(true);
    const [fading, setFading] = useState(false);

    // Tutup overlay dengan animasi fade-out
    function handleDismiss() {
        setFading(true);
        setTimeout(() => setVisible(false), 500);
    }

    // Keyboard accessibility: tutup saat tekan Enter / Space
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Enter" || e.key === " ") handleDismiss();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    if (!visible) return null;

    const isGuru = variant === "guru";

    return (
        <div
            onClick={handleDismiss}
            role="button"
            tabIndex={0}
            aria-label="Klik untuk masuk"
            className={cn(
                "fixed inset-0 z-[999] flex flex-col items-center justify-center cursor-pointer select-none",
                "transition-opacity duration-500",
                fading ? "opacity-0" : "opacity-100",
                isGuru
                    ? "bg-[#1A5C0A]"
                    : "bg-[#1A5C0A]"
            )}
        >
            {/* Dekorasi lingkaran background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={cn(
                    "absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10",
                    isGuru ? "bg-white" : "bg-[#B4FF9F]"
                )} />
                <div className={cn(
                    "absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10",
                    isGuru ? "bg-white" : "bg-[#B4FF9F]"
                )} />
                <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-white/5" />
            </div>

            {/* Konten utama */}
            <div className="relative flex flex-col items-center gap-6 px-8 text-center">
                {/* Logo / Icon */}
                <div className="w-24 h-24 rounded-3xl bg-[#B4FF9F] flex items-center justify-center shadow-2xl shadow-black/20 animate-[bounce_2s_ease-in-out_infinite]">
                    <span className="text-[#1A5C0A] text-5xl font-extrabold leading-none">E</span>
                </div>

                {/* Judul */}
                <div className="space-y-1">
                    <h1 className="text-5xl font-extrabold text-white tracking-tight">
                        Eco Hero
                    </h1>
                    <p className="text-[#B4FF9F] font-semibold text-base tracking-wide">
                        {isGuru
                            ? "Platform Monitoring Guru"
                            : "Platform Belajar Lingkungan Hidup"
                        }
                    </p>
                </div>

                {/* Tagline */}
                <p className="text-white/60 text-sm max-w-xs leading-relaxed">
                    {isGuru
                        ? "Pantau perkembangan siswa, kelola kelas, dan lihat hasil misi mereka secara real-time."
                        : "Jadilah pahlawan lingkungan! Selesaikan misi, kumpulkan lencana, dan buat perubahan nyata."
                    }
                </p>

                {/* Tap to enter */}
                <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center animate-[ping_1.5s_ease-in-out_infinite]">
                        <div className="w-6 h-6 rounded-full bg-white/40" />
                    </div>
                    <p className="text-white/50 text-xs font-medium tracking-widest uppercase mt-1">
                        Ketuk untuk mulai
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-white/30 text-[10px] tracking-wider uppercase">
                © 2025 Eco Hero · Semua hak dilindungi
            </div>
        </div>
    );
}
