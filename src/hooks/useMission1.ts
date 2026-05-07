"use client";

import { useState, useEffect, useCallback } from "react";
import type { Mission1ForumPost } from "@/types/database";
import { CaseTopic } from "@/lib/mission-data";
import { DEMO_MISSION1 } from "@/lib/demo/mockData";

export type Step = 1 | 2 | 3 | 4;

interface PostWithMeta extends Mission1ForumPost {
    users: { id: string; full_name: string };
    mission1_forum_comments: { count: number }[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useMission1(studentId: string, classId: string) {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [selectedLocation, setSelectedLocation] = useState<CaseTopic | null>(null);
    const [videoWatched, setVideoWatched] = useState(false);
    const [questionAnswered, setQuestionAnswered] = useState(false);
    const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({}); // Ubah ke plural/objek
    const [posts, setPosts] = useState<PostWithMeta[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [hasPosted, setHasPosted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [activeCase, setActiveCase] = useState<CaseTopic | null>(null);

    const isDemoMode = typeof window !== "undefined"
        ? localStorage.getItem("eco_demo_mode") === "true"
        : false;

    useEffect(() => {
        if (!studentId || !classId) return;
        setInitialized(false);

        // ── DEMO MODE ──────────────────────────────────────────
        if (isDemoMode) {
            setCurrentStep(DEMO_MISSION1.currentStep);
            setSelectedLocation(DEMO_MISSION1.selectedLocation);
            setVideoWatched(DEMO_MISSION1.videoWatched);
            setQuestionAnswered(DEMO_MISSION1.questionAnswered);
            if (DEMO_MISSION1.selectedLocation) {
                setQuestionAnswers({ [DEMO_MISSION1.selectedLocation]: DEMO_MISSION1.questionAnswer });
            }
            setPosts(DEMO_MISSION1.posts as unknown as PostWithMeta[]);
            setHasPosted(DEMO_MISSION1.hasPosted);
            setActiveCase(DEMO_MISSION1.selectedLocation);
            setInitialized(true);
            return;
        }
        // ── END DEMO ───────────────────────────────────────────

        async function syncStep() {
            try {
                const res = await fetch(`/api/progress/${studentId}/mission/1`);
                const result = await res.json();

                if (res.ok && result.data) {
                    const data = result.data;
                    const isFinished = data.mission1_status === "completed";
                    
                    // Jika sudah selesai, kita buat "Fresh Exploration"
                    if (isFinished) {
                        setCurrentStep(1); // Mulai dari pilih lokasi lagi
                        setSelectedLocation(null); // Kosongkan pilihan (hanya lokal)
                        setActiveCase(null);
                        setQuestionAnswers({}); // Kosongkan jawaban (hanya lokal)
                        setVideoWatched(false);
                    } else {
                        // Jika belum selesai, muat data asli dari DB
                        const step = (data.mission1_step ?? 1) as Step;
                        setCurrentStep(step);

                        let normalizedCase: CaseTopic | null = null;
                        if (data.mission1_case) {
                            const legacyMap: Record<string, CaseTopic> = {
                                tumpukan_sampah: "sampah",
                                kendaraan_listrik: "kendaraan"
                            };
                            normalizedCase = legacyMap[data.mission1_case] || (data.mission1_case as CaseTopic);
                            setSelectedLocation(normalizedCase);
                            setActiveCase(normalizedCase);
                        }

                        if (step >= 2) setVideoWatched(data.mission1_video_watched ?? false);

                        if (step >= 3) {
                            setQuestionAnswered(!!data.mission1_question_answer);
                            if (data.mission1_question_answer && normalizedCase) {
                                setQuestionAnswers({ [normalizedCase]: data.mission1_question_answer });
                            }
                        }
                    }

                    // Forum selalu dimuat karena forum bersifat publik dan multi-kasus
                    const postsRes = await fetch(`/api/mission1/${classId}/posts`);
                    const postsResult = postsRes.ok ? await postsRes.json() : { data: [] };
                    if (postsRes.ok) {
                        const fetchedPosts: PostWithMeta[] = postsResult.data ?? [];
                        setPosts(fetchedPosts);
                        setHasPosted(fetchedPosts.some((p) => p.student_id === studentId));
                    }
                } else {
                    setCurrentStep(1);
                }
            } catch (err) {
                console.error("Gagal sync step:", err);
                setCurrentStep(1);
            } finally {
                setInitialized(true);
            }
        }

        syncStep();
    }, [studentId, classId, isDemoMode]);

    const fetchPosts = useCallback(async () => {
        if (!classId || !activeCase || isDemoMode) return;
        setLoadingPosts(true);
        try {
            const res = await fetch(`/api/mission1/${classId}/posts?topic=${activeCase}`);
            const result = await res.json();
            if (res.ok) {
                const fetchedPosts: PostWithMeta[] = result.data ?? [];
                setPosts(fetchedPosts);
                setHasPosted(fetchedPosts.some((p) => p.student_id === studentId));
            }
        } finally {
            setLoadingPosts(false);
        }
    }, [classId, studentId, activeCase, isDemoMode]);

    // Re-fetch posts saat pindah kasus
    useEffect(() => {
        if (currentStep === 4) {
            fetchPosts();
        }
    }, [activeCase, currentStep, fetchPosts]);

    function goToStep(step: Step) {
        setCurrentStep(step);
    }

    async function advanceStep(nextStep: Step) {
        setCurrentStep(nextStep);
        if (isDemoMode) return;
        await fetch(`/api/progress/${studentId}/mission/1`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mission1_step: nextStep }),
        });
    }

    async function handleLocationSelect(location: CaseTopic) {
        setSelectedLocation(location);
        setActiveCase(location);
        if (isDemoMode) return;
        await fetch(`/api/progress/${studentId}/mission/1`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mission1_case: location }),
        });
    }

    function switchActiveCase(location: CaseTopic) {
        setActiveCase(location);
    }

    async function goToNextStep() {
        if (currentStep === 1 && selectedLocation) {
            await advanceStep(2);
        } else if (currentStep === 2) {
            await advanceStep(3);
        } else if (currentStep === 3) {
            await advanceStep(4);
            await fetchPosts();
        }
    }

    async function handleVideoComplete() {
        setVideoWatched(true);
        if (isDemoMode) return;
        await fetch(`/api/progress/${studentId}/mission/1`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mission1_video_watched: true }),
        });
    }

    async function handleQuestionSubmit(answer: string) {
        setQuestionAnswered(true);
        setQuestionAnswers(prev => ({ ...prev, [activeCase || ""]: answer }));
        
        // Hanya simpan ke DB jika sedang menjawab kasus utama yang dipilih
        if (activeCase === selectedLocation && !isDemoMode) {
            await fetch(`/api/progress/${studentId}/mission/1`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mission1_question_answer: answer }),
            });
        }
    }

    async function submitPost(postData: {
        case_topic: CaseTopic;
        perspective_env: string;
        perspective_soc: string;
    }) {
        setSubmitting(true);
        try {
            if (isDemoMode) {
                await sleep(700);
                const demoPost = {
                    id: `demo-post-${Date.now()}`,
                    student_id: studentId,
                    class_id: classId,
                    case_topic: postData.case_topic,
                    perspective_env: postData.perspective_env,
                    perspective_soc: postData.perspective_soc,
                    created_at: new Date().toISOString(),
                    users: { id: studentId, full_name: "Andi Pratama (Demo)" },
                    mission1_forum_comments: [{ count: 0 }],
                    mission1_question_answer: questionAnswers[postData.case_topic] || (postData.case_topic === "sampah" ? "setuju" : "kendaraan_umum"),
                } as PostWithMeta;
                setPosts((prev) => [demoPost, ...prev]);
                setHasPosted(true);
                return { success: true };
            }

            const res = await fetch(`/api/mission1/${classId}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...postData, student_id: studentId }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setHasPosted(true);
            setPosts((prev) => [result.data, ...prev]);
            return { success: true };
        } catch (err) {
            return { success: false, error: (err as Error).message };
        } finally {
            setSubmitting(false);
        }
    }

    async function completeMission() {
        setSubmitting(true);
        try {
            if (isDemoMode) {
                await sleep(800);
                return { success: true };
            }
            const res = await fetch(`/api/progress/${studentId}/mission/1`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "completed",
                    badge_earned: true,
                    completed_at: new Date().toISOString(),
                }),
            });
            if (!res.ok) throw new Error("Gagal menyimpan");
            return { success: true };
        } catch (err) {
            console.error("completeMission error:", err);
            return { success: false };
        } finally {
            setSubmitting(false);
        }
    }

    return {
        initialized,
        currentStep,
        selectedLocation,
        videoWatched,
        questionAnswered,
        posts,
        loadingPosts,
        hasPosted,
        submitting,
        handleLocationSelect,
        handleVideoComplete,
        handleQuestionSubmit,
        goToNextStep,
        submitPost,
        completeMission,
        fetchPosts,
        activeCase,
        switchActiveCase,
        goToStep,
        questionAnswers // Gunakan yang baru
    };
}