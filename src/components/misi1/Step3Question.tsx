"use client";

import { useState } from "react";
import { Check, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseTopic, MISSION_1_DATA } from "@/lib/mission-data";

interface Step3QuestionProps {
    caseTopic: CaseTopic;
    isCompleted: boolean;
    savedAnswers?: Record<string, string>; // Ubah ke plural
    onSubmit: (answer: string) => void;
    onLanjut: () => void;
    onSwitchCase: (topic: CaseTopic) => void;
    selectedLocation: CaseTopic;
}

export default function Step3Question({
    caseTopic,
    isCompleted,
    savedAnswers,
    onSubmit,
    onLanjut,
    onSwitchCase,
    selectedLocation
}: Step3QuestionProps) {
    const data = MISSION_1_DATA[caseTopic];
    // Ambil jawaban dari state plural berdasarkan kasus saat ini
    const [selectedOption, setSelectedOption] = useState<string>(savedAnswers?.[caseTopic] || "");


    function handleLanjut() {
        if (!selectedOption) return;

        onSubmit(selectedOption);

        if (caseTopic !== selectedLocation) {
            // Jika ini kasus eksplorasi, biarkan siswa tetap di sini atau lanjut eksplorasi lain
            // Untuk flow yang mulus, kita biarkan mereka tetap di sini
            return;
        }

        onLanjut();
    }

    return (
        <div className="flex flex-col">
            <div className="py-4">
                {/* Case Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 mb-6 w-full sm:w-fit">
                    {(Object.keys(MISSION_1_DATA) as CaseTopic[]).map((topic) => (
                        <button
                            key={topic}
                            onClick={() => onSwitchCase(topic)}
                            className={cn(
                                "flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                caseTopic === topic
                                    ? "bg-white text-[#1A5C0A] shadow-sm ring-1 ring-black/5"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {topic === "sampah" ? "Sampah" : "Kendaraan"}
                            {selectedLocation === topic && (
                                <div className="w-2 h-2 rounded-full bg-[#1A5C0A]" title="Kasus Pilihanmu" />
                            )}
                        </button>
                    ))}
                </div>

                {caseTopic !== selectedLocation && (
                    <div className="bg-[#B4FF9F]/10 border-2 border-[#1A5C0A]/20 text-[#1A5C0A] px-4 py-3 rounded-2xl text-xs font-bold mb-6 animate-in fade-in slide-in-from-top-1 flex items-center gap-3">
                        <HelpCircle size={18} className="shrink-0" />
                        <p>
                            Kamu sedang mengeksplorasi kasus tambahan. Berikan opinimu di sini sebelum kembali ke kasus utama: <span className="underline uppercase">{selectedLocation === "sampah" ? "Sampah" : "Kendaraan"}</span>
                        </p>
                    </div>
                )}

                {/* Kartu Pertanyaan */}
                <div className={cn(
                    "rounded-3xl p-6 sm:p-10 bg-white border-2 border-[#1A5C0A]/10 shadow-xl relative overflow-hidden transition-all duration-300",
                )}>
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
                                        onClick={() => setSelectedOption(option.value)}
                                        className={cn(
                                            "group p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden",
                                            isSelected
                                                ? "border-[#1A5C0A] bg-[#B4FF9F]/10 shadow-[0_0_20px_rgba(180,255,159,0.3)]"
                                                : "border-gray-100 bg-gray-50 hover:border-[#1A5C0A]/30 hover:bg-white",
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
                                        {!isSelected && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#B4FF9F]/0 to-[#B4FF9F]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {isCompleted && caseTopic === selectedLocation && (
                            <div className="mt-10 flex items-center justify-center gap-2 py-3 px-6 bg-[#B4FF9F]/20 rounded-2xl border border-[#1A5C0A]/10 animate-in fade-in zoom-in duration-500">
                                <div className="w-5 h-5 rounded-full bg-[#1A5C0A] flex items-center justify-center">
                                    <Check size={12} className="text-white" strokeWidth={4} />
                                </div>
                                <span className="text-xs font-black text-[#1A5C0A] uppercase tracking-widest">
                                    Pilihan utamamu telah tersimpan
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3">
                {caseTopic !== selectedLocation && (
                    <button
                        onClick={() => onSwitchCase(selectedLocation)}
                        className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                    >
                        Kembali ke Kasus Utama
                    </button>
                )}
                
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
                    {caseTopic !== selectedLocation 
                        ? "Simpan Opini Eksplorasi" 
                        : isCompleted ? "Lanjut Ke Forum" : "Simpan & Lanjut"}
                    <ArrowRight size={20} className={cn("transition-transform group-hover:translate-x-1", !selectedOption && "opacity-0")} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}