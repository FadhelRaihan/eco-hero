"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Check, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseTopic, MISSION_1_DATA } from "@/lib/mission-data";
import Image from "next/image";

interface Step2VideoProps {
    caseTopic: CaseTopic;
    isCompleted: boolean;
    onComplete: () => void;
    onLanjut: () => void;
    onSwitchCase: (topic: CaseTopic) => void;
    selectedLocation: CaseTopic;
}

export default function Step2Video({
    caseTopic,
    onComplete,
    onLanjut,
    onSwitchCase,
    selectedLocation
}: Step2VideoProps) {
    const data = MISSION_1_DATA[caseTopic];
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
    const [currentComicPage, setCurrentComicPage] = useState(0);
    const [videoPlaying, setVideoPlaying] = useState(false);

    // Reset index saat pindah kasus
    const handleSwitch = (topic: CaseTopic) => {
        if (topic === caseTopic) return;
        setCurrentBlockIndex(0);
        setCurrentComicPage(0);
        setVideoPlaying(false);
        onSwitchCase(topic);
    };

    const currentBlock = data.materials[currentBlockIndex];
    const isLastBlock = currentBlockIndex === data.materials.length - 1;

    const handleNext = () => {
        if (isLastBlock) {
            // Hanya trigger complete jika sedang di kasus yang dipilih resmi
            if (caseTopic === selectedLocation) {
                onComplete();
                onLanjut();
            } else {
                // Jika sedang menjelajah, tawari untuk kembali ke kasus asli atau lanjut
                handleSwitch(selectedLocation);
            }
        } else {
            setCurrentBlockIndex((prev) => prev + 1);
            setCurrentComicPage(0);
            setVideoPlaying(false);
        }
    };

    const handleBack = () => {
        if (currentBlockIndex > 0) {
            setCurrentBlockIndex((prev) => prev - 1);
            setCurrentComicPage(0);
            setVideoPlaying(false);
        }
    };

    const handleComicNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentBlock.type === "comic" && currentComicPage < (currentBlock.images?.length || 0) - 1) {
            setCurrentComicPage((prev) => prev + 1);
        }
    };

    const handleComicBack = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentBlock.type === "comic" && currentComicPage > 0) {
            setCurrentComicPage((prev) => prev - 1);
        }
    };

    // Helper to get YouTube ID from URL
    const getYoutubeId = (url: string) => {
        if (url.includes("shorts/")) return url.split("shorts/")[1]?.split("?")[0];
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 pt-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#B4FF9F] flex items-center justify-center">
                            <span className="text-[#1A5C0A] font-extrabold text-lg">2</span>
                        </div>
                        <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                            Pahami Materi
                        </h2>
                    </div>
                    {/* Case Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        {(Object.keys(MISSION_1_DATA) as CaseTopic[]).map((topic) => (
                            <button
                                key={topic}
                                onClick={() => handleSwitch(topic)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5",
                                    caseTopic === topic
                                        ? "bg-white text-[#1A5C0A] shadow-sm ring-1 ring-black/5"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {topic === "sampah" ? "Sampah" : "Kendaraan"}
                                {selectedLocation === topic && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1A5C0A]" title="Kasus Pilihanmu" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {caseTopic !== selectedLocation && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-bold mb-3 animate-in fade-in slide-in-from-top-1">
                        ✨ Kamu sedang menjelajahi kasus lain. Kasus pilihanmu adalah: <span className="underline uppercase">{selectedLocation === "sampah" ? "Sampah" : "Kendaraan"}</span>
                    </div>
                )}

                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden min-h-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-extrabold text-[#1A5C0A] leading-tight shrink-0">
                            {currentBlock.title}
                        </h3>
                        <div className="text-[10px] font-bold text-[#333333]/40 bg-gray-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                            {currentBlockIndex + 1} / {data.materials.length}
                        </div>
                    </div>

                    {/* Rendering berdasarkan tipe materi */}
                    {currentBlock.type === "text" && (
                        <div className="flex-1 bg-[#FFFDF1] p-5 rounded-2xl border-2 border-[#1A5C0A]/10 shadow-sm overflow-hidden flex flex-col">
                            <p className="text-sm sm:text-base text-[#333333] leading-relaxed whitespace-pre-wrap font-medium overflow-y-auto pr-2">
                                {currentBlock.content}
                            </p>
                        </div>
                    )}

                    {currentBlock.type === "video" && (
                        <div className={cn(
                            "rounded-2xl overflow-hidden border-2 border-[#1A5C0A] bg-black relative shadow-lg mx-auto w-full flex-shrink-0",
                            currentBlock.videoUrl?.includes("shorts/") ? "max-w-[320px] aspect-[9/16]" : "aspect-video max-w-4xl"
                        )}>
                            {videoPlaying ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYoutubeId(currentBlock.videoUrl!)}?autoplay=1`}
                                    className="absolute inset-0 w-full h-full"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />
                            ) : (
                                <div 
                                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                                    onClick={() => setVideoPlaying(true)}
                                >
                                    <PlayCircle className="w-16 h-16 text-white group-hover:scale-110 transition-transform shadow-sm rounded-full bg-black/20" />
                                    <p className="text-white font-bold mt-4 text-sm opacity-90 drop-shadow-md">Klik untuk memutar</p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentBlock.type === "comic" && (
                        <div className="flex flex-col gap-3 h-[65vh] min-h-[450px] w-full max-w-3xl mx-auto flex-shrink-0">
                            <div className="relative flex-1 rounded-2xl overflow-hidden border-4 border-[#1A5C0A]/10 bg-[#f8f9fa] shadow-inner">
                                <Image 
                                    src={currentBlock.images![currentComicPage]} 
                                    alt={`Komik Halaman ${currentComicPage + 1}`} 
                                    fill 
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                    className="object-contain transition-all duration-700"
                                    unoptimized
                                    key={`${currentBlockIndex}-${currentComicPage}`}
                                />
                                
                                {/* Overlay Touch Areas */}
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1/4 z-10 cursor-w-resize" 
                                    onClick={handleComicBack}
                                />
                                <div 
                                    className="absolute right-0 top-0 bottom-0 w-1/4 z-10 cursor-e-resize" 
                                    onClick={handleComicNext}
                                />
                            </div>

                            {/* Dedicated Comic Navigation Bar */}
                            <div className="flex flex-col sm:flex-row items-center justify-between bg-[#B4FF9F]/20 p-3 sm:p-2 rounded-2xl border-2 border-[#1A5C0A]/10 shrink-0 gap-3 sm:gap-2">
                                <div className="flex flex-col items-center order-first sm:order-none w-full sm:w-auto px-2">
                                    <span className="text-[10px] font-black text-[#1A5C0A]/60 uppercase tracking-widest mb-1.5">Halaman</span>
                                    <div className="flex flex-wrap justify-center gap-1.5">
                                        {currentBlock.images?.map((_, idx) => (
                                            <div 
                                                key={idx}
                                                className={cn(
                                                    "h-1.5 rounded-full transition-all duration-300",
                                                    idx === currentComicPage ? "w-6 bg-[#1A5C0A]" : "w-1.5 bg-[#1A5C0A]/30"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full sm:w-auto order-last sm:order-none gap-2">
                                    <button 
                                        onClick={handleComicBack}
                                        disabled={currentComicPage === 0}
                                        className="flex-1 sm:flex-none flex justify-center items-center gap-1 px-4 py-2.5 sm:py-2 rounded-xl font-bold text-xs bg-white text-[#1A5C0A] border border-[#1A5C0A]/20 shadow-sm disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                                    >
                                        <ChevronLeft size={16} /> Sebelumnya
                                    </button>

                                    <button 
                                        onClick={handleComicNext}
                                        disabled={currentComicPage === (currentBlock.images?.length || 0) - 1}
                                        className="flex-1 sm:flex-none flex justify-center items-center gap-1 px-4 py-2.5 sm:py-2 rounded-xl font-bold text-xs bg-[#1A5C0A] text-white shadow-sm disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                                    >
                                        Berikutnya <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 pb-2 shrink-0">
                <button
                    onClick={handleBack}
                    disabled={currentBlockIndex === 0}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95",
                        currentBlockIndex > 0
                            ? "bg-white border-2 border-[#333333] text-[#333333] hover:bg-gray-50"
                            : "bg-gray-100 text-gray-400 border-2 border-transparent cursor-not-allowed"
                    )}
                >
                    <ChevronLeft size={18} /> Kembali
                </button>

                <button
                    onClick={handleNext}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md",
                        isLastBlock
                            ? "bg-[#1A5C0A] text-white hover:bg-[#134407]"
                            : "bg-[#B4FF9F] text-[#1A5C0A] border-2 border-[#1A5C0A] hover:bg-[#9AEF85]"
                    )}
                >
                    {isLastBlock ? (
                        <>Selesai & Lanjut <Check size={18} /></>
                    ) : (
                        <>Materi Berikutnya <ChevronRight size={18} /></>
                    )}
                </button>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-2">
                {data.materials.map((_, idx) => (
                    <div 
                        key={idx}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            idx === currentBlockIndex ? "w-6 bg-[#1A5C0A]" : "w-1.5 bg-gray-200"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}