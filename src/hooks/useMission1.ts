"use client";

import { useState, useEffect, useCallback } from "react";
import type { Mission1ForumPost } from "@/types/database";
import { CaseTopic } from "@/lib/mission-data";

type Step = 1 | 2 | 3 | 4;

interface PostWithMeta extends Mission1ForumPost {
    users: { id: string; full_name: string };
    mission1_forum_comments: { count: number }[];
}

export function useMission1(studentId: string, classId: string) {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [selectedLocation, setSelectedLocation] = useState<CaseTopic | null>(null);
    const [videoWatched, setVideoWatched] = useState(false);
    const [questionAnswered, setQuestionAnswered] = useState(false);
    const [questionAnswer, setQuestionAnswer] = useState("");
    const [posts, setPosts] = useState<PostWithMeta[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [hasPosted, setHasPosted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!studentId || !classId) return;
        setInitialized(false);

        async function syncStep() {
            try {
                const res = await fetch(`/api/progress/${studentId}/mission/1`);
                const result = await res.json();

                if (res.ok && result.data) {
                    const data = result.data;
                    const step = (data.mission1_step ?? 1) as Step;
                    setCurrentStep(step);

                    // Sinkronisasi Kasus dari Database
                    if (data.mission1_case) {
                        const legacyMap: Record<string, CaseTopic> = {
                            tumpukan_sampah: "sampah",
                            kendaraan_listrik: "kendaraan"
                        };
                        const normalizedCase = legacyMap[data.mission1_case] || (data.mission1_case as CaseTopic);
                        setSelectedLocation(normalizedCase);
                    }

                    if (step >= 2) {
                        setVideoWatched(data.mission1_video_watched ?? false);
                    }

                    if (step >= 3) {
                        setQuestionAnswered(!!data.mission1_question_answer);
                        if (data.mission1_question_answer) {
                            setQuestionAnswer(data.mission1_question_answer);
                        }
                    }

                    if (step === 4) {
                        const postsRes = await fetch(`/api/mission1/${classId}/posts`);
                        const postsResult = await postsRes.ok ? await postsRes.json() : { data: [] };
                        if (postsRes.ok) {
                            const fetchedPosts: PostWithMeta[] = postsResult.data ?? [];
                            setPosts(fetchedPosts);
                            setHasPosted(fetchedPosts.some((p) => p.student_id === studentId));
                        }
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
    }, [studentId, classId]);

    const fetchPosts = useCallback(async () => {
        if (!classId) return;
        setLoadingPosts(true);
        try {
            const res = await fetch(`/api/mission1/${classId}/posts`);
            const result = await res.json();
            if (res.ok) {
                const fetchedPosts: PostWithMeta[] = result.data ?? [];
                setPosts(fetchedPosts);
                const ownPost = fetchedPosts.some((p) => p.student_id === studentId);
                if (ownPost) setHasPosted(true);
            }
        } finally {
            setLoadingPosts(false);
        }
    }, [classId, studentId]);

    async function advanceStep(nextStep: Step) {
        setCurrentStep(nextStep);
        await fetch(`/api/progress/${studentId}/mission/1`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mission1_step: nextStep }),
        });
    }

    async function handleLocationSelect(location: CaseTopic) {
        setSelectedLocation(location);
        // Simpan pilihan kasus ke database
        await fetch(`/api/progress/${studentId}/mission/1`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mission1_case: location }),
        });
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
        await fetch(`/api/progress/${studentId}/mission/1`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mission1_video_watched: true }),
        });
    }

    async function handleQuestionSubmit(answer: string) {
        setQuestionAnswered(true);
        setQuestionAnswer(answer);
        await fetch(`/api/progress/${studentId}/mission/1`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mission1_question_answer: answer }),
        });
    }

    async function submitPost(postData: {
        case_topic: CaseTopic;
        perspective_env: string;
        perspective_soc: string;
    }) {
        setSubmitting(true);
        try {
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
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setSubmitting(false);
        }
    }

    async function completeMission() {
        setSubmitting(true);
        try {
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
        questionAnswer,
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
    };
}