"use client";

import { useAuth } from "@/hooks/useAuth";
import { useMission1 } from "@/hooks/useMission1";
import Step1Location from "@/components/misi1/Step1Location";
import Step2Video from "@/components/misi1/Step2Video";
import Step3Question from "@/components/misi1/Step3Question";
import Step4Forum from "@/components/misi1/Step4Forum";
import BadgeModal from "@/components/misi1/BadgeModal";
import { Brain, Link as LinkIcon, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Misi1Page() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [showBadge, setShowBadge] = useState(false);

    const mission = useMission1(user?.id ?? "", user?.class_id ?? "");

    async function handleComplete() {
        console.log("handleComplete called");
        const result = await mission.completeMission();
        console.log("completeMission result:", result);
        if (result.success) {
            setShowBadge(true);
        }
    }

    const showLoading = authLoading || (!!user && !mission.initialized);

    return (
        <div className="flex flex-col">
            {/* Hero Header */}
            <div className="px-4 md:px-8 lg:px-26 pt-20 lg:pt-24 pb-6 bg-[#B4FF9F]">
                <p className="text-[10px] font-bold text-[#2D7A1A] uppercase tracking-widest mb-3">
                    Misi 1 · Nalar Kritis
                </p>
                <h1 className="text-xl lg:text-2xl font-extrabold text-[#1A5C0A] flex items-center gap-2 mb-3">
                    <Search className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-[#1A5C0A]" strokeWidth={3} /> Sang Penyelidik
                </h1>
                <p className="text-xs lg:text-sm text-[#2D7A1A] leading-relaxed mb-5 max-w-lg">
                    Selidiki isu lingkungan di sekitarmu! Pilih lokasi, tonton video, jawab
                    pertanyaan, lalu bagikan pendapatmu di forum diskusi.
                </p>
                <div className="flex gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 bg-[#FFFDF1] text-[#1A5C0A] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#1A5C0A]/20">
                        <Brain size={16} strokeWidth={3} className="text-[#FFA1A1]" /> Nalar Kritis
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#FFFDF1] text-[#1A5C0A] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#1A5C0A]/20">
                        <LinkIcon size={16} strokeWidth={3} className="text-[#333333]" /> Berpikir Sistem
                    </span>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 flex flex-col px-4 md:px-8 lg:px-26 pb-8">
                {showLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                        <Loader2 className="animate-spin w-8 h-8 text-[#1A5C0A]" />
                        <p className="text-sm text-[#333333]/50 font-medium">Memuat misi...</p>
                    </div>
                ) : !user ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-[#333333]/50">Sesi tidak ditemukan</p>
                    </div>
                ) : (
                    <>
                        {(mission.currentStep ?? 1) === 1 && (
                            <Step1Location
                                selected={mission.selectedLocation}
                                onSelect={mission.handleLocationSelect}
                                onLanjut={mission.goToNextStep}
                            />
                        )}
                        {(mission.currentStep ?? 1) === 2 && (
                            <Step2Video
                                caseTopic={mission.selectedLocation!}
                                isCompleted={mission.videoWatched}
                                onComplete={mission.handleVideoComplete}
                                onLanjut={mission.goToNextStep}
                            />
                        )}
                        {(mission.currentStep ?? 1) === 3 && (
                            <Step3Question
                                caseTopic={mission.selectedLocation!}
                                isCompleted={mission.questionAnswered}
                                savedAnswer={mission.questionAnswer}
                                onSubmit={mission.handleQuestionSubmit}
                                onLanjut={mission.goToNextStep}
                            />
                        )}
                        {(mission.currentStep ?? 1) === 4 && (
                            <Step4Forum
                                classId={user.class_id ?? ""}
                                studentId={user.id}
                                selectedTopic={mission.selectedLocation!}
                                posts={mission.posts}
                                loadingPosts={mission.loadingPosts}
                                hasPosted={mission.hasPosted}
                                submitting={mission.submitting}
                                onSubmitPost={mission.submitPost}
                                onComplete={handleComplete}
                                onFetchPosts={mission.fetchPosts}
                            />
                        )}
                    </>
                )}
            </div>

            {showBadge && <BadgeModal onClose={() => router.push("/dashboard")} />}
        </div>
    );
}