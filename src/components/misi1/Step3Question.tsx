"use client";

import { useState } from "react";
import { Check, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseTopic, MISSION_1_DATA } from "@/lib/mission-data";

interface Step3QuestionProps {
    caseTopic: CaseTopic;
    isCompleted: boolean;
    savedAnswer?: string;
    onSubmit: (answer: string) => void;
    onLanjut: () => void;
}

export default function Step3Question({
    caseTopic,
    isCompleted,
    savedAnswer,
    onSubmit,
    onLanjut,
}: Step3QuestionProps) {
    const data = MISSION_1_DATA[caseTopic];
    const [selectedOption, setSelectedOption] = useState<string>(savedAnswer || "");

    function handleLanjut() {
        if (isCompleted) {
            onLanjut();
            return;
        }
        if (selectedOption) {
            onSubmit(selectedOption);
            onLanjut();
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="py-4">
                {/* Header Tahap */}
                <div className="flex items-center gap-3 mb-5 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#B4FF9F] flex items-center justify-center">
                        <span className="text-[#1A5C0A] font-extrabold text-lg">3</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-[#1A5C0A] uppercase tracking-wider leading-none mb-1">
                            Refleksi Kritis
                        </h2>
                        <p className="text-[10px] font-bold text-[#333333]/40 uppercase tracking-widest">
                            Tentukan Sikapmu
                        </p>
                    </div>
                </div>

                {/* Kartu Pertanyaan */}
                <div className="rounded-3xl p-6 sm:p-10 bg-white border-2 border-[#1A5C0A]/10 shadow-xl relative overflow-hidden">
                    {/* Dekorasi Ikon */}
                    <HelpCircle className="absolute -top-6 -right-6 w-32 h-32 text-[#B4FF9F]/20 -rotate-12" />

                    <div className="relative z-10">
                        <h3 className="text-lg sm:text-xl font-bold text-[#333333] leading-relaxed mb-10 text-center sm:text-left">
                            {data.question.text}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.question.options.map((option) => {
                                const isSelected = selectedOption === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => !isCompleted && setSelectedOption(option.value)}
                                        disabled={isCompleted}
                                        className={cn(
                                            "group p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden",
                                            isSelected
                                                ? "border-[#1A5C0A] bg-[#B4FF9F]/10 shadow-[0_0_20px_rgba(180,255,159,0.3)]"
                                                : "border-gray-100 bg-gray-50 hover:border-[#1A5C0A]/30 hover:bg-white",
                                            isCompleted && !isSelected && "opacity-40 grayscale-[0.5]"
                                        )}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <span className={cn(
                                                "font-black text-base transition-colors",
                                                isSelected ? "text-[#1A5C0A]" : "text-[#333333]"
                                            )}>
                                                {option.label}
                                            </span>

                                            <div className={cn(
                                                "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                                isSelected
                                                    ? "bg-[#1A5C0A] border-[#1A5C0A] scale-110"
                                                    : "bg-white border-gray-300 group-hover:border-[#1A5C0A]"
                                            )}>
                                                {isSelected && <Check size={16} strokeWidth={4} className="text-white" />}
                                            </div>
                                        </div>

                                        {/* Efek Hover Background */}
                                        {!isCompleted && !isSelected && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#B4FF9F]/0 to-[#B4FF9F]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {isCompleted && (
                            <div className="mt-10 flex items-center justify-center gap-2 py-3 px-6 bg-[#B4FF9F]/20 rounded-2xl border border-[#1A5C0A]/10 animate-in fade-in zoom-in duration-500">
                                <div className="w-5 h-5 rounded-full bg-[#1A5C0A] flex items-center justify-center">
                                    <Check size={12} className="text-white" strokeWidth={4} />
                                </div>
                                <span className="text-xs font-black text-[#1A5C0A] uppercase tracking-widest">
                                    Pilihanmu telah tersimpan
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-center sm:justify-end">
                <button
                    onClick={handleLanjut}
                    disabled={!selectedOption}
                    className={cn(
                        "group flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300",
                        selectedOption
                            ? "bg-[#1A5C0A] text-[#B4FF9F] hover:bg-[#134407] cursor-pointer"
                            : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    )}
                >
                    {isCompleted ? "Lanjut Ke Forum" : "Simpan & Lanjut"}
                    <ArrowRight size={20} className={cn("transition-transform group-hover:translate-x-1", !selectedOption && "opacity-0")} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}