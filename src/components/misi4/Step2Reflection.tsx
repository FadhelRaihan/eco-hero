"use client";

import { useState } from "react";
import { FileText, Download, ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Mission4Submission } from "@/types/database";

interface Step2ReflectionProps {
    submissions: Mission4Submission[];
    onComplete: (feeling: string, commitment: string) => Promise<void>;
    loading: boolean;
    savedFeeling?: string;
    savedCommitment?: string;
}

export default function Step2Reflection({ submissions, onComplete, loading, savedFeeling = "", savedCommitment = "" }: Step2ReflectionProps) {
    const [feeling, setFeeling] = useState(savedFeeling);
    const [commitment, setCommitment] = useState(savedCommitment);
    
    // State untuk gallery dialog
    const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

    const handleComplete = async () => {
        if (!feeling || !commitment) return;
        await onComplete(feeling, commitment);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFAFAF] flex items-center justify-center text-[#7A2A2A] font-extrabold text-lg">
                    2
                </div>
                <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                    REFLEKSI DIRI
                </h2>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
                <div className="p-4 bg-red-50 rounded-xl">
                    <h3 className="font-bold text-[#7A2A2A]">Jurnal Refleksi Pribadi</h3>
                    <p className="text-xs text-[#7A2A2A]/70">Diisi oleh setiap anggota tim secara individu</p>
                </div>

                {/* Submissions Mini Gallery */}
                {submissions.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-[#333] uppercase tracking-wider opacity-50">DOKUMENTASI TIM</p>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {submissions.map((sub, idx) => (
                                <div 
                                    key={sub.id} 
                                    onClick={() => setSelectedMediaIndex(idx)}
                                    className="min-w-[120px] h-[80px] rounded-xl bg-black overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 ring-[#FFAFAF] transition-all"
                                >
                                    {sub.media_type === "foto" && <img src={sub.cloudinary_url} className="w-full h-full object-cover" />}
                                    {sub.media_type === "video" && <video src={sub.cloudinary_url} className="w-full h-full object-cover" />}
                                    {sub.media_type === "pdf" && <div className="w-full h-full flex items-center justify-center bg-gray-100"><FileText className="text-[#FFAFAF]" /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#333]">
                            "Bagaimana perasaanmu setelah berhasil membuat perubahan kecil ini?"
                        </label>
                        <Textarea 
                            placeholder="Tulis perasaanmu di sini..."
                            value={feeling}
                            onChange={(e) => setFeeling(e.target.value)}
                            className="min-h-[120px] rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#FFAFAF] transition-all resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#333]">
                            "Apa komitmenmu agar kebiasaan baik ini terus berlanjut?"
                        </label>
                        <Textarea 
                            placeholder="Tulis komitmenmu di sini..."
                            value={commitment}
                            onChange={(e) => setCommitment(e.target.value)}
                            className="min-h-[120px] rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#FFAFAF] transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button 
                        onClick={handleComplete}
                        disabled={!feeling || !commitment || loading}
                        className="bg-[#FFAFAF] hover:bg-[#FF8A8A] border border-[#7A2A2A]/20 text-[#7A2A2A] font-bold px-12 py-4 rounded-xl flex items-center gap-2 transition cursor-pointer"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Selesaikan Misi 4"} <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            {/* Gallery Dialog */}
            <Dialog open={selectedMediaIndex !== null} onOpenChange={(open) => !open && setSelectedMediaIndex(null)}>
                <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden border-none text-left">
                    {selectedMediaIndex !== null && submissions[selectedMediaIndex] && (
                        <>
                            <DialogHeader className="p-6 bg-[#FFAFAF] text-white">
                                <DialogTitle className="text-xl font-black">DOKUMENTASI AKSI NYATA TIM</DialogTitle>
                                <DialogDescription className="text-white/80 font-medium italic">
                                    "{submissions[selectedMediaIndex].caption || "Aksi nyata tim kami untuk lingkungan yang lebih baik"}"
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="p-0 bg-black min-h-[300px] flex items-center justify-center relative">
                                {submissions[selectedMediaIndex].media_type === "foto" && (
                                    <img src={submissions[selectedMediaIndex].cloudinary_url} alt="Dokumentasi" className="max-w-full max-h-[70vh] object-contain" />
                                )}
                                {submissions[selectedMediaIndex].media_type === "video" && (
                                    <video src={submissions[selectedMediaIndex].cloudinary_url} controls className="w-full max-h-[70vh]" />
                                )}
                                {submissions[selectedMediaIndex].media_type === "pdf" && (
                                    <div className="flex flex-col items-center gap-6 py-12 text-white">
                                        <FileText size={120} className="text-[#FFAFAF]" />
                                        <a href={submissions[selectedMediaIndex].cloudinary_url} target="_blank" className="flex items-center gap-2 bg-white text-[#7A2A2A] px-6 py-3 rounded-2xl font-black">
                                            <Download size={20} /> Buka / Download PDF
                                        </a>
                                    </div>
                                )}

                                {submissions.length > 1 && (
                                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                        <button 
                                            disabled={selectedMediaIndex === 0}
                                            onClick={() => setSelectedMediaIndex(selectedMediaIndex - 1)}
                                            className="pointer-events-auto w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm disabled:opacity-0 transition-all cursor-pointer"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <button 
                                            disabled={selectedMediaIndex === submissions.length - 1}
                                            onClick={() => setSelectedMediaIndex(selectedMediaIndex + 1)}
                                            className="pointer-events-auto w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm disabled:opacity-0 transition-all cursor-pointer"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
