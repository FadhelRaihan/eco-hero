"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CaseTopic = "plastik_kantin" | "alih_fungsi_lahan" | "pencemaran_air";

const QUESTIONS: Record<CaseTopic, string> = {
    plastik_kantin:
        "Jika penjual kantin berhenti memakai plastik, apa yang akan terjadi pada keuntungan mereka? Tapi jika mereka terus memakai plastik, apa yang terjadi pada selokan sekolah kita?",
    alih_fungsi_lahan:
        "Jika lahan hijau diubah menjadi bangunan, apa yang terjadi pada hewan dan tanaman yang tinggal di sana? Tapi jika lahan tidak dibangun, bagaimana masyarakat bisa punya tempat tinggal?",
    pencemaran_air:
        "Jika warga terus membuang sampah ke sungai, apa yang akan terjadi pada ikan dan air minum kita? Tapi mengapa warga sulit berhenti dari kebiasaan ini?",
};

const QUESTION_BOLD: Record<CaseTopic, string> = {
    plastik_kantin: "Jika penjual kantin berhenti memakai plastik,",
    alih_fungsi_lahan: "Jika lahan hijau diubah menjadi bangunan,",
    pencemaran_air: "Jika warga terus membuang sampah ke sungai,",
};

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
    const [answer, setAnswer] = useState("");
    const [error, setError] = useState("");

    const question = QUESTIONS[caseTopic];
    const boldPart = QUESTION_BOLD[caseTopic];
    const restPart = question.replace(boldPart, "");

    const displayValue = isCompleted ? (savedAnswer ?? "✓ Sudah dijawab") : answer;

    function handleLanjut() {
        if (isCompleted) {
            onLanjut();
            return;
        }
        if (answer.trim().length < 10) {
            setError("Jawaban minimal 10 karakter");
            return;
        }
        setError("");
        onSubmit(answer.trim());
        onLanjut();
    }

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 py-6">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#B4FF9F] flex items-center justify-center">
                        <span className="text-[#1A5C0A] font-extrabold text-lg">3</span>
                    </div>
                    <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                        Pertanyaan Pemantik
                    </h2>
                </div>

                {/* Question card — white with green left border */}
                <div className="rounded-2xl p-6 bg-[#F0FFF0] border-2 border-[#D4EFD0]">
                    {/* Question text */}
                    <p className="text-sm text-[#333333] leading-relaxed mb-5">
                        <strong className="font-bold">{boldPart}</strong>
                        {restPart}
                    </p>

                    {/* Textarea */}
                    <textarea
                        value={isCompleted ? "✓ Sudah dijawab sebelumnya" : answer}
                        onChange={(e) => {
                            setAnswer(e.target.value);
                            if (error) setError("");
                        }}
                        disabled={isCompleted}
                        placeholder="Ketik jawabanmu di sini..."
                        rows={8}
                        className={cn(
                            "w-full bg-[#FFFFFF] px-4 py-3 rounded-xl border border-[#D4EFD0] text-sm resize-none",
                            "focus:outline-none focus:border-[#1A5C0A] transition-colors",
                            "placeholder:text-[#333333]/30",
                            isCompleted && "text-[#1A5C0A] border-[#1A5C0A] cursor-not-allowed"
                        )}
                    />
                    {error && (
                        <p className="text-xs text-red-500 mt-2">{error}</p>
                    )}
                </div>
            </div>

            {/* Lanjut button */}
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleLanjut}
                    disabled={!isCompleted && answer.trim().length < 10}
                    className={cn(
                        "flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer",
                        isCompleted || answer.trim().length >= 10
                            ? "bg-[#B4FF9F] text-[#1A5C0A] border border-[#1A5C0A] hover:bg-[#9AEF85] shadow-sm"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Lanjut →
                </button>
            </div>
        </div>
    );
}