"use client";

import { useState, useEffect, useCallback } from "react";
import { CaseTopic } from "@/lib/mission-data";
import { DEMO_MISSION2, DEMO_BRAINSTORMING } from "@/lib/demo/mockData";

type TeamRole = "ketua" | "anggota" | "belum_pilih";
type Mission2Step = 1 | 2 | 3;

export interface TeamMember {
    student_id: string;
    users: { id: string; full_name: string };
}

export interface TeamData {
    id: string;
    name: string;
    selected_case: CaseTopic;
    leader_id: string;
    users: { id: string; full_name: string };
    team_members: TeamMember[];
}

export interface StudentData {
    student_id: string;
    team_role: TeamRole;
    users: { id: string; full_name: string };
}

export interface BrainstormingData {
    env_problem: string;
    social_problem: string;
    solution: string;
    solution_reason: string;
    action_type: string;
    action_name: string;
    materials: string;
    target_audience: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useMission2(
    studentId: string,
    classId: string,
    initialTeamRole: TeamRole
) {
    const [currentStep, setCurrentStep] = useState<Mission2Step>(1);
    const [teamRole, setTeamRole] = useState<TeamRole>(initialTeamRole);
    const [myTeam, setMyTeam] = useState<TeamData | null>(null);
    const [allStudents, setAllStudents] = useState<StudentData[]>([]);
    const [allTeams, setAllTeams] = useState<TeamData[]>([]);
    const [brainstorming, setBrainstorming] = useState<BrainstormingData | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(false);

    const isDemoMode = typeof window !== "undefined"
        ? localStorage.getItem("eco_demo_mode") === "true"
        : false;

    useEffect(() => {
        if (!studentId || !classId) return;
        setInitialized(false);

        // ── DEMO MODE ──────────────────────────────────────────
        if (isDemoMode) {
            setCurrentStep(DEMO_MISSION2.currentStep);
            setTeamRole(DEMO_MISSION2.teamRole);
            setMyTeam(DEMO_MISSION2.myTeam);
            setAllStudents(DEMO_MISSION2.availableStudents);
            setAllTeams(DEMO_MISSION2.allTeams);
            setBrainstorming(DEMO_MISSION2.brainstorming);
            setInitialized(true);
            return;
        }
        // ── END DEMO ───────────────────────────────────────────

        initMission();
    }, [studentId, classId]);

    async function initMission() {
        try {
            const [studentsRes, teamsRes, progressRes] = await Promise.all([
                fetch(`/api/classes/${classId}/students`),
                fetch(`/api/classes/${classId}/teams`),
                fetch(`/api/progress/${studentId}/mission/2`),
            ]);

            const [studentsResult, teamsResult, progressResult] = await Promise.all([
                studentsRes.json(),
                teamsRes.json(),
                progressRes.json(),
            ]);

            const students: StudentData[] = studentsResult.data ?? [];
            const teams: TeamData[] = teamsResult.data ?? [];

            setAllStudents(students);
            setAllTeams(teams);

            const myTeamData = teams.find((t) =>
                t.team_members.some((m) => m.student_id === studentId)
            );

            if (myTeamData) {
                setMyTeam(myTeamData);
                const isLeader = myTeamData.leader_id === studentId;
                setTeamRole(isLeader ? "ketua" : "anggota");

                const step = (progressResult.data?.mission2_step ?? 1) as Mission2Step;
                setCurrentStep(step);

                if (step === 3) {
                    const brainRes = await fetch(`/api/mission2/${myTeamData.id}`);
                    const brainResult = await brainRes.json();
                    if (brainRes.ok) setBrainstorming(brainResult.data);
                }
            } else {
                setTeamRole("belum_pilih");
                setCurrentStep(1);
            }
        } catch (err) {
            console.error("initMission error:", err);
        } finally {
            setInitialized(true);
        }
    }

    const fetchTeams = useCallback(async () => {
        if (!classId || isDemoMode) return;
        const res = await fetch(`/api/classes/${classId}/teams`);
        const result = await res.json();
        if (res.ok) {
            const teams: TeamData[] = result.data ?? [];
            setAllTeams(teams);
            const myTeamData = teams.find((t) =>
                t.team_members.some((m) => m.student_id === studentId)
            );
            setMyTeam(myTeamData ?? null);
        }
    }, [classId, studentId]);

    const fetchStudents = useCallback(async () => {
        if (!classId || isDemoMode) return;
        const res = await fetch(`/api/classes/${classId}/students`);
        const result = await res.json();
        if (res.ok) setAllStudents(result.data ?? []);
    }, [classId]);

    const syncProgress = useCallback(async () => {
        if (!studentId || isDemoMode) return;
        try {
            const res = await fetch(`/api/progress/${studentId}/mission/2`);
            const result = await res.json();
            if (res.ok && result.data) {
                const step = (result.data.mission2_step ?? 1) as Mission2Step;
                setCurrentStep(step);
            }
        } catch (err) {
            console.error("Gagal sync progress:", err);
        }
    }, [studentId]);

    const fetchBrainstorming = useCallback(async () => {
        if (!myTeam || isDemoMode) return;
        try {
            const res = await fetch(`/api/mission2/${myTeam.id}`);
            const result = await res.json();
            if (res.ok) setBrainstorming(result.data);
        } catch (err) {
            console.error("Gagal fetch brainstorming:", err);
        }
    }, [myTeam]);

    async function advanceStep(nextStep: Mission2Step) {
        setCurrentStep(nextStep);
        if (isDemoMode) return;
        await fetch(`/api/progress/${studentId}/mission/2`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mission2_step: nextStep }),
        });
    }

    async function createTeam(name: string, selectedCase: CaseTopic) {
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(700);
                // Simulasi: update local state dengan tim baru
                const newTeam: TeamData = {
                    id: `demo-team-${Date.now()}`,
                    name,
                    selected_case: selectedCase,
                    leader_id: studentId,
                    users: { id: studentId, full_name: "Andi Pratama (Demo)" },
                    team_members: [{ student_id: studentId, users: { id: studentId, full_name: "Andi Pratama (Demo)" } }],
                };
                setMyTeam(newTeam);
                setTeamRole("ketua");
                setAllTeams((prev) => [...prev, newTeam]);
                return { success: true };
            }

            const res = await fetch(`/api/classes/${classId}/teams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, selected_case: selectedCase, leader_id: studentId }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setTeamRole("ketua");
            await fetchTeams();
            await fetchStudents();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }

    async function addMember(memberId: string) {
        if (!myTeam) return { success: false, error: "Tim tidak ditemukan" };
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(500);
                const newMember = allStudents.find((s) => s.student_id === memberId);
                if (newMember) {
                    setMyTeam((prev) => prev ? {
                        ...prev,
                        team_members: [...prev.team_members, { student_id: memberId, users: newMember.users }]
                    } : prev);
                    setAllStudents((prev) => prev.filter((s) => s.student_id !== memberId));
                }
                return { success: true };
            }

            const res = await fetch(`/api/classes/${classId}/teams/${myTeam.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ add_student_id: memberId }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            await fetchTeams();
            await fetchStudents();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }

    async function removeMember(memberId: string) {
        if (!myTeam || memberId === studentId) return;
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(400);
                setMyTeam((prev) => prev ? {
                    ...prev,
                    team_members: prev.team_members.filter((m) => m.student_id !== memberId)
                } : prev);
                return;
            }

            await fetch(`/api/classes/${classId}/teams/${myTeam.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ remove_student_id: memberId }),
            });
            await fetchTeams();
            await fetchStudents();
        } finally {
            setLoading(false);
        }
    }

    async function saveBrainstorming(data: BrainstormingData) {
        if (!myTeam) return { success: false, error: "Tim tidak ditemukan" };
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(700);
                setBrainstorming(data);
                return { success: true };
            }

            const res = await fetch(`/api/mission2/${myTeam.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setBrainstorming(result.data);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }

    async function completeMission() {
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(800);
                return { success: true };
            }

            const res = await fetch(`/api/progress/${studentId}/mission/2`, {
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
        } catch {
            return { success: false };
        } finally {
            setLoading(false);
        }
    }

    const availableStudents = allStudents.filter((s) =>
        (s.team_role === "belum_pilih" || !s.team_role) && s.student_id !== studentId
    );
    const myTeamMembers = myTeam?.team_members ?? [];

    return {
        initialized,
        currentStep,
        teamRole,
        myTeam,
        myTeamMembers,
        availableStudents,
        allTeams,
        brainstorming,
        loading,
        advanceStep,
        createTeam,
        addMember,
        removeMember,
        saveBrainstorming,
        completeMission,
        fetchTeams,
        fetchStudents,
        fetchBrainstorming,
        syncProgress,
    };
}