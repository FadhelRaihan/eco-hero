"use client";

import { useState } from "react";
import { Crown, GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamData, StudentData } from "@/hooks/useMission2";

interface Step2BuatTimProps {
    isKetua: boolean;
    myTeam: TeamData | null;
    availableStudents: StudentData[];
    studentId: string;
    onAddMember: (memberId: string) => Promise<{ success: boolean; error?: string }>;
    onRemoveMember: (memberId: string) => void;
    onLanjut: () => void;
    loading: boolean;
}

const CASE_LABEL: Record<string, string> = {
    plastik_kantin: "Isu Plastik Kantin Sekolah",
    alih_fungsi_lahan: "Isu Alih Fungsi Lahan",
    pencemaran_air: "Isu Pencemaran Air",
};

export default function Step2BuatTim({
    isKetua,
    myTeam,
    availableStudents,
    studentId,
    onAddMember,
    onRemoveMember,
    onLanjut,
    loading,
}: Step2BuatTimProps) {
    const [dragOver, setDragOver] = useState<"available" | "team" | null>(null);
    const [error, setError] = useState("");

    const myTeamMembers = myTeam?.team_members ?? [];

    // Drag & Drop handlers
    function handleDragStart(e: React.DragEvent, memberId: string, from: "available" | "team") {
        e.dataTransfer.setData("memberId", memberId);
        e.dataTransfer.setData("from", from);
    }

    async function handleDropToTeam(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(null);
        const memberId = e.dataTransfer.getData("memberId");
        const from = e.dataTransfer.getData("from");

        if (from === "available") {
            setError("");
            const result = await onAddMember(memberId);
            if (!result.success) setError(result.error ?? "Gagal menambahkan");
        }
    }

    async function handleDropToAvailable(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(null);
        const memberId = e.dataTransfer.getData("memberId");
        const from = e.dataTransfer.getData("from");

        // Jangan izinkan ketua dikeluarkan dari tim
        if (from === "team" && memberId !== myTeam?.leader_id) {
            onRemoveMember(memberId);
        }
    }

    // Tampilan untuk ANGGOTA (bukan ketua)
    if (!isKetua) {
        return (
            <div className="flex-1 flex flex-col pt-2">
                <div className="flex-1 pb-6">
                    <div className="flex items-center gap-3 mb-5" >
                        <div className="w-8 h-8 rounded-full bg-[#FCFEBA] flex items-center justify-center" >
                            <span className="text-[#8A7B1E] font-extrabold text-lg" > 2 </span>
                        </div>
                        <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide" >
                            Buat Tim
                        </h2>
                    </div>

                    <div className="rounded-2xl border-2 border-[#EEDB24] p-5 bg-white">
                        {myTeam ? (
                            <>
                                <p className="text-xs text-gray-500 mb-4">
                                    Tunggu ketua tim memasukan nama kamu kedalam tim mereka
                                </p>

                                {/* Info tim */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-bold text-[#7A6A00] text-base">
                                            {myTeam.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Kasus: {CASE_LABEL[myTeam.selected_case]}
                                        </p>
                                    </div>
                                </div>

                                {/* Daftar anggota */}
                                <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                                    Tim Kamu
                                </p>
                                <div className="space-y-2">
                                    {myTeamMembers.map((member) => (
                                        <div
                                            key={member.student_id}
                                            className="flex items-center gap-3 bg-[#F8FFF5] border border-[#D1F2C4] rounded-xl px-4 py-2.5"
                                        >
                                            <GripVertical size={14} className="text-gray-300" />
                                            {member.student_id === myTeam.leader_id && (
                                                <Crown size={14} className="text-[#FFB800] flex-shrink-0" />
                                            )}
                                            <span className="text-sm font-medium text-gray-700">
                                                {member.users.full_name}
                                            </span>
                                            {member.student_id === studentId && (
                                                <span className="ml-auto text-[9px] bg-[#B4FF9F] text-[#1A5C0A] font-bold px-2 py-0.5 rounded-full">
                                                    Kamu
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-3">⏳</div>
                                <p className="font-bold text-gray-700 mb-2">
                                    Menunggu dimasukkan ke tim
                                </p>
                                <p className="text-sm text-gray-400">
                                    Halaman akan otomatis update saat ketua memasukkanmu ke tim
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lanjut hanya aktif jika sudah masuk tim */}
                <div className="flex justify-end">
                    <button
                        onClick={onLanjut}
                        disabled={!myTeam}
                        className={cn(
                            "px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer",
                            myTeam
                                ? "bg-[#FCFEBA] text-[#7A6A00] border border-[#DECC18] hover:scale-[1.01]"
                                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        )}
                    >
                        Lanjut →
                    </button>
                </div>
            </div>
        );
    }

    // Tampilan untuk KETUA
    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 py-6">
                <div className="flex items-center gap-3 mb-5" >
                    <div className="w-8 h-8 rounded-full bg-[#FCFEBA] flex items-center justify-center" >
                        <span className="text-[#8A7B1E] font-extrabold text-lg" > 2 </span>
                    </div>
                    <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide" >
                        Buat Tim
                    </h2>
                </div>

                <div className="rounded-2xl border-2 border-[#E0DC00] p-5 bg-white">
                    <p className="text-xs text-gray-500 mb-4">
                        Pindahkan nama siswa ke kolom timmu. Semua siswa kelas bisa melihat perubahan ini secara langsung.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Kolom: Siswa Tersedia */}
                        <div>
                            <p className="text-xs font-bold text-[#666666] uppercase mb-2">
                                Siswa Tersedia
                            </p>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver("available"); }}
                                onDragLeave={() => setDragOver(null)}
                                onDrop={handleDropToAvailable}
                                className={cn(
                                    "min-h-40 rounded-xl border-2 border-dashed p-2 transition-colors",
                                    dragOver === "available"
                                        ? "border-gray-400 bg-[#FAFAFA]"
                                        : "border-gray-200 bg-[#FAFAFA]"
                                )}
                            >
                                {availableStudents.length === 0 ? (
                                    <p className="text-xs text-[#666666] text-center pt-4">
                                        Semua siswa sudah masuk tim
                                    </p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {availableStudents.map((s) => (
                                            <div
                                                key={s.student_id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, s.student_id, "available")}
                                                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all"
                                            >
                                                <GripVertical size={13} className="text-gray-300 flex-shrink-0" />
                                                <span className="text-sm text-gray-700">
                                                    {s.users.full_name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kolom: Tim Kamu */}
                        <div className="">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                                Tim Kamu
                            </p>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver("team"); }}
                                onDragLeave={() => setDragOver(null)}
                                onDrop={handleDropToTeam}
                                className={cn(
                                    "min-h-40 rounded-xl border-2 border-dashed p-2 transition-colors",
                                    dragOver === "team"
                                        ? "border-[#7A6200] bg-[#FFFDE7]"
                                        : "border-[#E0DC00] bg-[#FFFDE7]"
                                )}
                            >
                                <div className="space-y-1.5">
                                    {myTeamMembers.map((member) => (
                                        <div
                                            key={member.student_id}
                                            draggable={member.student_id !== myTeam?.leader_id}
                                            onDragStart={(e) =>
                                                member.student_id !== myTeam?.leader_id &&
                                                handleDragStart(e, member.student_id, "team")
                                            }
                                            className={cn(
                                                "flex items-center gap-2 border rounded-lg px-3 py-2 transition-all",
                                                member.student_id === myTeam?.leader_id
                                                    ? "bg-[#F8FFF5] border-[#D1F2C4] cursor-default"
                                                    : "bg-[#F8FFF5] border-[#D1F2C4] cursor-grab active:cursor-grabbing hover:shadow-sm"
                                            )}
                                        >
                                            <GripVertical size={13} className="text-gray-300 flex-shrink-0" />
                                            {member.student_id === myTeam?.leader_id && (
                                                <Crown size={13} className="text-[#FFB800] flex-shrink-0" />
                                            )}
                                            <span className="text-sm text-gray-700 flex-1">
                                                {member.users.full_name}
                                            </span>
                                            {member.student_id !== myTeam?.leader_id && (
                                                <button
                                                    onClick={() => onRemoveMember(member.student_id)}
                                                    className="text-gray-300 hover:text-red-400 transition-colors"
                                                >
                                                    <X size={13} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onLanjut}
                    disabled={myTeamMembers.length < 2 || loading}
                    className={cn(
                        "px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer",
                        myTeamMembers.length >= 2
                            ? "bg-[#FCFEBA] text-[#7A6A00] border border-[#DECC18] hover:scale-[1.01]"
                            : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    )}
                >
                    Lanjut →
                </button>
            </div>
        </div>
    );
}