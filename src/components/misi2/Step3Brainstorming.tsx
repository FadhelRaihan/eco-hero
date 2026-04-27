"use client";

import { useState, useEffect, useRef } from "react";
import { Crown, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrainstormingData } from "@/hooks/useMission2";

// Tidak lagi menggunakan pilihan tetap

interface Step3BrainstormingProps {
    isKetua: boolean;
    savedData: BrainstormingData | null;
    onSave: (data: BrainstormingData) => Promise<{ success: boolean; error?: string }>;
    onComplete: () => Promise<void>;
    loading: boolean;
}

// Step badge helper dipindah ke luar agar tidak re-render
function StepBadge({ num, label, done }: { num: number; label: string; done: boolean }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                done ? "bg-[#B4FF9F] text-[#1A5C0A]" : "bg-[#FCFEBA] text-[#7A6A00]"
            )}>
                {done ? <CheckCircle size={14} className="text-[#1A5C0A]" /> : num}
            </div>
            <span className="text-sm font-bold text-gray-800">{label}</span>
        </div>
    );
}

// Field component dipindah ke luar agar input tidak kehilangan fokus saat mengetik
function Field({ label, value, onChange, placeholder, disabled }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder: string; disabled?: boolean;
}) {
    return (
        <div className="mb-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">
                {label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "w-full h-10 px-3 rounded-xl border text-sm transition-colors",
                    disabled && value
                        ? "bg-[#F8FFF5] border-[#D1F2C4] text-gray-700 cursor-default"
                        : disabled
                            ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-200 focus:outline-none focus:border-[#EEDB24]"
                )}
            />
        </div>
    );
}

export default function Step3Brainstorming({
    isKetua,
    savedData,
    onSave,
    onComplete,
    loading,
}: Step3BrainstormingProps) {
    const [form, setForm] = useState<BrainstormingData>(
        savedData ?? {
            env_problem: "",
            social_problem: "",
            solution: "",
            solution_reason: "",
            action_type: "poster",
            action_name: "",
            materials: "",
            target_audience: "",
        }
    );
    const [step, setStep] = useState<1 | 2 | 3>(
        savedData?.solution ? 2 : 1
    );
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);

    const lastSavedRef = useRef(JSON.stringify(savedData));

    useEffect(() => {
        if (savedData) {
            setForm(savedData);
            lastSavedRef.current = JSON.stringify(savedData);

            if (!isKetua) {
                // Jangan gunakan action_type karena memiliki nilai default "poster"
                if (savedData.action_name || savedData.materials || savedData.target_audience) {
                    setStep(3);
                } else if (savedData.solution || savedData.solution_reason) {
                    setStep(2);
                } else {
                    setStep(1);
                }
            }
        }
    }, [savedData, isKetua]);

    // Live Auto Save (Hanya untuk ketua)
    useEffect(() => {
        if (!isKetua) return;
        const timer = setTimeout(() => {
            const currentStr = JSON.stringify(form);
            if (currentStr !== lastSavedRef.current) {
                setSaving(true);
                onSave(form).then(() => {
                    lastSavedRef.current = currentStr;
                    setSaving(false);
                });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [form, isKetua, onSave]);

    function update(key: keyof BrainstormingData, value: string) {
        if (!isKetua) return;
        setForm((prev) => ({ ...prev, [key]: value }));
        if (error) setError("");
    }

    async function handleSaveAndNext(nextStep: 2 | 3) {
        if (!isKetua) return;
        if (step === 1 && (!form.env_problem.trim() || !form.social_problem.trim())) {
            setError("Isi semua kolom terlebih dahulu");
            return;
        }
        if (step === 2 && (!form.solution.trim() || !form.solution_reason.trim())) {
            setError("Isi semua kolom terlebih dahulu");
            return;
        }

        setError("");
        setStep(nextStep);
    }

    async function handleComplete() {
        if (!isKetua) return;
        if (!form.action_name.trim() || !form.materials.trim() || !form.target_audience.trim()) {
            setError("Isi semua kolom terlebih dahulu");
            return;
        }

        setError("");
        setSaving(true);
        const result = await onSave(form);
        setSaving(false);
        if (!result.success) {
            setError(result.error ?? "Gagal menyimpan");
            return;
        }

        setCompleting(true);
        await onComplete();
        setCompleting(false);
    }

    // Tampilan disatukan — jika anggota, disabled otomatis nyala dari isKetua
    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 py-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#FCFEBA] flex items-center justify-center">
                        <span className="text-[#8A7B1E] font-extrabold text-lg">3</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                            Brainstroming Solusi
                        </h2>
                        {!isKetua && (
                            <p className="text-xs text-[#2D7A1A] font-bold">
                                🟢 Sedang diisi oleh Ketua Tim secara langsung...
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border-2 border-[#EEDB24] overflow-hidden bg-white">
                    {/* Step 1: Identifikasi Masalah */}
                    <div className={cn(
                        "p-5 border-b border-gray-100",
                        step > 1 && "opacity-80"
                    )}>
                        <StepBadge num={1} label="Step 1: Identifikasi masalah" done={step > 1} />
                        <Field
                            label="Masalah dari sisi lingkungan"
                            value={form.env_problem}
                            onChange={(v) => update("env_problem", v)}
                            placeholder="Plastik mencemari selokan, susah terurai, merusak ekosistem."
                            disabled={!isKetua || step > 1}
                        />
                        <Field
                            label="Masalah dari sisi sosial/ekonomi"
                            value={form.social_problem}
                            onChange={(v) => update("social_problem", v)}
                            placeholder="Pedagang sulit ganti wadah karena biaya lebih mahal."
                            disabled={!isKetua || step > 1}
                        />
                        {step === 1 && isKetua && (
                            <button
                                onClick={() => handleSaveAndNext(2)}
                                disabled={saving}
                                className="flex items-center gap-2 mt-2 px-6 py-2 bg-[#FCFEBA] text-[#7A6A00] border border-[#DECC18] text-sm font-bold rounded-xl hover:bg-[#F2F59E] transition-all active:scale-95 cursor-pointer"
                            >
                                {saving ? "Menyimpan..." : "Lanjut ke Step 2"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Step 2: Solusi Jalan Tengah */}
                    <div className={cn(
                        "p-5 border-b border-gray-100",
                        step < 2 && "opacity-40 pointer-events-none",
                        step > 2 && "opacity-80"
                    )}>
                        <StepBadge num={2} label="Step 2: Solusi jalan tengah" done={step > 2} />
                        <Field
                            label="Solusi yang kami usulkan"
                            value={form.solution}
                            onChange={(v) => update("solution", v)}
                            placeholder="Ketik solusi jalan tengah yang adil untuk semua pihak..."
                            disabled={!isKetua || step !== 2}
                        />
                        <Field
                            label="Alasan solusi ini bisa berhasil"
                            value={form.solution_reason}
                            onChange={(v) => update("solution_reason", v)}
                            placeholder="Jelaskan mengapa solusi ini bisa diterapkan..."
                            disabled={!isKetua || step !== 2}
                        />
                        {step === 2 && isKetua && (
                            <button
                                onClick={() => handleSaveAndNext(3)}
                                disabled={saving}
                                className="flex items-center gap-2 mt-2 px-6 py-2 bg-[#FCFEBA] text-[#7A6A00] border border-[#DECC18] text-sm font-bold rounded-xl hover:bg-[#F2F59E] transition-all active:scale-95 cursor-pointer"
                            >
                                {saving ? "Menyimpan..." : "Lanjut ke Step 3"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Step 3: Rancangan Aksi */}
                    <div className={cn(
                        "p-5",
                        step < 3 && "opacity-40 pointer-events-none"
                    )}>
                        <StepBadge num={3} label="Step 3: Rancangan aksi" done={false} />

                        <Field
                            label="Jenis Aksi yang Akan Dibuat"
                            value={form.action_type}
                            onChange={(v) => update("action_type", v)}
                            placeholder="Contoh: Kampanye Poster, Surat Usulan, Alat Filter, dll..."
                            disabled={!isKetua || step !== 3}
                        />

                        <Field
                            label="Nama Aksi/Produk"
                            value={form.action_name}
                            onChange={(v) => update("action_name", v)}
                            placeholder="Nama kampanye atau produk kalian..."
                            disabled={!isKetua || step !== 3}
                        />
                        <Field
                            label="Bahan/Alat yang Dibutuhkan"
                            value={form.materials}
                            onChange={(v) => update("materials", v)}
                            placeholder="Sebutkan bahan-bahan yang diperlukan..."
                            disabled={!isKetua || step !== 3}
                        />
                        <Field
                            label="Siapa yang Akan Dibantu/Diajak Bicara"
                            value={form.target_audience}
                            onChange={(v) => update("target_audience", v)}
                            placeholder="Contoh: ibu kantin, kepala sekolah, warga..."
                            disabled={!isKetua || step !== 3}
                        />

                        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                    </div>
                </div>
            </div>

            {/* Tombol Selesaikan — jika ketua, akan trigger backend, jika anggota, cuma cek syarat */}
            <div className="pt-4 pb-6 mt-2">
                <button
                    onClick={isKetua ? handleComplete : async () => { setCompleting(true); await onComplete(); setCompleting(false); }}
                    disabled={(!isKetua && !savedData?.action_name) || (isKetua && step !== 3) || !form.action_name || completing}
                    className={cn(
                        "w-full py-3 sm:py-2 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer",
                        (isKetua && step === 3 && form.action_name) || (!isKetua && savedData?.action_name)
                            ? "bg-[#FCFEBA] text-[#7A6A00] border-2 border-[#EEDB24] shadow-sm hover:scale-[1.01]"
                            : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    )}
                >
                    {completing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) :
                        (
                            <Crown size={24} className={(isKetua && step === 3 && form.action_name) || (!isKetua && savedData?.action_name) ? "text-[#FFB800]" : ""} />
                        )}
                    {completing ? "Menyimpan..." : "Selesaikan Misi & Dapatkan Lencana"}
                </button>
            </div>
        </div>
    );
}