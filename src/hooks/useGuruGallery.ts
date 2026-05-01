"use client";
import { useState, useEffect, useCallback } from "react";
import { GalleryItem, Comment } from "@/hooks/useGallery";

export function useGuruGallery(teacherId?: string) {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGallery = useCallback(async () => {
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
    }, [teacherId]);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const fetchComments = async (subId: string) => {
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
