"use client";

import { useState, useEffect, useCallback } from "react";
import { Mission3Schedule, Mission3Task, TaskStatus, TeamRole } from "@/types/database";
import { TeamData } from "./useMission2";
import { DEMO_MISSION3 } from "@/lib/demo/mockData";

export interface TaskWithUser extends Mission3Task {
    user?: { id: string; full_name: string };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useMission3(
    studentId: string,
    classId: string,
    initialTeamRole: TeamRole
) {
    const [teamRole, setTeamRole] = useState<TeamRole>(initialTeamRole);
    const [myTeam, setMyTeam] = useState<TeamData | null>(null);
    const [schedule, setSchedule] = useState<Mission3Schedule | null>(null);
    const [tasks, setTasks] = useState<TaskWithUser[]>([]);
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
            setTeamRole(DEMO_MISSION3.teamRole);
            setMyTeam(DEMO_MISSION3.myTeam);
            setSchedule(DEMO_MISSION3.schedule as any);
            setTasks(DEMO_MISSION3.tasks as any);
            setInitialized(true);
            return;
        }
        // ── END DEMO ───────────────────────────────────────────

        initMission();
    }, [studentId, classId]);

    const initMission = useCallback(async () => {
        try {
            const teamsRes = await fetch(`/api/classes/${classId}/teams`);
            const teamsResult = await teamsRes.json();
            const teams: TeamData[] = teamsResult.data ?? [];

            const myTeamData = teams.find((t) =>
                t.team_members.some((m) => m.student_id === studentId)
            );

            if (myTeamData) {
                setMyTeam(myTeamData);
                const isLeader = myTeamData.leader_id === studentId;
                setTeamRole(isLeader ? "ketua" : "anggota");
                await fetchScheduleAndTasks(myTeamData.id);
            } else {
                setTeamRole("belum_pilih");
            }
        } catch (err) {
            console.error("initMission error:", err);
        } finally {
            setInitialized(true);
        }
    }, [classId, studentId]);

    const fetchScheduleAndTasks = async (teamId: string) => {
        try {
            const [scheduleRes, tasksRes] = await Promise.all([
                fetch(`/api/mission3/${teamId}/schedule`),
                fetch(`/api/mission3/${teamId}/tasks`),
            ]);
            const scheduleResult = await scheduleRes.json();
            const tasksResult = await tasksRes.json();
            setSchedule(scheduleResult.data);
            setTasks(tasksResult.data ?? []);
        } catch (err) {
            console.error("fetchScheduleAndTasks error:", err);
        }
    };

    const addTask = async (title: string, scheduledDate: string, assignedTo: string) => {
        if (!myTeam) return { success: false, error: "Tim tidak ditemukan" };
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(600);
                const member = myTeam.team_members.find((m) => m.student_id === assignedTo);
                const newTask: TaskWithUser = {
                    id: `demo-task-${Date.now()}`,
                    team_id: myTeam.id,
                    title,
                    scheduled_date: scheduledDate,
                    assigned_to: assignedTo,
                    status: "berjalan",
                    user: member ? { id: member.student_id, full_name: member.users.full_name } : undefined,
                } as any;
                setTasks((prev) => [...prev, newTask]);
                return { success: true };
            }

            const res = await fetch(`/api/mission3/${myTeam.id}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, scheduled_date: scheduledDate, assigned_to: assignedTo }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            await fetchScheduleAndTasks(myTeam.id);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
        if (!myTeam) return { success: false, error: "Tim tidak ditemukan" };
        setLoading(true);
        try {
            // Optimistic update (berlaku juga di demo mode)
            setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));

            if (isDemoMode) {
                await sleep(400);
                return { success: true };
            }

            const res = await fetch(`/api/mission3/${myTeam.id}/tasks`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task_id: taskId, status }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            return { success: true };
        } catch (err: any) {
            if (!isDemoMode) await fetchScheduleAndTasks(myTeam.id);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const submitSchedule = async () => {
        if (!myTeam) return { success: false, error: "Tim tidak ditemukan" };
        setLoading(true);
        try {
            if (isDemoMode) {
                await sleep(800);
                setSchedule((prev) => prev ? { ...prev, submitted: true } : prev);
                return { success: true };
            }

            const res = await fetch(`/api/mission3/${myTeam.id}/submit`, { method: "POST" });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            await fetchScheduleAndTasks(myTeam.id);
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
        schedule,
        tasks,
        addTask,
        updateTaskStatus,
        submitSchedule,
        fetchScheduleAndTasks,
    };
}
