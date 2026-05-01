"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Users, CheckCircle, School, Target, ArrowRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DEMO_GURU_CLASS, DEMO_GURU_STATS, DEMO_GURU_USER } from "@/lib/demo/mockData";

interface Kelas {
    id: string;
    name: string;
    teacher_id: string;
    member_count: number;
    team_count: number;
}

export default function DashboardGuruPage() {
    const { user } = useAuth();
    const [myClass, setMyClass] = useState<Kelas | null>(null);
    const [completedMissions, setCompletedMissions] = useState(0);
    const [loading, setLoading] = useState(true);

    const isDemoMode = typeof window !== "undefined"
        ? localStorage.getItem("eco_guru_demo_mode") === "true"
        : false;

    useEffect(() => {
        async function fetchMyClass() {
            if (isDemoMode) {
                setMyClass(DEMO_GURU_CLASS);
                setCompletedMissions(DEMO_GURU_STATS.completed_missions);
                setLoading(false);
                return;
            }

            try {
                // Guru hanya mengambil kelas miliknya sendiri
                const res = await fetch(`/api/classes?teacher_id=${user?.id}`);
                const result = await res.json();
                if (res.ok && result.data && result.data.length > 0) {
                    const classData = result.data[0];
                    setMyClass(classData);
                    
                    // Ambil statistik misi kelas tersebut
                    try {
                        const statsRes = await fetch(`/api/guru/stats?class_id=${classData.id}`);
                        const statsResult = await statsRes.json();
                        if (statsRes.ok) {
                            setCompletedMissions(statsResult.data?.completed_missions || 0);
                        }
                    } catch (err) {
                        console.error("Gagal menarik statistik misi:", err);
                    }
                }
            } finally {
                setLoading(false);
            }
        }

        if (user?.id) fetchMyClass();
        else setLoading(false);
    }, [user?.id, isDemoMode]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin w-8 h-8 border-4 border-[#1A5C0A] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="mx-auto px-8 py-10 space-y-10 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative bg-white rounded-[40px] border-2 border-[#1A5C0A]/10 p-10 overflow-hidden shadow-2xl shadow-[#1A5C0A]/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#B4FF9F]/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-[#1A5C0A]/5 px-4 py-2 rounded-full mb-6">
                        <School size={16} className="text-[#1A5C0A]" />
                        <span className="text-xs font-black text-[#1A5C0A] uppercase tracking-widest">Portal Guru Eco Hero</span>
                    </div>
                    
                    <h1 className="text-4xl font-black text-[#333333] mb-4">
                        Halo, {isDemoMode ? DEMO_GURU_USER.full_name : user?.full_name}
                    </h1>
                    <p className="text-lg text-[#333333]/60 max-w-2xl font-medium leading-relaxed">
                        Selamat datang kembali! Mari pantau perkembangan <span className="text-[#1A5C0A] font-bold">{myClass?.name || "Kelas Anda"}</span> dan dukung mereka menjadi Pahlawan Lingkungan sejati.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { 
                        icon: Users, 
                        label: "Total Siswa", 
                        value: myClass?.member_count || 0, 
                        color: "bg-[#B4FF9F] text-[#1A5C0A]",
                        desc: "Siswa terdaftar di kelas"
                    },
                    { 
                        icon: Target, 
                        label: "Tim Terbentuk", 
                        value: myClass?.team_count || 0, 
                        color: "bg-[#F9FFA4] text-[#7A7200]",
                        desc: "Kelompok aktif berkolaborasi"
                    },
                    { 
                        icon: CheckCircle, 
                        label: "Misi Selesai", 
                        value: completedMissions,
                        color: "bg-[#FFD59E] text-[#6b3a00]",
                        desc: "Total akumulasi misi"
                    },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[32px] border-2 border-transparent hover:border-[#1A5C0A]/10 p-8 shadow-xl shadow-[#1A5C0A]/5 transition-all group">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", stat.color)}>
                            <stat.icon size={28} />
                        </div>
                        <p className="text-4xl font-black text-[#333333] mb-1">{stat.value}</p>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
                        <p className="text-xs text-gray-400 font-medium">{stat.desc}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Manajemen Siswa Card */}
                <Link href="/guru/siswa" className="group">
                    <div className="bg-[#1A5C0A] rounded-[40px] p-10 h-full flex flex-col justify-between transition-all hover:-translate-y-2 shadow-2xl shadow-[#1A5C0A]/20">
                        <div>
                            <Users size={48} className="text-white/30 mb-8" />
                            <h3 className="text-2xl font-black text-white mb-4">Manajemen Siswa</h3>
                            <p className="text-white/60 font-medium">Kelola data siswa, pantau keaktifan, dan lihat profil individu siswa di {myClass?.name}.</p>
                        </div>
                        <div className="flex items-center gap-3 text-white font-bold mt-12 group-hover:gap-5 transition-all">
                            Kelola Sekarang <ArrowRight size={20} />
                        </div>
                    </div>
                </Link>

                {/* Hasil Tes Card */}
                <Link href="/guru/tes" className="group">
                    <div className="bg-[#FFD59E] rounded-[40px] p-10 h-full flex flex-col justify-between transition-all hover:-translate-y-2 shadow-xl">
                        <div>
                            <ClipboardCheck size={48} className="text-[#6b3a00]/30 mb-8" />
                            <h3 className="text-2xl font-black text-[#6b3a00] mb-4">Hasil Tes</h3>
                            <p className="text-[#6b3a00]/60 font-medium">Lihat nilai pre-test dan post-test siswa. Analisis perkembangan pemahaman lingkungan kelas.</p>
                        </div>
                        <div className="flex items-center gap-3 text-[#6b3a00] font-bold mt-12 group-hover:gap-5 transition-all">
                            Lihat Hasil <ArrowRight size={20} />
                        </div>
                    </div>
                </Link>

                {/* Manajemen Misi Card */}
                <Link href="/guru/misi" className="group">
                    <div className="bg-white rounded-[40px] border-2 border-[#1A5C0A]/10 p-10 h-full flex flex-col justify-between transition-all hover:-translate-y-2 shadow-xl shadow-gray-200">
                        <div>
                            <Target size={48} className="text-[#1A5C0A]/20 mb-8" />
                            <h3 className="text-2xl font-black text-[#333333] mb-4">Pemantauan Misi</h3>
                            <p className="text-[#333333]/50 font-medium">Review hasil pengerjaan misi, unggahan galeri, dan berikan feedback untuk setiap aksi nyata.</p>
                        </div>
                        <div className="flex items-center gap-3 text-[#1A5C0A] font-bold mt-12 group-hover:gap-5 transition-all">
                            Lihat Misi <ArrowRight size={20} />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}