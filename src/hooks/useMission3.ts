"use client";

import { useState, useEffect, useCallback } from "react";
import { Mission3Schedule, Mission3Task, TaskStatus, TeamRole } from "@/types/database";
import { TeamData } from "./useMission2";

export interface TaskWithUser extends Mission3Task {
    user?: { id: string; full_name: string };
}

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

    useEffect(() => {
        if (!studentId || !classId) return;
        setInitialized(false);
        initMission();
    }, [studentId, classId]);

    const initMission = useCallback(async () => {
        try {
            // Fetch tim siswa dari class
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
            const res = await fetch(`/api/mission3/${myTeam.id}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    scheduled_date: scheduledDate,
                    assigned_to: assignedTo,
                }),
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
            // Optimistic update
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));

            const res = await fetch(`/api/mission3/${myTeam.id}/tasks`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task_id: taskId, status }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            
            return { success: true };
        } catch (err: any) {
            // Revert on error
            await fetchScheduleAndTasks(myTeam.id);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const submitSchedule = async () => {
        if (!myTeam) return { success: false, error: "Tim tidak ditemukan" };
        setLoading(true);
        try {
            const res = await fetch(`/api/mission3/${myTeam.id}/submit`, {
                method: "POST",
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
        fetchScheduleAndTasks
    };
}
