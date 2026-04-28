"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMission2 } from "@/hooks/useMission2";
import { useRealtime } from "@/hooks/useRealtime";
import Step1Ketua from "@/components/misi2/Step1Ketua";
import Step2BuatTim from "@/components/misi2/Step2BuatTim";
import Step3Brainstorming from "@/components/misi2/Step3Brainstorming";
import BadgeModal2 from "@/components/misi2/BadgeModal2";
import { ArrowLeft, Crown, Cog, UsersRound, MessagesSquare, Activity, Loader2 } from "lucide-react";

export default function Misi2Page() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [showBadge, setShowBadge] = useState(false);

    const mission = useMission2(
        user?.id ?? "",
        user?.class_id ?? "",
        "belum_pilih"
    );

    // Realtime: update tim ketika ada perubahan (Hanya perlu saat tahap pembentukan tim)
    useRealtime({
        table: "teams",
        filter: `class_id=eq.${user?.class_id}`,
        onInsert: () => { mission.fetchTeams(); mission.fetchStudents(); },
        onUpdate: () => { mission.fetchTeams(); mission.fetchStudents(); },
        enabled: mission.currentStep <= 2
    });

    useRealtime({
        table: "team_members",
        onInsert: () => { mission.fetchTeams(); mission.fetchStudents(); },
        onDelete: () => { mission.fetchTeams(); mission.fetchStudents(); },
        enabled: mission.currentStep <= 2
    });

    useRealtime({
        table: "mission_progress",
        filter: `student_id=eq.${user?.id}`,
        onUpdate: () => { mission.syncProgress(); },
        enabled: !!user?.id
    });

    // Realtime untuk brainstorming — anggota bisa lihat update ketua (Hanya di Step 3)
    useRealtime({
        table: "mission2_submissions",
        filter: mission.myTeam ? `team_id=eq.${mission.myTeam.id}` : undefined,
        onInsert: () => {
            if (mission.myTeam) {
                mission.fetchBrainstorming();
            }
        },
        onUpdate: () => {
            if (mission.myTeam) {
                mission.fetchBrainstorming();
            }
        },
        enabled: mission.currentStep === 3 && !!mission.myTeam
    });

    const showLoading = authLoading || (!!user && !mission.initialized);

    async function handleDecide(isKetua: boolean) {
        // Hanya update UI state — tidak ada DB update untuk keputusan ini
        // DB akan update saat tim benar-benar dibuat
    }

    async function handleComplete() {
        const result = await mission.completeMission();
        if (result.success) setShowBadge(true);
    }
    

    return (
        <div className="flex flex-col bg-white">
            {/* Hero Header */}
            <div className="px-4 md:px-8 lg:px-26 pt-16 lg:pt-20 pb-3 bg-[#FCFEBA]">
                <p className="text-[10px] font-bold text-[#7A6200] uppercase tracking-widest mb-1">
                    Misi 2 · Tanggung Jawab & Keadilan
                </p>
                <h1 className="text-lg lg:text-xl font-extrabold text-[#7A6200] flex items-center gap-2 mb-1">
                    <span className="text-lg"><Cog className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-[#7A6200]" strokeWidth={3} /></span> Arsitek Solusi
                </h1>
                <p className="text-[10px] lg:text-xs text-[#7A6200] leading-relaxed mb-3 max-w-lg">
                    Bentuk tim, pilih kasus, dan rancang solusi jalan tengah untuk menyelamatkan lingkungan!
                </p>
                <div className="flex gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 bg-[#FFFDF1] text-[#1A5C0A] text-[10px] font-semibold px-2 py-1 rounded-full">
                        <span className=""><UsersRound size={16} strokeWidth={3} className="text-[#FFA1A1]" /></span> Bentuk Tim
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#FFFDF1] text-[#1A5C0A] text-[10px] font-semibold px-2 py-1 rounded-full">
                        <span className=""><MessagesSquare size={16} strokeWidth={3} className="text-[#333333]" /></span> Brainstroming
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#FFFDF1] text-[#1A5C0A] text-[10px] font-semibold px-2 py-1 rounded-full">
                        <span className=""><Activity size={16} strokeWidth={3} className="text-[#FF8D29]" /></span> Rancangan Aksi
                    </span>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 flex flex-col px-4 md:px-8 lg:px-26 pb-8">
                {showLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                        <Loader2 className="animate-spin w-8 h-8 text-[#7A6200]" />
                        <p className="text-sm text-[#333333]/50 font-medium">Memuat misi...</p>
                    </div>
                ) : !user ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-[#333333]/50">Sesi tidak ditemukan</p>
                    </div>
                ) : (
                    <>
                        {mission.currentStep === 1 && (
                            <Step1Ketua
                                studentId={user.id}
                                onDecide={handleDecide}
                                onCreateTeam={async (name, selectedCase) => {
                                    const result = await mission.createTeam(name, selectedCase);
                                    if (result.success) await mission.advanceStep(2);
                                    return result;
                                }}
                                loading={mission.loading}
                            />
                        )}
                        {mission.currentStep === 2 && (
                            <Step2BuatTim
                                isKetua={mission.teamRole === "ketua"}
                                myTeam={mission.myTeam}
                                availableStudents={mission.availableStudents}
                                studentId={user.id}
                                onAddMember={mission.addMember}
                                onRemoveMember={mission.removeMember}
                                onLanjut={async () => await mission.advanceStep(3)}
                                loading={mission.loading}
                            />
                        )}
                        {mission.currentStep === 3 && (
                            <Step3Brainstorming
                                isKetua={mission.teamRole === "ketua"}
                                savedData={mission.brainstorming}
                                onSave={mission.saveBrainstorming}
                                onComplete={handleComplete}
                                loading={mission.loading}
                            />
                        )}
                    </>
                )}
            </div>

            {showBadge && <BadgeModal2 />}
        </div>
    );
}