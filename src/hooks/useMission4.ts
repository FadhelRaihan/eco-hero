"use client";

import { useState, useEffect, useCallback } from "react";
import { Mission4Submission, Mission4Reflection, TeamRole } from "@/types/database";
import { TeamData } from "./useMission2";
import { useAuth } from "./useAuth";
import { DEMO_MISSION4 } from "@/lib/demo/mockData";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useMission4() {
    const { user, isDemoMode } = useAuth();
    const [teamRole, setTeamRole] = useState<TeamRole>("belum_pilih");
    const [myTeam, setMyTeam] = useState<TeamData | null>(null);
    const [submissions, setSubmissions] = useState<Mission4Submission[]>([]);
    const [reflection, setReflection] = useState<Mission4Reflection | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(false);

    const initMission = useCallback(async () => {
        if (!user?.id) return;

        // ── DEMO MODE ──────────────────────────────────────────
        if (isDemoMode) {
            setTeamRole(DEMO_MISSION4.teamRole);
            setMyTeam(DEMO_MISSION4.myTeam);
            setSubmissions(DEMO_MISSION4.submissions as any);
            setReflection(DEMO_MISSION4.reflection);
            setInitialized(true);
            return;
        }
        // ── END DEMO ───────────────────────────────────────────

        setLoading(true);
        try {
            const teamsRes = await fetch(`/api/classes/${user.class_id}/teams`);
            const teamsResult = await teamsRes.json();
            const teams: TeamData[] = teamsResult.data ?? [];

            const myTeamData = teams.find((t) =>
                t.team_members.some((m) => m.student_id === user.id)
            );

            if (myTeamData) {
                setMyTeam(myTeamData);
                const isLeader = myTeamData.leader_id === user.id;
                setTeamRole(isLeader ? "ketua" : "anggota");

                const [subRes, refRes] = await Promise.all([
                    fetch(`/api/mission4/${myTeamData.id}/submission`),
                    fetch(`/api/mission4/reflections/${user.id}`),
                ]);

                const subResult = await subRes.json();
                const refResult = await refRes.json();

                setSubmissions(subResult.data ?? []);
                setReflection(refResult.data);
            }
        } catch (err) {
            console.error("Error initMission 4:", err);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [user?.id, user?.class_id, isDemoMode]);

    useEffect(() => {
        initMission();
    }, [initMission]);

    const uploadDocumentation = async (files: { cloudinary_url: string; media_type: "foto" | "video" | "pdf"; caption?: string }[]) => {
        if (!myTeam) return { success: false, error: "Tim tidak ditemukan" };
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(800);
                const newSubs = files.map((f, i) => ({
                    id: `demo-sub-${Date.now()}-${i}`,
                    team_id: myTeam.id,
                    cloudinary_url: f.cloudinary_url,
                    media_type: f.media_type,
                    caption: f.caption || "",
                    created_at: new Date().toISOString(),
                }));
                setSubmissions((prev) => [...prev, ...newSubs as any]);
                return { success: true };
            }

            const res = await fetch(`/api/mission4/${myTeam.id}/upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ files }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setSubmissions(result.data);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const submitReflection = async (feeling: string, commitment: string) => {
        if (!user?.id || !myTeam) return { success: false, error: "Data tidak lengkap" };
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(700);
                setReflection({
                    id: `demo-ref-${Date.now()}`,
                    student_id: user.id,
                    team_id: myTeam.id,
                    feeling,
                    commitment,
                    created_at: new Date().toISOString(),
                } as any);
                return { success: true };
            }

            const res = await fetch(`/api/mission4/reflections/${user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ team_id: myTeam.id, feeling, commitment }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setReflection(result.data);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const completeMission = async () => {
        if (!user?.id) return { success: false, error: "User tidak ditemukan" };
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(800);
                return { success: true };
            }

            const res = await fetch(`/api/progress/${user.id}/mission/4`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "completed",
                    badge_earned: true,
                    completed_at: new Date().toISOString(),
                }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        initialized,
        loading,
        teamRole,
        myTeam,
        submissions,
        reflection,
        uploadDocumentation,
        submitReflection,
        completeMission,
        refresh: initMission,
    };
}
