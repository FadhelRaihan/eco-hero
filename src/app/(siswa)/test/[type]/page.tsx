"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_TEST_QUESTIONS } from "@/lib/demo/mockData";

interface Question {
    id: string;
    question_text: string;
    options: string[];
    correct_answer: number;
}

export default function TestPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const type = params.type as "pretest" | "posttest";

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        if (!user) return;

        const isDemoMode = typeof window !== "undefined"
            ? localStorage.getItem("eco_demo_mode") === "true"
            : false;

        // ── DEMO MODE ──────────────────────────────────────────
        if (isDemoMode) {
            setQuestions(DEMO_TEST_QUESTIONS as any);
            setLoading(false);
            return;
        }
        // ── END DEMO ───────────────────────────────────────────

        async function fetchTest() {
            try {
                const res = await fetch(`/api/tests?classId=${user?.class_id}&type=${type}`);
                const result = await res.json();
                
                if (res.ok && result.data?.questions) {
                    setQuestions(result.data.questions);
                } else {
                    setQuestions([
                        {
                            id: "q1",
                            question_text: "Apa yang dimaksud dengan ekosistem?",
                            options: [
                                "Hubungan timbal balik antara makhluk hidup dengan lingkungannya",
                                "Kumpulan hewan di hutan",
                                "Tempat tinggal manusia",
                                "Proses fotosintesis tumbuhan"
                            ],
                            correct_answer: 0
                        },
                        {
                            id: "q2",
                            question_text: "Manakah yang merupakan sampah anorganik?",
                            options: ["Daun kering", "Sisa makanan", "Botol plastik", "Kulit buah"],
                            correct_answer: 2
                        }
                    ]);
                }
            } catch (err) {
                console.error("Fetch test error:", err);
                setError("Gagal memuat soal. Silakan coba lagi.");
            } finally {
                setLoading(false);
            }
        }

        fetchTest();
    }, [user, type]);

    const handleSelect = (optionIndex: number) => {
        const questionId = questions[currentQuestionIndex].id;
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            setError("Harap jawab semua pertanyaan.");
            return;
        }

        setSubmitting(true);
        setError("");

        const isDemoMode = typeof window !== "undefined"
            ? localStorage.getItem("eco_demo_mode") === "true"
            : false;

        try {
            // ── DEMO MODE ──────────────────────────────────────
            if (isDemoMode) {
                await new Promise((r) => setTimeout(r, 900));
                // Hitung skor berdasarkan jawaban mock
                const correct = (questions as any[]).filter((q) => {
                    const studentAns = answers[q.id];
                    return String(studentAns) === String(q.correct_answer);
                }).length;
                const demoScore = Math.round((correct / questions.length) * 100);
                setScore(demoScore);
                setDone(true);
                // Arahkan ke dashboard setelah beberapa saat agar user lihat sertifikat muncul
                if (type === "posttest") {
                    setTimeout(() => router.push("/dashboard"), 3500);
                }
                return;
            }
            // ── END DEMO ───────────────────────────────────────

            const res = await fetch("/api/tests/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: user?.id,
                    type,
                    answers
                })
            });

            if (res.ok) {
                const data = await res.json();
                setScore(data.score);
                setDone(true);
            } else {
                const data = await res.json();
                setError(data.error || "Gagal mengirim jawaban.");
            }
        } catch (err) {
            setError("Terjadi kesalahan koneksi.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F8FFF5]">
                <Loader2 className="w-10 h-10 text-[#1A5C0A] animate-spin mb-4" />
                <p className="text-[#1A5C0A] font-bold">Memuat {type === "pretest" ? "Pemanasan" : "Bos Akhir"}...</p>
            </div>
        );
    }

    if (done) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F8FFF5] px-6 text-center overflow-hidden">
                <div className="w-24 h-24 bg-[#B4FF9F] rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle2 className="w-12 h-12 text-[#1A5C0A]" />
                </div>
                
                <h1 className="text-3xl font-black text-[#1A5C0A] mb-2">
                    {type === "pretest" ? "Pemanasan Selesai!" : "Bos Akhir Selesai!"}
                </h1>
                
                <p className="text-gray-600 mb-8 max-w-xs">
                    {type === "pretest" 
                        ? "Hebat! Kamu sudah menyelesaikan evaluasi awal. Sekarang kamu siap untuk memulai petualanganmu." 
                        : "Luar biasa! Kamu telah menyelesaikan seluruh rangkaian pembelajaran Eco Hero."}
                </p>

                {/* Score Card */}
                <div className="bg-white p-8 rounded-3xl border-2 border-[#1A5C0A]/10 shadow-xl mb-10 w-full max-w-[280px]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nilai Kamu</p>
                    <div className="text-6xl font-black text-[#1A5C0A] leading-none mb-2">
                        {score !== null ? Math.round(score) : 0}
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div 
                            className="h-full bg-[#1A5C0A] transition-all duration-1000" 
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500">
                        {score && score >= 70 ? "Kinerja Bagus!" : "Terus Semangat!"}
                    </p>
                </div>

                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 px-10 py-4 bg-[#1A5C0A] text-white rounded-2xl font-black text-sm hover:bg-[#134407] transition-all shadow-lg active:scale-95"
                >
                    Kembali ke Dashboard <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#F8FFF5] px-6 text-center">
                <div className="w-20 h-20 bg-[#B4FF9F] rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-[#1A5C0A]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <h2 className="text-xl font-black text-[#1A5C0A] mb-2">
                    Soal Belum Tersedia
                </h2>
                <p className="text-sm text-gray-500 mb-8 max-w-xs">
                    {type === "pretest"
                        ? "Guru belum menambahkan soal Pemanasan untuk kelasmu."
                        : "Guru belum menambahkan soal Bos Akhir untuk kelasmu."}
                    {" "}Hubungi gurumu untuk info lebih lanjut.
                </p>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 px-8 py-3 bg-[#1A5C0A] text-white rounded-2xl font-black text-sm hover:bg-[#134407] transition-all shadow-lg"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestion.id];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="flex flex-col h-screen bg-[#F8FFF5] overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 bg-white border-b border-[#1A5C0A]/10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-black text-[#1A5C0A] uppercase tracking-tight">
                        {type === "pretest" ? "Pemanasan" : "Bos Akhir"}
                    </h1>
                    <span className="text-xs font-bold text-[#1A5C0A]/60 bg-[#B4FF9F]/30 px-3 py-1 rounded-full">
                        Soal {currentQuestionIndex + 1} dari {questions.length}
                    </span>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#1A5C0A] transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-0">
                <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-[#1A5C0A]/10 p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-[#333333] mb-8 leading-relaxed">
                        {currentQuestion.question_text}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={cn(
                                    "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                                    selectedAnswer === idx
                                        ? "bg-[#B4FF9F] border-[#1A5C0A] text-[#1A5C0A] shadow-md"
                                        : "bg-white border-gray-100 text-gray-700 hover:border-[#1A5C0A]/30"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0",
                                    selectedAnswer === idx
                                        ? "bg-[#1A5C0A] border-[#1A5C0A] text-white"
                                        : "bg-gray-50 border-gray-200 text-gray-400 group-hover:border-[#1A5C0A]/30 group-hover:text-[#1A5C0A]"
                                )}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="font-semibold text-sm leading-snug">
                                    {option}
                                </span>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="p-6 bg-white border-t border-[#1A5C0A]/10 flex items-center justify-between gap-4">
                <button
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all",
                        currentQuestionIndex > 0
                            ? "text-[#333333] bg-gray-50 hover:bg-gray-100"
                            : "text-gray-300 cursor-not-allowed"
                    )}
                >
                    <ArrowLeft size={18} /> Kembali
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg",
                            submitting 
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-[#1A5C0A] text-white hover:bg-[#134407] active:scale-95"
                        )}
                    >
                        {submitting ? (
                            <>Mengirim... <Loader2 className="animate-spin w-4 h-4" /></>
                        ) : (
                            <>Kirim Jawaban <CheckCircle2 size={18} /></>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={selectedAnswer === undefined}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-md",
                            selectedAnswer !== undefined
                                ? "bg-[#B4FF9F] text-[#1A5C0A] border-2 border-[#1A5C0A] hover:bg-[#9AEF85] active:scale-95"
                                : "bg-gray-100 text-gray-400 border-2 border-transparent cursor-not-allowed"
                        )}
                    >
                        Soal Berikutnya <ArrowRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
