"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Users, CheckCircle, Clock, Lock, School } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Kelas {
    id: string;
    name: string;
    teacher_id: string;
    _count?: {
        members: number;
    };
}

export default function DashboardGuruPage() {
    const { user, logout } = useAuth();
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newClassName, setNewClassName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user?.id) fetchKelas();
    }, [user?.id]);

    async function fetchKelas() {
        try {
            const res = await fetch(`/api/classes?teacher_id=${user?.id}`);
            const result = await res.json();
            if (res.ok) setKelasList(result.data ?? []);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateKelas() {
        if (!newClassName.trim()) {
            setError("Nama kelas tidak boleh kosong");
            return;
        }

        setCreating(true);
        setError("");

        try {
            const res = await fetch("/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newClassName.trim(), teacher_id: user?.id }),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.error ?? "Gagal membuat kelas");
                return;
            }

            setKelasList((prev) => [...prev, result.data]);
            setNewClassName("");
            setShowForm(false);
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="mx-auto px-8 py-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-xl font-extrabold text-[#333333]">
                        Halo, {user?.full_name}
                    </h1>
                    <p className="text-sm text-[#333333]/60 mt-0.5">
                        Pantau perkembangan siswa Eco Hero
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-[#1A5C0A] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#1A5C0A]/90 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                    <Plus size={16} />
                    Buat Kelas
                </button>
            </div>

            {/* Form Buat Kelas */}
            {showForm && (
                <div className="bg-white rounded-2xl border-2 border-eco-green p-4 mb-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">
                        Buat Kelas Baru
                    </h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="Contoh: Kelas 5A"
                            className="flex-1 h-10 px-4 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-eco-green"
                            onKeyDown={(e) => e.key === "Enter" && handleCreateKelas()}
                        />
                        <button
                            onClick={handleCreateKelas}
                            disabled={creating}
                            className="px-4 h-10 bg-[#1A5C0A] text-white text-sm font-bold rounded-xl hover:bg-[#1A5C0A]/90 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {creating ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                            onClick={() => { setShowForm(false); setError(""); }}
                            className="px-4 h-10 bg-[#333333]/5 text-[#333333]/60 text-sm font-bold rounded-xl hover:bg-[#333333]/10 transition-all cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { icon: School, label: "Total Kelas", value: kelasList.length, color: "bg-[#B4FF9F] text-[#1A5C0A]" },
                    { icon: Users, label: "Total Siswa", value: "-", color: "bg-[#F9FFA4] text-[#7A7200]" },
                    { icon: CheckCircle, label: "Tim Terbentuk", value: "-", color: "bg-[#FFD59E] text-[#6b3a00]" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-[#1A5C0A]/10 p-4 shadow-sm">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2", stat.color)}>
                            <stat.icon size={18} />
                        </div>
                        <p className="text-2xl font-extrabold text-[#333333]">{stat.value}</p>
                        <p className="text-xs text-[#333333]/40 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Kelas List */}
            <h2 className="text-[11px] font-extrabold text-[#333333]/50 mb-3 uppercase tracking-widest">
                Daftar Kelas
            </h2>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-[#1A5C0A] border-t-transparent rounded-full" />
                </div>
            ) : kelasList.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                    <School size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500">Belum ada kelas</p>
                    <p className="text-xs text-gray-400 mt-1">Buat kelas pertamamu untuk mulai</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 text-sm text-eco-green-text font-bold hover:underline"
                    >
                        + Buat kelas sekarang
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kelasList.map((kelas) => (
                        <div key={kelas.id} className="bg-white rounded-2xl border border-[#1A5C0A]/10 p-5 transition-all shadow-sm group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-11 h-11 rounded-2xl bg-[#B4FF9F] flex items-center justify-center">
                                    <School size={22} className="text-[#1A5C0A]" />
                                </div>
                                <span className="text-[10px] bg-[#B4FF9F] text-[#1A5C0A] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Aktif
                                </span>
                            </div>
                            <h3 className="font-extrabold text-[#333333] text-base mb-1">
                                {kelas.name}
                            </h3>
                            <p className="text-[11px] text-[#333333]/40 font-medium">Data kelas ini dikelola di Manajemen Siswa</p>
                            
                            <div className="flex gap-1.5 mt-4">
                                {[1, 2, 3, 4].map((n) => (
                                    <div
                                        key={n}
                                        className="flex-1 h-1.5 rounded-full bg-[#1A5C0A]/5"
                                    />
                                ))}
                            </div>
                            <p className="text-[9px] text-[#333333]/30 font-bold mt-1.5 uppercase tracking-tighter">Progress misi siswa</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}