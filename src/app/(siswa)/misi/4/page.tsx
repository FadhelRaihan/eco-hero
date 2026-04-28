"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMission4 } from "@/hooks/useMission4";
import { 
    Upload, Loader2, FileText,   
    Crown, PartyPopper
} from "lucide-react";
import Step1Upload from "@/components/misi4/Step1Upload";
import Step2Reflection from "@/components/misi4/Step2Reflection";
import BadgeModal4 from "@/components/misi4/BadgeModal4";

export default function Misi4Page() {
    const { user, loading: authLoading } = useAuth();
    const mission = useMission4();
    const [showBadge, setShowBadge] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(1);

    useEffect(() => {
        if (mission.initialized) {
            if (mission.teamRole === "anggota") {
                setCurrentStep(2);
            } else if (mission.submissions && mission.submissions.length > 0) {
                setCurrentStep(2);
            } else {
                setCurrentStep(1);
            }

            if (mission.reflection) {
                setShowBadge(true);
            }
        }
    }, [mission.initialized, mission.submissions, mission.reflection, mission.teamRole]);



    const handleSaveDocumentation = async (files: any) => {
        const res = await mission.uploadDocumentation(files);
        if (res.success) {
            setCurrentStep(2);
        } else {
            alert(res.error);
        }
    };

    const handleCompleteReflection = async (feeling: string, commitment: string) => {
        const res = await mission.submitReflection(feeling, commitment);
        if (res.success) {
            await mission.completeMission();
            setShowBadge(true);
        } else {
            alert(res.error);
        }
    };

    const showLoading = authLoading || (!!user && !mission.initialized);

    return (
        <div className="flex flex-col">
            {/* Hero Header */}
            <div className="px-4 md:px-8 lg:px-26 pt-16 lg:pt-20 pb-3 bg-[#FFAFAF]">
                <p className="text-[10px] font-bold text-[#7A2A2A] uppercase tracking-widest mb-1">
                    Misi 4 · Agen Perubahan
                </p>
                <h1 className="text-lg lg:text-2xl font-extrabold text-[#7A2A2A] flex items-center gap-2 mb-1">
                    <span className="text-2xl"><PartyPopper className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-[#7A2A2A]" strokeWidth={3} /></span> Aksi Nyata
                </h1>
                <p className="text-xs lg:text-sm text-[#7A2A2A] leading-relaxed mb-3 max-w-lg">
                    Waktunya beraksi! Upload dokumentasi proyekmu, lihat karya teman-teman, dan refleksikan perjalananmu.
                </p>
                <div className="flex gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 bg-[#FFFDF1] text-[#7A2A2A] text-[10px] font-semibold px-2 py-1 rounded-full border border-[#7A2A2A]/20">
                        <Upload size={16} strokeWidth={3} className="text-[#FFA1A1]" /> Dokumentasi
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#FFFDF1] text-[#7A2A2A] text-[10px] font-semibold px-2 py-1 rounded-full border border-[#7A2A2A]/20">
                        <FileText size={16} strokeWidth={3} className="text-[#333333]" /> Refleksi
                    </span>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 flex flex-col px-4 md:px-8 lg:px-26 pb-8">
                {showLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                        <Loader2 className="animate-spin w-8 h-8 text-[#7A2A2A]" />
                        <p className="text-sm text-[#333333]/50 font-medium">Memuat misi...</p>
                    </div>
                ) : !user ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-[#333333]/50">Sesi tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="py-6">
                        {currentStep === 1 && (
                            <Step1Upload 
                                onSave={handleSaveDocumentation}
                                loading={mission.loading}
                            />
                        )}
                        {currentStep === 2 && (
                            <Step2Reflection 
                                submissions={mission.submissions}
                                onComplete={handleCompleteReflection}
                                loading={mission.loading}
                                savedFeeling={mission.reflection?.feeling}
                                savedCommitment={mission.reflection?.commitment}
                            />
                        )}
                    </div>
                )}
            </div>

            {showBadge && <BadgeModal4 />}
        </div>
    );
}
