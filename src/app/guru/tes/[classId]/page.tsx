"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Loader2, 
    Plus, 
    Trash2, 
    Save, 
    ArrowLeft, 
    ClipboardCheck, 
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    GripVertical,
    FileText,
    BrainCircuit,
    ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Question {
    id?: string;
    question_text: string;
    options: string[];
    correct_answer: number;
    order_index: number;
}

export default function ClassTestConfigPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.classId as string;
    
    const [activeTab, setActiveTab] = useState<"pretest" | "posttest">("pretest");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [className, setClassName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchClassAndQuestions();
    }, [classId, activeTab]);

    async function fetchClassAndQuestions() {
        setLoading(true);
        try {
            // Fetch class info
            const classRes = await fetch(`/api/classes/${classId}`);
            const classData = await classRes.json();
            if (classRes.ok) setClassName(classData.data?.name);

            // Fetch questions
            const res = await fetch(`/api/tests?classId=${classId}&type=${activeTab}`);
            const result = await res.json();
            
            if (res.ok && result.data?.questions) {
                setQuestions(result.data.questions);
            } else {
                setQuestions([]);
            }
        } catch (err) {
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    }

    const addQuestion = () => {
        const newQ: Question = {
            question_text: "",
            options: ["", "", "", ""],
            correct_answer: 0,
            order_index: questions.length
        };
        setQuestions([...questions, newQ]);
        toast.success("Soal ditambahkan", {
            description: "Silakan isi detail pertanyaan baru"
        });
    };

    const removeQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);
        toast.info("Soal dihapus");
    };

    const updateQuestionText = (index: number, text: string) => {
        const updated = [...questions];
        updated[index].question_text = text;
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, text: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = text;
        setQuestions(updated);
    };

    const setCorrectAnswer = (qIndex: number, oIndex: number) => {
        const updated = [...questions];
        updated[qIndex].correct_answer = oIndex;
        setQuestions(updated);
    };

    const handleSave = async () => {
        // Validasi
        for (const q of questions) {
            if (!q.question_text.trim()) {
                toast.error("Validasi Gagal", { description: "Semua teks soal harus diisi" });
                return;
            }
            if (q.options.some(opt => !opt.trim())) {
                toast.error("Validasi Gagal", { description: "Semua pilihan jawaban harus diisi" });
                return;
            }
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/tests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    class_id: classId,
                    type: activeTab,
                    title: activeTab === "pretest" ? `Pemanasan ${className}` : `Bos Akhir ${className}`,
                    questions
                })
            });

            if (res.ok) {
                toast.success("Perubahan Disimpan!", {
                    description: `Soal ${activeTab === "pretest" ? "Pemanasan" : "Bos Akhir"} berhasil diperbarui.`
                });
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal menyimpan");
            }
        } catch (err) {
            toast.error("Kesalahan koneksi");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto px-8 py-6 space-y-8 animate-in fade-in duration-500 h-screen flex flex-col">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl bg-white shadow-sm border border-[#1A5C0A]/10 hover:bg-[#B4FF9F]/20 text-[#1A5C0A] cursor-pointer"
                        onClick={() => router.push("/guru/tes")}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-[#333333] tracking-tight">
                            Kelola Soal: <span className="text-[#1A5C0A]">{className}</span>
                        </h1>
                        <p className="text-xs text-[#333333]/60 font-bold uppercase tracking-widest">
                            Konfigurasi Instrumen {activeTab === "pretest" ? "Pemanasan" : "Bos Akhir"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={addQuestion}
                        variant="outline"
                        className="rounded-2xl border-2 border-[#1A5C0A]/10 hover:border-[#1A5C0A] font-black text-[10px] uppercase tracking-widest h-12 px-6 shadow-sm bg-white text-[#1A5C0A] cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Tambah Soal
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-2xl border-none bg-[#1A5C0A] hover:bg-[#1A5C0A]/90 text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 shadow-xl shadow-[#1A5C0A]/20 cursor-pointer"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Simpan Perubahan
                    </Button>
                </div>
            </div>

            {/* Content Tabs Wrapper */}
            <Tabs 
                value={activeTab} 
                onValueChange={(val) => setActiveTab(val as "pretest" | "posttest")}
                className="flex-1 flex flex-col gap-6 min-h-0 overflow-hidden"
            >
                {/* Custom Styled Tabs List */}
                <TabsList className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1A5C0A]/10 w-fit shrink-0 h-auto">
                    <TabsTrigger
                        value="pretest"
                        className="flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest data-[state=active]:bg-[#1A5C0A] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#333333]/40 hover:text-[#1A5C0A] hover:bg-[#B4FF9F]/20"
                    >
                        <ClipboardCheck size={16} /> Pemanasan
                    </TabsTrigger>
                    <TabsTrigger
                        value="posttest"
                        className="flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest data-[state=active]:bg-[#1A5C0A] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#333333]/40 hover:text-[#1A5C0A] hover:bg-[#B4FF9F]/20"
                    >
                        <GraduationCap size={16} /> Bos Akhir
                    </TabsTrigger>
                </TabsList>

                {/* Main List Area in TabsContent */}
                <TabsContent value={activeTab} className="flex-1 overflow-hidden m-0">
                    <div className="h-full overflow-y-auto pr-4 -mr-4 custom-scrollbar space-y-8 pb-32">
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center bg-white/50 rounded-[3rem] border-2 border-dashed border-[#1A5C0A]/10">
                                <Loader2 className="animate-spin w-10 h-10 text-[#1A5C0A] mb-4" />
                                <p className="text-[#1A5C0A]/40 font-black uppercase tracking-widest text-[10px]">Sinkronisasi Bank Soal...</p>
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center bg-white/50 rounded-[3rem] border-2 border-dashed border-[#1A5C0A]/10 text-center px-12">
                                <div className="w-20 h-20 bg-[#B4FF9F]/20 rounded-[2rem] flex items-center justify-center mb-6">
                                    <BrainCircuit size={40} className="text-[#1A5C0A]" />
                                </div>
                                <h3 className="text-xl font-black text-[#333333] mb-2 uppercase tracking-tight">Belum Ada Soal</h3>
                                <p className="text-sm text-[#333333]/40 font-bold mb-8">
                                    Instrumen evaluasi untuk {activeTab.toUpperCase()} belum dikonfigurasi.
                                </p>
                                <Button 
                                    onClick={addQuestion} 
                                    className="rounded-2xl bg-[#1A5C0A] text-white font-black text-[10px] uppercase tracking-widest px-8"
                                >
                                    <Plus size={18} className="mr-2" /> Mulai Buat Soal
                                </Button>
                            </div>
                        ) : (
                            questions.map((q, qIndex) => (
                                <div 
                                    key={qIndex} 
                                    className="bg-white rounded-[2.5rem] border border-[#1A5C0A]/10 p-8 shadow-sm hover:border-[#1A5C0A]/40 transition-all duration-500 group relative"
                                >
                                    {/* Question Index Badge */}
                                    <div className="absolute -left-4 top-8 w-12 h-12 bg-[#1A5C0A] rounded-2xl shadow-xl flex items-center justify-center text-white font-black text-lg transform -rotate-6 transition-transform group-hover:rotate-0">
                                        {qIndex + 1}
                                    </div>

                                    <div className="flex items-start justify-between mb-8 pl-8">
                                        <div>
                                            <h3 className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-[0.3em] mb-1">Pertanyaan Nomor {qIndex + 1}</h3>
                                            <p className="text-[9px] text-[#333333]/30 font-bold uppercase tracking-widest">Atur Detail Soal Pilihan Ganda</p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => removeQuestion(qIndex)}
                                            className="h-10 w-10 p-0 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>

                                    <div className="space-y-8 pl-8">
                                        {/* Question Text Area */}
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-[#333333]/40 uppercase tracking-widest flex items-center gap-2">
                                                <FileText size={12} className="text-[#1A5C0A]" />
                                                Narasi Pertanyaan
                                            </label>
                                            <textarea
                                                value={q.question_text}
                                                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                                                placeholder="Tulis pertanyaan di sini..."
                                                className="w-full p-6 rounded-3xl border-2 border-[#1A5C0A]/5 bg-[#F7FFF4]/50 text-sm font-bold text-[#333333] focus:outline-none focus:border-[#1A5C0A] focus:bg-white transition-all resize-none h-32 shadow-inner"
                                            />
                                        </div>

                                        {/* Options Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {q.options.map((option, oIndex) => (
                                                <div key={oIndex} className="space-y-3">
                                                    <div className="flex items-center justify-between px-2">
                                                        <label className="text-[9px] font-black text-[#333333]/40 uppercase tracking-widest">
                                                            Opsi {String.fromCharCode(65 + oIndex)}
                                                        </label>
                                                        <button
                                                            onClick={() => setCorrectAnswer(qIndex, oIndex)}
                                                            className={cn(
                                                                "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-all",
                                                                q.correct_answer === oIndex
                                                                    ? "bg-[#1A5C0A] text-white shadow-lg scale-110 cursor-pointer"
                                                                    : "bg-[#1A5C0A]/5 text-[#1A5C0A] hover:bg-[#1A5C0A]/10 cursor-pointer"
                                                            )}
                                                        >
                                                            {q.correct_answer === oIndex ? "Kunci Jawaban" : "Set Kunci Jawaban"}
                                                        </button>
                                                    </div>
                                                    <div className="relative group/opt">
                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                            placeholder={`Pilihan ${String.fromCharCode(65 + oIndex)}...`}
                                                            className={cn(
                                                                "w-full h-14 pl-14 pr-6 rounded-2xl border-2 text-sm font-bold transition-all shadow-sm",
                                                                q.correct_answer === oIndex
                                                                    ? "bg-white border-[#1A5C0A] text-[#1A5C0A] ring-4 ring-[#1A5C0A]/5"
                                                                    : "bg-white border-[#1A5C0A]/5 text-[#333333] focus:border-[#1A5C0A]"
                                                            )}
                                                        />
                                                        <div className={cn(
                                                            "absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-sm transition-all",
                                                            q.correct_answer === oIndex ? "bg-[#1A5C0A] text-white scale-110" : "bg-[#1A5C0A]/5 text-[#1A5C0A]"
                                                        )}>
                                                            {String.fromCharCode(65 + oIndex)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

