"use client";

import { useState } from "react";
import { Bot, Crown, ArrowRight } from "lucide-react";
import Image from "next/image";
import Lokasi1 from "@/assets/Lokasi1.png";
import Lokasi2 from "@/assets/Lokasi2.png";
import Lokasi3 from "@/assets/Lokasi3.png";
import { cn } from "@/lib/utils";

type CaseTopic = "plastik_kantin" | "alih_fungsi_lahan" | "pencemaran_air";

const CASE_CONFIG: {
    id: CaseTopic;
    label: string;
    bg: string;
    border: string;
    selectedBorder: string;
}[] = [
        {
            id: "plastik_kantin",
            label: "Isu Plastik Kantin Sekolah",
            bg: "bg-[#F9FFA4]",
            border: "border-[#D4D400]",
            selectedBorder: "border-[#EEDB24]",
        },
        {
            id: "alih_fungsi_lahan",
            label: "Isu Alih Fungsi Lahan",
            bg: "bg-[#F0FFF0]",
            border: "border-[#B4FF9F]",
            selectedBorder: "border-[#4CAF50]",
        },
        {
            id: "pencemaran_air",
            label: "Isu Pencemaran Air",
            bg: "bg-[#EBF5FF]",
            border: "border-[#B5D4F4]",
            selectedBorder: "border-blue-400",
        },
    ];

// Ilustrasi SVG sama dari Misi 1
function CaseIllustration({ id }: { id: CaseTopic }) {
    if (id === "plastik_kantin") {
        return (
            <Image 
                src={Lokasi1} 
                alt="Kantin Sekolah" 
                fill 
                className="object-cover" 
            />
        );
    }
    if (id === "alih_fungsi_lahan") {
        return (
            <Image 
                src={Lokasi2} 
                alt="Lahan Hijau Desa" 
                fill 
                className="object-cover" 
            />
        );
    }
    return (
        <Image 
            src={Lokasi3} 
            alt="Sungai Pemukiman" 
            fill 
            className="object-cover" 
        />
    );
}

interface Step1KetuaProps {
    studentId: string;
    onDecide: (isKetua: boolean) => void;
    onCreateTeam: (name: string, selectedCase: CaseTopic) => Promise<{ success: boolean; error?: string }>;
    loading: boolean;
}

export default function Step1Ketua({
    studentId,
    onDecide,
    onCreateTeam,
    loading,
}: Step1KetuaProps) {
    const [showPopup, setShowPopup] = useState(true);
    const [isKetua, setIsKetua] = useState<boolean | null>(null);
    const [teamName, setTeamName] = useState("");
    const [selectedCase, setSelectedCase] = useState<CaseTopic | null>(null);
    const [error, setError] = useState("");

    function handleDecide(mau: boolean) {
        setIsKetua(mau);
        setShowPopup(false);
        onDecide(mau);
    }

    async function handleLanjut() {
        if (!teamName.trim()) {
            setError("Nama tim tidak boleh kosong");
            return;
        }
        if (!selectedCase) {
            setError("Pilih topik terlebih dahulu");
            return;
        }

        setError("");
        const result = await onCreateTeam(teamName.trim(), selectedCase);
        if (!result.success) {
            setError(result.error ?? "Gagal membuat tim");
        }
    }

    return (
        <div className="flex-1 flex flex-col" >
            {/* Popup Modal */}
            {
                showPopup && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" >
                        <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-xl" >
                            <div className="w-16 h-16 bg-[#F5F5F5] border-2 border-[#333333] rounded-2xl flex items-center justify-center mx-auto mb-4" >
                                <Bot size={32} className="text-[#333333]" />
                            </div>
                            <h2 className="text-lg font-extrabold text-gray-800 mb-2" >
                                Kamu mau jadi ketua atau tidak ?
                            </h2>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed" >
                                Jika mau nantinya kamu akan memimpin teman - teman tim kamu
                                untuk menyelesaikan misi - misi berikutnya.
                            </p>
                            <div className="flex gap-3" >
                                <button
                                    onClick={() => handleDecide(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#FFA8A8] text-[#9A0D0D] hover:bg-[#FF8A8A] transition-all active:scale-95 cursor-pointer"
                                >
                                    Gamau
                                </button>
                                <button
                                    onClick={() => handleDecide(true)}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#FCFEBA] text-[#7A6A00] border border-[#DECC18] shadow-sm hover:scale-[1.01] transition-all active:scale-95 cursor-pointer"
                                >
                                    Mau
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Content: Form buat tim (jika mau jadi ketua) */}
            {
                !showPopup && isKetua && (
                    <div className="flex-1 py-6" >
                        <div className="flex items-center gap-3 mb-5" >
                            <div className="w-8 h-8 rounded-full bg-[#FCFEBA] flex items-center justify-center" >
                                <span className="text-[#8A7B1E] font-extrabold text-lg" > 1 </span>
                            </div>
                            <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide" >
                                Tentukan Ketua
                            </h2>
                        </div>

                        <div className="rounded-2xl border-2 border-[#E0DC00] p-3 bg-white" >
                            {/* Header tim */}
                            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100" >
                                <div>
                                    <p className="font-bold text-[#8A7B1E] text-base" >
                                        {teamName || "Nama Tim"
                                        }
                                    </p>
                                    <p className="text-xs text-gray-400" >
                                        Kasus: {" "}
                                        {
                                            selectedCase
                                                ? selectedCase === "plastik_kantin"
                                                    ? "Isu Plastik Kantin"
                                                    : selectedCase === "alih_fungsi_lahan"
                                                        ? "Isu Alih Fungsi Lahan"
                                                        : "Isu Pencemaran Air"
                                                : "Kasus yang dipilih"
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#FCFEBA] text-[#7A6A00] text-xs font-bold px-3 py-1.5 rounded-full" >
                                    <Crown size={12} className="text-[#FFB800]" />
                                    Ketua Tim
                                </div>
                            </div>

                            {/* Input nama tim */}
                            <div className="mb-5" >
                                <label className="text-[10px] font-bold text-[#7A7200] uppercase tracking-wide mb-2 block" >
                                    Masukan Nama Tim Kamu
                                </label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="Nama Tim"
                                    className="w-full h-11 px-4 rounded-xl border border-[#7A7200] text-sm focus:outline-none focus:border-[#EEDB24] transition-colors"
                                />
                            </div>

                            {/* Pilih topik */}
                            <div>
                                <label className="text-[10px] font-bold text-[#7A7200] uppercase tracking-wide mb-3 block" >
                                    Pilih Topik Untuk Tim Kamu
                                </label>
                                < div className="grid grid-cols-3 gap-3" >
                                    {
                                        CASE_CONFIG.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setSelectedCase(c.id)}
                                                className={
                                                    cn(
                                                        "rounded-2xl p-2 overflow-hidden border-2 text-left transition-all active:scale-[0.98] cursor-pointer",
                                                        c.bg,
                                                        selectedCase === c.id
                                                            ? `${c.selectedBorder} ring-2 ring-offset-1 ring-current`
                                                            : c.border
                                                    )}
                                            >
                                                <div className="w-full aspect-[0.5/0.2] md:aspect-[0.5/0.12] rounded-lg overflow-hidden relative" >
                                                    <CaseIllustration id={c.id} />
                                                </div>
                                                < div className={cn("pt-2 text-center", c.bg)} >
                                                    <p className="text-[10px] font-bold text-gray-700" >
                                                        {c.label}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>

                            {
                                error && (
                                    <p className="text-xs text-red-500 mt-3" > {error} </p>
                                )
                            }
                        </div>
                    </div>
                )}

            {/* Content: Menunggu (jika tidak mau jadi ketua) */}
            {
                !showPopup && !isKetua && (
                    <div className="flex-1 py-6" >
                        <div className="flex items-center gap-3 mb-5" >
                            <div className="w-8 h-8 rounded-full bg-[#FCFEBA] flex items-center justify-center" >
                                <span className="text-[#8A7B1E] font-extrabold text-lg" > 1 </span>
                            </div>
                            <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide" >
                                Tentukan Ketua
                            </h2>
                        </div>

                        <div className="rounded-2xl border-2 border-[#EEDB24] p-8 bg-white text-center" >
                            <div className="text-4xl mb-3" >⏳</div>
                            <p className="font-bold text-gray-700 mb-2" >
                                Tunggu ketua tim mengundangmu
                            </p>
                            <p className="text-sm text-gray-400 leading-relaxed" >
                                Salah satu teman kamu akan membuat tim dan mengundang kamu.
                                Halaman ini akan otomatis update ketika kamu sudah masuk ke tim.
                            </p>
                        </div>
                    </div>
                )
            }

            {/* Lanjut button — hanya tampil kalau ketua dan sudah isi form */}
            {
                !showPopup && isKetua && (
                    <div className="flex justify-end" >
                        <button
                            onClick={handleLanjut}
                            disabled={!teamName.trim() || !selectedCase || loading
                            }
                            className={
                                cn(
                                    "flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer",
                                    teamName.trim() && selectedCase && !loading
                                        ? "bg-[#FCFEBA] text-[#7A6A00] border border-[#DECC18] hover:scale-[1.01]"
                                        : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                )
                            }
                        >
                            {
                                loading ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Lanjut
                                        <ArrowRight size={16} />
                                    </div>
                                )
                            }
                        </button>
                    </div>
                )}
        </div>
    );
}