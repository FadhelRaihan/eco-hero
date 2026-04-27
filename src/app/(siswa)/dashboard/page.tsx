"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMissionProgress } from "@/hooks/useMission";
import MissionCard from "@/components/shared/MissionCard";
import TeamStatusDialog from "@/components/siswa/TeamStatusDialog";
import { Leaf, Award, Users, BookOpen, Loader2, Image as ImageIcon, Crown, Search, Cog, Clock, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";

const BADGE_ICONS = [Search, Cog, Clock, ShieldCheck];
const BADGE_NAMES = ["Sang Penyelidik", "Arsitek Solusi", "Pengatur Waktu", "Pahlawan Nyata"];

export default function DashboardSiswaPage() {
    const { user } = useAuth();
    const { missions, loading, badgeCount, completedCount, currentMission, pretestStatus, posttestStatus } =
        useMissionProgress(user?.id);
    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin w-8 h-8" />
            </div>
        );
    }

    const progressPercent = (completedCount / 4) * 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 md:pb-12">
            {/* SECTION KIRI */}
            <div className="lg:col-span-7 flex flex-col gap-4 lg:gap-6 h-full">
                {/* Hero Header */}
                <div className="bg-white border border-[#1A5C0A]/50 px-4 sm:px-6 pt-5 sm:pt-6 pb-6 sm:pb-7 rounded-3xl">
                    <div className="flex items-end gap-3 sm:gap-4">
                        <div className="flex-1">
                            <p className="text-base sm:text-xl font-semibold text-[#333333] mb-0.5">
                                Selamat datang kembali,
                            </p>
                            <h1 className="text-lg sm:text-2xl font-extrabold text-[#333333] leading-tight">
                                {user?.full_name ?? "Pahlawan"}
                            </h1>
                            <p className="text-sm sm:text-lg text-[#333333] mt-1">
                                {user?.class_name ?? ""}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                                {badgeCount > 0 && (
                                    <span className="flex items-center gap-1 bg-[#F9FFA4] text-[#7A7200] text-[12px] sm:text-[14px] font-bold px-2.5 sm:px-3 py-1 rounded-full">
                                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF9100]" />
                                        {badgeCount} Lencana
                                    </span>
                                )}
                                {currentMission && (
                                    <span className="flex items-center gap-1 bg-[#B4FF9F] text-[#1A5C0A] text-[12px] sm:text-[14px] font-bold px-2.5 sm:px-3 py-1 rounded-full">
                                        <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A5C0A]" />
                                        Misi {currentMission.mission_number} aktif
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 sm:mt-6">
                                <div className="bg-[#1A5C0A] rounded-full h-2 overflow-hidden w-full max-w-[200px] sm:max-w-[250px]">
                                    <div
                                        className="bg-[#7FD96A] h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className="text-[11px] sm:text-[12px] text-[#333333] mt-2 font-medium">
                                    {completedCount} dari 4 misi selesai
                                </p>
                            </div>
                        </div>

                        {/* Maskot */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 flex-shrink-0">
                            <svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <ellipse cx="40" cy="92" rx="22" ry="7" fill="#a8e896" />
                                <rect x="27" y="65" width="10" height="28" rx="5" fill="#5db84a" />
                                <rect x="43" y="65" width="10" height="28" rx="5" fill="#5db84a" />
                                <rect x="16" y="34" width="12" height="22" rx="6" fill="#FFD59E" />
                                <rect x="52" y="34" width="12" height="22" rx="6" fill="#FFD59E" />
                                <rect x="22" y="18" width="36" height="50" rx="18" fill="#7FD96A" />
                                <circle cx="40" cy="26" r="15" fill="#B4FF9F" />
                                <circle cx="34" cy="23" r="4" fill="white" />
                                <circle cx="46" cy="23" r="4" fill="white" />
                                <circle cx="35" cy="23" r="2" fill="#333" />
                                <circle cx="47" cy="23" r="2" fill="#333" />
                                <path d="M34 30 Q40 35 46 30" fill="none" stroke="#333" strokeWidth="1.8" strokeLinecap="round" />
                                <ellipse cx="40" cy="12" rx="10" ry="9" fill="#5db84a" />
                                <ellipse cx="29" cy="9" rx="7" ry="5" fill="#7FD96A" transform="rotate(-20 29 9)" />
                                <ellipse cx="51" cy="9" rx="7" ry="5" fill="#7FD96A" transform="rotate(20 51 9)" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Navigation Cards & Info Team */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
                    <div 
                        onClick={() => setIsTeamDialogOpen(true)}
                        className="bg-white rounded-3xl border border-[#1A5C0A]/50 p-4 lg:p-5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer active:scale-95"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#B4FF9F] flex items-center justify-center text-[#333333] flex-shrink-0">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-md font-extrabold text-[#333333]">Tim Saya</p>
                            <p className="text-xs text-[#333333]/70 font-medium">Status Aktif</p>
                        </div>
                    </div>

                    <Link href="/galeri" className="bg-white rounded-3xl border border-[#1A5C0A]/50 p-4 lg:p-5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-[#B4FF9F] flex items-center justify-center text-[#333333] flex-shrink-0">
                            <ImageIcon size={24} />
                        </div>
                        <div>
                            <p className="text-md font-extrabold text-[#333333]">Galeri</p>
                            <p className="text-xs text-[#333333]/70 font-medium">Karya Pahlawan</p>
                        </div>
                    </Link>
                </div>

                {/* Detailed Lencana Section */}
                <div id="lencana" className="flex-1 bg-white rounded-3xl border border-[#1A5C0A]/50 p-4 sm:p-5 lg:p-6 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-extrabold text-[#333333] uppercase tracking-wide">
                            Koleksi Lencana
                        </h2>
                        <div className="bg-[#F9FFA4] text-[#7A7200] text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Crown size={16} className="text-[#FF9100]" />
                            {badgeCount} Terkumpul
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                        {BADGE_ICONS.map((IconComponent, i) => {
                            const earned = missions[i]?.badge_earned ?? false;
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "rounded-2xl p-3 flex flex-col items-center justify-center text-center border-2 border-[#333333]/50 transition-all",
                                        earned
                                            ? "bg-[#B4FF9F] border-[#333333]/50"
                                            : "bg-gray-50 border-[#333333]/50 opacity-50"
                                    )}
                                >
                                    <div className="mb-2">
                                        {earned ? (
                                            <IconComponent className="w-6 h-6 lg:w-8 lg:h-8 text-[#1A5C0A]" />
                                        ) : (
                                            <Lock className="w-6 h-6 lg:w-8 lg:h-8 text-[#333333]/40" />
                                        )}
                                    </div>
                                    <p className={cn(
                                        "text-[8.5px] lg:text-[10px] font-bold leading-tight",
                                        earned ? "text-[#1A5C0A]" : "text-[#333333]/50"
                                    )}>
                                        {BADGE_NAMES[i]}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* SECTION KANAN */}
            <div className="col-span-1 lg:col-span-5 h-full w-full">
                <div className="h-full bg-white rounded-3xl border border-[#1A5C0A]/50 p-6">
                    <div className="flex items-center justify-between mb-4 px-1 lg:px-0">
                        <h2 className="text-sm font-extrabold text-[#333333] uppercase tracking-wide">
                            Perjalanan Misiku
                        </h2>
                        <span className="text-xs font-bold text-[#333333]/50">{completedCount}/4 Misi Selesai</span>
                    </div>
                    <div className="space-y-4">
                        {/* Pre-Test */}
                        <MissionCard
                            missionNumber="pretest"
                            progress={{ status: pretestStatus }}
                            variant="full"
                        />

                        {/* Misi 1-4 */}
                        {[1, 2, 3, 4].map((num) => (
                            <MissionCard
                                key={num}
                                missionNumber={num}
                                progress={missions.find((m) => m.mission_number === num)}
                                variant="full"
                            />
                        ))}

                        {/* Post-Test */}
                        <MissionCard
                            missionNumber="posttest"
                            progress={{ status: posttestStatus }}
                            variant="full"
                        />
                    </div>
                </div>
            </div>

            <TeamStatusDialog 
                isOpen={isTeamDialogOpen}
                onClose={() => setIsTeamDialogOpen(false)}
                studentId={user?.id}
            />
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}