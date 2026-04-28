"use client";

import { useState } from "react";
import { Crown, GripVertical, Plus, X } from "lucide-react";
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
    tumpukan_sampah: "Isu Tumpukan Sampah",
    kendaraan_listrik: "Isu Kendaraan Listrik",
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
    // Desktop: drag & drop state
    const [dragOver, setDragOver] = useState<"available" | "team" | null>(null);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [error, setError] = useState("");
    // Mobile: tap-to-select state
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [adding, setAdding] = useState<string | null>(null);

    const myTeamMembers = myTeam?.team_members ?? [];

    // ── Desktop Drag & Drop handlers ─────────────────────────────────────────
    function handleDragStart(e: React.DragEvent, memberId: string, from: "available" | "team") {
        e.dataTransfer.setData("memberId", memberId);
        e.dataTransfer.setData("from", from);
        setDraggedId(memberId);
    }

    function handleDragEnd() {
        setDraggedId(null);
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
        if (from === "team" && memberId !== myTeam?.leader_id) {
            onRemoveMember(memberId);
        }
    }

    // ── Mobile Tap-to-Add handler ─────────────────────────────────────────────
    async function handleTapStudent(memberId: string) {
        if (adding) return; // sedang proses
        setSelectedId(memberId);
        setAdding(memberId);
        setError("");
        const result = await onAddMember(memberId);
        if (!result.success) setError(result.error ?? "Gagal menambahkan");
        setAdding(null);
        setSelectedId(null);
    }

    // ── Tampilan ANGGOTA (bukan ketua) ────────────────────────────────────────
    if (!isKetua) {
        return (
            <div className="flex-1 flex flex-col pt-2">
                <div className="flex-1 pb-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-full bg-[#FCFEBA] flex items-center justify-center">
                            <span className="text-[#8A7B1E] font-extrabold text-lg">2</span>
                        </div>
                        <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                            Buat Tim
                        </h2>
                    </div>

                    <div className="rounded-2xl border-2 border-[#EEDB24] p-5 bg-white">
                        {myTeam ? (
                            <>
                                <p className="text-xs text-gray-500 mb-4">
                                    Tunggu ketua tim memasukan nama kamu kedalam tim mereka
                                </p>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-bold text-[#7A6A00] text-base">{myTeam.name}</p>
                                        <p className="text-xs text-gray-400">Kasus: {CASE_LABEL[myTeam.selected_case]}</p>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Tim Kamu</p>
                                <div className="space-y-2">
                                    {myTeamMembers.map((member) => (
                                        <div
                                            key={member.student_id}
                                            className="flex items-center gap-3 bg-[#F8FFF5] border border-[#D1F2C4] rounded-xl px-4 py-2.5"
                                        >
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
                                <p className="font-bold text-gray-700 mb-2">Menunggu dimasukkan ke tim</p>
                                <p className="text-sm text-gray-400">
                                    Halaman akan otomatis update saat ketua memasukkanmu ke tim
                                </p>
                            </div>
                        )}
                    </div>
                </div>

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

    // ── Tampilan KETUA ────────────────────────────────────────────────────────
    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 py-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#FCFEBA] flex items-center justify-center">
                        <span className="text-[#8A7B1E] font-extrabold text-lg">2</span>
                    </div>
                    <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                        Buat Tim
                    </h2>
                </div>

                <div className="rounded-2xl border-2 border-[#E0DC00] p-5 bg-white">
                    {/* Instruksi adaptif: desktop vs mobile */}
                    <p className="text-xs text-gray-500 mb-1 hidden md:block">
                        Seret nama siswa ke kolom timmu, atau klik <strong>+</strong> untuk menambahkan.
                    </p>
                    <p className="text-xs text-gray-500 mb-4 md:hidden">
                        Ketuk tombol <strong>+</strong> di samping nama siswa untuk menambahkan ke timmu.
                    </p>

                    {/* Layout: Stack di mobile, side-by-side di desktop */}
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-4">

                        {/* Kolom: Siswa Tersedia */}
                        <div>
                            <p className="text-xs font-bold text-[#666666] uppercase mb-2">
                                Siswa Tersedia
                                {availableStudents.length > 0 && (
                                    <span className="ml-2 text-[10px] font-normal normal-case text-gray-400">
                                        ({availableStudents.length} siswa)
                                    </span>
                                )}
                            </p>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver("available"); }}
                                onDragLeave={() => setDragOver(null)}
                                onDrop={handleDropToAvailable}
                                className={cn(
                                    "min-h-32 rounded-xl border-2 border-dashed p-2 transition-colors",
                                    dragOver === "available"
                                        ? "border-gray-400 bg-gray-50"
                                        : "border-gray-200 bg-[#FAFAFA]"
                                )}
                            >
                                {availableStudents.length === 0 ? (
                                    <p className="text-xs text-[#666666] text-center pt-6">
                                        Semua siswa sudah masuk tim
                                    </p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {availableStudents.map((s) => (
                                            <div
                                                key={s.student_id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, s.student_id, "available")}
                                                onDragEnd={handleDragEnd}
                                                className={cn(
                                                    "flex items-center gap-2 bg-white border rounded-lg px-3 py-2 transition-all",
                                                    draggedId === s.student_id
                                                        ? "opacity-40 border-gray-300"
                                                        : "border-gray-200 hover:border-[#DECC18] hover:shadow-sm",
                                                    selectedId === s.student_id && "ring-2 ring-[#EEDB24]"
                                                )}
                                            >
                                                {/* Grip icon — hanya tampil di desktop */}
                                                <GripVertical size={13} className="text-gray-300 flex-shrink-0 hidden md:block" />
                                                <span className="text-sm text-gray-700 flex-1">
                                                    {s.users.full_name}
                                                </span>
                                                {/* Tombol + untuk mobile tap-to-add */}
                                                <button
                                                    onClick={() => handleTapStudent(s.student_id)}
                                                    disabled={!!adding}
                                                    className={cn(
                                                        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90",
                                                        adding === s.student_id
                                                            ? "bg-gray-100 text-gray-300"
                                                            : "bg-[#FCFEBA] text-[#7A6A00] hover:bg-[#EEDB24]"
                                                    )}
                                                    title="Tambah ke tim"
                                                >
                                                    {adding === s.student_id ? (
                                                        <span className="text-[10px] animate-pulse">...</span>
                                                    ) : (
                                                        <Plus size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Kolom: Tim Kamu */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                                Tim Kamu
                                {myTeamMembers.length > 0 && (
                                    <span className="ml-2 text-[10px] font-normal normal-case text-gray-400">
                                        ({myTeamMembers.length} anggota)
                                    </span>
                                )}
                            </p>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver("team"); }}
                                onDragLeave={() => setDragOver(null)}
                                onDrop={handleDropToTeam}
                                className={cn(
                                    "min-h-32 rounded-xl border-2 border-dashed p-2 transition-colors",
                                    dragOver === "team"
                                        ? "border-[#7A6200] bg-[#FFFDE7]"
                                        : "border-[#E0DC00] bg-[#FFFDE7]"
                                )}
                            >
                                {myTeamMembers.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center pt-6">
                                        Belum ada anggota
                                    </p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {myTeamMembers.map((member) => (
                                            <div
                                                key={member.student_id}
                                                draggable={member.student_id !== myTeam?.leader_id}
                                                onDragStart={(e) =>
                                                    member.student_id !== myTeam?.leader_id &&
                                                    handleDragStart(e, member.student_id, "team")
                                                }
                                                onDragEnd={handleDragEnd}
                                                className={cn(
                                                    "flex items-center gap-2 border rounded-lg px-3 py-2 transition-all bg-[#F8FFF5] border-[#D1F2C4]",
                                                    member.student_id !== myTeam?.leader_id
                                                        ? "md:cursor-grab md:active:cursor-grabbing hover:shadow-sm"
                                                        : "cursor-default"
                                                )}
                                            >
                                                <GripVertical
                                                    size={13}
                                                    className={cn(
                                                        "text-gray-300 flex-shrink-0 hidden md:block",
                                                        member.student_id === myTeam?.leader_id && "invisible"
                                                    )}
                                                />
                                                {member.student_id === myTeam?.leader_id && (
                                                    <Crown size={13} className="text-[#FFB800] flex-shrink-0" />
                                                )}
                                                <span className="text-sm text-gray-700 flex-1">
                                                    {member.users.full_name}
                                                </span>
                                                {member.student_id !== myTeam?.leader_id && (
                                                    <button
                                                        onClick={() => onRemoveMember(member.student_id)}
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                                                        title="Keluarkan dari tim"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
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