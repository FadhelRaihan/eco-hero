"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CaseTopic = "plastik_kantin" | "alih_fungsi_lahan" | "pencemaran_air";

const VIDEO_CONFIG: Record<CaseTopic, { title: string; embedUrl: string }> = {
    plastik_kantin: {
        title: "Plastik di Kantin Sekolah: Masalah Tersembunyi",
        embedUrl: "https://www.youtube.com/embed/TdxzMUz6R0I",
    },
    alih_fungsi_lahan: {
        title: "Lahan Hijau Menghilang: Siapa yang Bertanggung Jawab?",
        embedUrl: "https://www.youtube.com/embed/TdxzMUz6R0I",
    },
    pencemaran_air: {
        title: "Sungai Kita dalam Bahaya: Pencemaran Air",
        embedUrl: "https://www.youtube.com/embed/VIDEO_ID_3",
    },
};

interface Step2VideoProps {
    caseTopic: CaseTopic;
    isCompleted: boolean;
    onComplete: () => void;
    onLanjut: () => void;
}

export default function Step2Video({
    caseTopic,
    isCompleted,
    onComplete,
    onLanjut,
}: Step2VideoProps) {
    const [playing, setPlaying] = useState(true);
    const config = VIDEO_CONFIG[caseTopic];

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 pt-6">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#B4FF9F] flex items-center justify-center">
                        <span className="text-[#1A5C0A] font-extrabold text-lg">2</span>
                    </div>
                    <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                        Tonton Video Animasi
                    </h2>
                </div>

                {/* Video area */}
                <div className="rounded-xl overflow-hidden border border-[#1A5C0A]/50 bg-white">
                    <div className="relative bg-[#1A5C0A] w-full aspect-video h-[200px] sm:h-[280px] flex items-center justify-center rounded-t-xl overflow-hidden">
                        {playing ? (
                            <iframe
                                src={`${config.embedUrl}?autoplay=1&rel=0`}
                                title={config.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media"
                                allowFullScreen
                                className="w-full h-full absolute inset-0"
                            />
                        ) : (
                            <button
                                onClick={() => setPlaying(true)}
                                className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
                            >
                                <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Video info */}
                    <div className="px-5 py-4">
                        <p className="font-bold text-[#333333] text-sm">{config.title}</p>
                        <p className="text-xs text-[#333333]/50 mt-0.5">
                            Animasi edukatif · Selesaikan video untuk lanjut
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                {!isCompleted && playing && (
                    <button
                        onClick={onComplete}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-white border-2 border-[#1A5C0A] text-[#1A5C0A] hover:bg-[#B4FF9F] transition-all active:scale-95 cursor-pointer"
                    >
                        <Check size={16} strokeWidth={3} /> Tandai Sudah Ditonton
                    </button>
                )}
                <button
                    onClick={onLanjut}
                    disabled={!playing && !isCompleted}
                    className={cn(
                        "flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer",
                        playing || isCompleted
                            ? "bg-[#B4FF9F] text-[#1A5C0A] border border-[#1A5C0A] hover:bg-[#9AEF85] shadow-sm"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Lanjut <ArrowRight size={16} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}