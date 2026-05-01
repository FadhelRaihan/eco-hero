"use client";

import { useState, useEffect } from "react";
import { Users, School, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalClasses: 0,
        totalTests: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                const result = await res.json();
                if (res.ok) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statItems = [
        { 
            icon: Users, 
            label: "Total User", 
            value: loading ? "..." : stats.totalUsers.toString(), 
            color: "bg-blue-100 text-blue-900",
            desc: "Guru dan Siswa terdaftar"
        },
        { 
            icon: School, 
            label: "Total Kelas", 
            value: loading ? "..." : stats.totalClasses.toString(), 
            color: "bg-indigo-100 text-indigo-900",
            desc: "Seluruh kelas aktif"
        },
        { 
            icon: ClipboardCheck, 
            label: "Instrumen Tes", 
            value: loading ? "..." : stats.totalTests.toString(), 
            color: "bg-purple-100 text-purple-900",
            desc: "Pre-test dan Post-test"
        },
    ];

    return (
        <div className="space-y-12 p-8 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[48px] bg-white border border-blue-900/5 p-12 shadow-2xl shadow-blue-900/5">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-blue-900 animate-pulse" />
                        <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Sistem Administrasi Eco Hero</span>
                    </div>
                    
                    <h1 className="text-4xl font-black text-[#333333] mb-4">
                        Panel Kontrol Admin
                    </h1>
                    <p className="text-lg text-[#333333]/60 max-w-2xl font-medium leading-relaxed">
                        Kelola seluruh infrastruktur data aplikasi Eco Hero, mulai dari manajemen pengguna, konfigurasi kelas global, hingga pengaturan instrumen tes.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statItems.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[32px] border-2 border-transparent hover:border-blue-900/10 p-8 shadow-xl shadow-blue-900/5 transition-all group">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", stat.color)}>
                            <stat.icon size={28} />
                        </div>
                        <p className="text-4xl font-black text-[#333333] mb-1">{stat.value}</p>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
                        <p className="text-xs text-gray-400 font-medium">{stat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
