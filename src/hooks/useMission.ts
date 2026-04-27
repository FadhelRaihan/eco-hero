"use client";

import { useState, useEffect } from "react";
import type { MissionProgress } from "@/types/database";

export function useMissionProgress(studentId: string | undefined) {
    const [missions, setMissions] = useState<MissionProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) return;

        async function fetchProgress() {
            try {
                const res = await fetch(`/api/progress/${studentId}`);
                const result = await res.json();
                if (res.ok) setMissions(result.data ?? []);
            } finally {
                setLoading(false);
            }
        }

        fetchProgress();
    }, [studentId]);

    const badgeCount = missions.filter((m) => m.badge_earned).length;
    const completedCount = missions.filter((m) => m.status === "completed").length;
    const currentMission = missions.find((m) => m.status === "in_progress");

    // Pre-test harus terbuka (in_progress) secara default untuk siswa baru
    const pretestStatus = (missions.find(m => m.mission_number === 1) as any)?.pretest_status || 'in_progress';
    const posttestStatus = (missions.find(m => m.mission_number === 4) as any)?.posttest_status || 'locked';

    return { 
        missions, 
        loading, 
        badgeCount, 
        completedCount, 
        currentMission,
        pretestStatus,
        posttestStatus
    };
}