"use client";

import {
    ArrowRight,
    CheckCircle2,
    Target,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminManageTestsPage() {
    const globalTests = [
        {
            id: "pretest",
            title: "Pre-test Global",
            desc: "Ujian awal untuk mengukur pemahaman dasar lingkungan seluruh siswa.",
            icon: Target,
            color: "text-blue-900 bg-blue-100",
            path: "/admin/tes/pretest"
        },
        {
            id: "posttest",
            title: "Post-test Global",
            desc: "Ujian akhir untuk mengevaluasi peningkatan kesadaran lingkungan.",
            icon: CheckCircle2,
            color: "text-indigo-900 bg-indigo-100",
            path: "/admin/tes/posttest"
        }
    ];


    return (
        <div className="mx-auto px-8 py-10 space-y-12 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[48px] bg-white border border-blue-900/5 p-12 shadow-2xl shadow-blue-900/5">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-blue-900 animate-pulse" />
                        <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Bank Soal Terpusat Eco Hero</span>
                    </div>
                    
                    <h1 className="text-4xl font-black text-[#333333] mb-4">
                        Manajemen Instrumen Tes
                    </h1>
                    <p className="text-lg text-[#333333]/60 max-w-2xl font-medium leading-relaxed">
                        Atur satu set soal Pre-test dan Post-test yang akan digunakan secara global oleh seluruh siswa di semua kelas. Perubahan di sini akan langsung berdampak pada sistem evaluasi aplikasi.
                    </p>
                </div>
            </div>

            {/* Global Test Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {globalTests.map((test) => (
                    <Link key={test.id} href={test.path} className="group">
                        <div className="bg-white rounded-[40px] border-2 border-transparent hover:border-blue-900/10 p-10 shadow-xl shadow-blue-900/5 transition-all h-full flex flex-col justify-between">
                            <div>
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", test.color)}>
                                    <test.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-[#333333] mb-4">{test.title}</h3>
                                <p className="text-[#333333]/50 font-medium leading-relaxed mb-8">{test.desc}</p>
                            </div>
                            <div className="flex items-center justify-between pt-8 border-t border-blue-900/5">
                                <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Kelola Bank Soal</span>
                                <div className="w-12 h-12 rounded-full bg-blue-900/5 flex items-center justify-center group-hover:bg-blue-900 group-hover:text-white transition-all">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
