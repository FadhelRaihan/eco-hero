"use client";

import { useState, useEffect, use, useCallback } from "react";
import { 
    FileText, 
    Plus, 
    Trash2, 
    Save, 
    ChevronLeft, 
    Loader2, 
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Question {
    id?: string;
    question_text: string;
    options: string[];
    correct_answer: string;
}

export default function GlobalTestEditorPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = use(params);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);

    const fetchGlobalTest = useCallback(async () => {
        setLoading(true);
        try {
            // Kita akan memanggil API khusus untuk mengambil soal global
            const res = await fetch(`/api/admin/tests/global?type=${type}`);
            const result = await res.json();
            
            if (res.ok) {
                setQuestions(result.questions || []);
            } else {
                toast.error("Gagal memuat data soal");
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchGlobalTest();
    }, [fetchGlobalTest]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question_text: "",
                options: ["", "", "", ""],
                correct_answer: "A"
            }
        ]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: string, value: string | { optIndex: number; text: string }) => {
        const newQuestions = [...questions];
        if (field === "option" && typeof value === "object") {
            const { optIndex, text } = value;
            newQuestions[index].options[optIndex] = text;
        } else if (typeof value === "string") {
            if (field === "question_text") {
                newQuestions[index].question_text = value;
            } else if (field === "correct_answer") {
                newQuestions[index].correct_answer = value;
            }
        }
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        // Validasi Sederhana
        const isValid = questions.every(q => 
            q.question_text.trim() !== "" && 
            q.options.every(opt => opt.trim() !== "")
        );

        if (!isValid) {
            toast.error("Mohon lengkapi semua soal dan pilihan jawaban");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/tests/global`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    questions
                })
            });

            if (res.ok) {
                toast.success(`Berhasil menyimpan soal ${type}`);
                fetchGlobalTest();
            } else {
                const err = await res.json();
                toast.error(err.error || "Gagal menyimpan soal");
            }
        } catch {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin w-10 h-10 text-blue-900" />
            </div>
        );
    }

    return (
        <div className="mx-auto px-8 py-10 space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/admin/tes" className="inline-flex items-center gap-2 text-blue-900 hover:gap-3 transition-all font-bold text-xs uppercase tracking-widest mb-4">
                        <ChevronLeft size={16} /> Kembali ke Manajemen Tes
                    </Link>
                    <h1 className="text-3xl font-black text-[#333333]">
                        Editor Soal {type === "pretest" ? "Pre-test" : "Post-test"} Global
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">Satu set soal ini akan dikerjakan oleh seluruh siswa di aplikasi Eco Hero.</p>
                </div>

                <div className="flex gap-4">
                    <Button 
                        onClick={addQuestion}
                        variant="outline"
                        className="h-14 px-8 border-2 border-blue-900/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50"
                    >
                        <Plus className="mr-2" size={18} /> Tambah Soal
                    </Button>
                    <Button 
                        onClick={handleSave}
                        disabled={saving}
                        className="h-14 px-10 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                        Simpan Semua
                    </Button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-8">
                {questions.length === 0 ? (
                    <div className="bg-white rounded-[40px] border-2 border-dashed border-blue-900/10 p-20 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText size={40} className="text-blue-900/30" />
                        </div>
                        <h3 className="text-xl font-black text-[#333333] mb-2">Belum ada soal</h3>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">Klik tombol Tambah Soal untuk mulai membuat instrumen tes global.</p>
                    </div>
                ) : (
                    questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-[40px] border border-blue-900/5 p-10 shadow-xl shadow-blue-900/5 relative group animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${qIndex * 50}ms` }}>
                            <button 
                                onClick={() => removeQuestion(qIndex)}
                                className="absolute top-8 right-8 p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Question Text */}
                                <div className="lg:col-span-7 space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-black text-xs">
                                            {qIndex + 1}
                                        </div>
                                        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Pertanyaan</span>
                                    </div>
                                    <textarea 
                                        value={q.question_text}
                                        onChange={(e) => updateQuestion(qIndex, "question_text", e.target.value)}
                                        placeholder="Masukkan teks pertanyaan di sini..."
                                        className="w-full h-32 bg-blue-50/30 rounded-3xl p-6 text-sm font-medium border-2 border-transparent focus:border-blue-900/10 focus:bg-white outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Options */}
                                <div className="lg:col-span-5 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 size={16} className="text-blue-900" />
                                        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Pilihan & Kunci Jawaban</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {['A', 'B', 'C', 'D'].map((label, optIndex) => (
                                            <div key={label} className="flex gap-3">
                                                <button 
                                                    onClick={() => updateQuestion(qIndex, "correct_answer", label)}
                                                    className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all",
                                                        q.correct_answer === label 
                                                            ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20" 
                                                            : "bg-blue-50 text-blue-900 hover:bg-blue-100"
                                                    )}
                                                >
                                                    {label}
                                                </button>
                                                <input 
                                                    type="text"
                                                    value={q.options[optIndex]}
                                                    onChange={(e) => updateQuestion(qIndex, "option", { optIndex, text: e.target.value })}
                                                    placeholder={`Opsi ${label}...`}
                                                    className="flex-1 bg-gray-50 rounded-xl px-4 text-xs font-bold border-2 border-transparent focus:border-blue-900/5 outline-none transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Warning Info */}
            <div className="bg-amber-50 rounded-3xl p-8 flex gap-4 border border-amber-200/50 max-w-4xl">
                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                <div>
                    <p className="text-amber-900 font-black text-sm mb-1 uppercase tracking-wider">Penting!</p>
                    <p className="text-amber-800/70 text-xs font-medium leading-relaxed">
                        Pastikan semua pertanyaan memiliki teks dan pilihan jawaban yang lengkap sebelum disimpan. Gunakan tombol lingkaran huruf untuk menandai kunci jawaban yang benar.
                    </p>
                </div>
            </div>
        </div>
    );
}
