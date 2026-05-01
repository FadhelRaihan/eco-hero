import { useState, useEffect, useCallback } from "react";
import { DEMO_GURU_FORUM, DEMO_GURU_CLASS } from "@/lib/demo/mockData";

export interface ForumPost {
    id: string;
    case_topic: string;
    perspective_env: string;
    perspective_soc: string;
    created_at: string;
    student_id: string;
    users: { id: string; full_name: string };
    mission1_forum_comments?: { count: number }[];
}

export function useGuruForum(teacherId?: string) {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [classId, setClassId] = useState<string | null>(null);

    const isDemoMode = typeof window !== "undefined"
        ? localStorage.getItem("eco_guru_demo_mode") === "true"
        : false;

    const fetchPosts = useCallback(async () => {
        if (isDemoMode) {
            setPosts(DEMO_GURU_FORUM as unknown as ForumPost[]);
            setClassId(DEMO_GURU_CLASS.id);
            setLoading(false);
            return;
        }

        if (!teacherId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/guru/forum?teacher_id=${teacherId}`);
            const result = await res.json();
            if (res.ok) {
                setPosts(result.data ?? []);
                setClassId(result.classId ?? null);
            }
        } catch (err) {
            console.error("Error fetching guru forum:", err);
        } finally {
            setLoading(false);
        }
    }, [teacherId, isDemoMode]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        loading,
        classId,
        refresh: fetchPosts,
    };
}
