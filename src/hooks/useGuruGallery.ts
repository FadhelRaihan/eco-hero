"use client";
import { useState, useEffect, useCallback } from "react";
import { GalleryItem, Comment } from "@/hooks/useGallery";
import { DEMO_GURU_GALLERY } from "@/lib/demo/mockData";

export function useGuruGallery(teacherId?: string) {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const isDemoMode = typeof window !== "undefined"
        ? localStorage.getItem("eco_guru_demo_mode") === "true"
        : false;

    const fetchGallery = useCallback(async () => {
        if (isDemoMode) {
            setItems(DEMO_GURU_GALLERY as unknown as GalleryItem[]);
            setLoading(false);
            return;
        }

        if (!teacherId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/guru/gallery?teacher_id=${teacherId}`);
            const result = await res.json();
            if (res.ok) {
                setItems(result.data ?? []);
            }
        } catch (err) {
            console.error("Error fetching guru gallery:", err);
        } finally {
            setLoading(false);
        }
    }, [teacherId, isDemoMode]);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const fetchComments = async (subId: string) => {
        if (isDemoMode) return [];

        try {
            const res = await fetch(`/api/mission4/submissions/${subId}/comments`);
            const result = await res.json();
            return result.data as Comment[];
        } catch (err) {
            console.error("Error fetching comments:", err);
            return [];
        }
    };

    return {
        items,
        loading,
        refresh: fetchGallery,
        fetchComments,
    };
}
