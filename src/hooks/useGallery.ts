"use client";
import { useState, useEffect, useCallback } from "react";

export interface GalleryItem {
    id: string;
    team_id: string;
    team_name: string;
    selected_case: string;
    cloudinary_url: string;
    media_type: "foto" | "video" | "pdf";
    caption?: string;
    like_count: number;
    comment_count: number;
    is_liked: boolean;
    uploaded_at: string;
}

export interface Comment {
    id: string;
    student_id: string;
    content: string;
    created_at: string;
    users: {
        full_name: string;
    };
}

export function useGallery(classId?: string, studentId?: string) {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGallery = useCallback(async () => {
        if (!classId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/mission4/gallery/${classId}?studentId=${studentId || ""}`);
            const result = await res.json();
            if (res.ok) setItems(result.data ?? []);
        } catch (err) {
            console.error("Error fetching gallery:", err);
        } finally {
            setLoading(false);
        }
    }, [classId, studentId]);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const toggleLike = async (subId: string) => {
        if (!studentId) return;
        try {
            const res = await fetch(`/api/mission4/submissions/${subId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId })
            });
            const result = await res.json();
            if (res.ok) {
                setItems(prev => prev.map(item => {
                    if (item.id === subId) {
                        return {
                            ...item,
                            is_liked: result.liked,
                            like_count: result.liked ? item.like_count + 1 : item.like_count - 1
                        };
                    }
                    return item;
                }));
            }
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

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

    const addComment = async (subId: string, content: string) => {
        if (!studentId || !content) return null;
        try {
            const res = await fetch(`/api/mission4/submissions/${subId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, content })
            });
            const result = await res.json();
            if (res.ok) {
                // Update comment count in items list
                setItems(prev => prev.map(item => {
                    if (item.id === subId) {
                        return { ...item, comment_count: item.comment_count + 1 };
                    }
                    return item;
                }));
                return result.data as Comment;
            }
        } catch (err) {
            console.error("Error adding comment:", err);
        }
        return null;
    };

    return {
        items,
        loading,
        refresh: fetchGallery,
        toggleLike,
        fetchComments,
        addComment
    };
}
