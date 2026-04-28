"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

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
    // Ref untuk track comments yang sedang dibuka (agar realtime bisa update)
    const openSubIdRef = useRef<string | null>(null);
    const setOpenCommentsRef = useRef<((fn: (prev: Comment[]) => Comment[]) => void) | null>(null);

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

    // ─── Supabase Realtime ────────────────────────────────────────────────────
    useEffect(() => {
        if (!classId) return;
        const supabase = createClient();

        const channel = supabase
            .channel(`gallery-realtime-${classId}`)

            // Like ditambah
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "mission4_gallery_likes",
                },
                (payload) => {
                    const subId = payload.new.submission_id as string;
                    setItems((prev) =>
                        prev.map((item) => {
                            if (item.id !== subId) return item;
                            // Kalau bukan like kita sendiri, naikkan count saja
                            const isMine = payload.new.student_id === studentId;
                            return {
                                ...item,
                                like_count: item.like_count + 1,
                                is_liked: isMine ? true : item.is_liked,
                            };
                        })
                    );
                }
            )

            // Like dihapus
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "mission4_gallery_likes",
                },
                (payload) => {
                    const subId = payload.old.submission_id as string;
                    setItems((prev) =>
                        prev.map((item) => {
                            if (item.id !== subId) return item;
                            const isMine = payload.old.student_id === studentId;
                            return {
                                ...item,
                                like_count: Math.max(0, item.like_count - 1),
                                is_liked: isMine ? false : item.is_liked,
                            };
                        })
                    );
                }
            )

            // Komentar baru
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "mission4_gallery_comments",
                },
                async (payload) => {
                    const subId = payload.new.submission_id as string;

                    // Naikkan comment_count di gallery list
                    setItems((prev) =>
                        prev.map((item) => {
                            if (item.id !== subId) return item;
                            return { ...item, comment_count: item.comment_count + 1 };
                        })
                    );

                    // Kalau dialog komentar untuk submission ini sedang terbuka,
                    // fetch data user lalu tambahkan ke list komentar
                    if (
                        openSubIdRef.current === subId &&
                        setOpenCommentsRef.current &&
                        payload.new.student_id !== studentId // jangan duplicate — kita sudah optimistic add
                    ) {
                        try {
                            const supabase2 = createClient();
                            const { data: userData } = await supabase2
                                .from("users")
                                .select("full_name")
                                .eq("id", payload.new.student_id)
                                .single();

                            const newComment: Comment = {
                                id: payload.new.id,
                                student_id: payload.new.student_id,
                                content: payload.new.content,
                                created_at: payload.new.created_at,
                                users: { full_name: userData?.full_name ?? "Siswa" },
                            };

                            setOpenCommentsRef.current((prev) => {
                                // Hindari duplikat
                                if (prev.some((c) => c.id === newComment.id)) return prev;
                                return [...prev, newComment];
                            });
                        } catch (e) {
                            console.error("Realtime comment user fetch error:", e);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [classId, studentId]);
    // ─────────────────────────────────────────────────────────────────────────

    const toggleLike = async (subId: string) => {
        if (!studentId) return;

        // Optimistic: flip is_liked saja — like_count dihandle Realtime (INSERT/DELETE event)
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== subId) return item;
                return { ...item, is_liked: !item.is_liked };
            })
        );

        try {
            const res = await fetch(`/api/mission4/submissions/${subId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId }),
            });
            if (!res.ok) {
                // Rollback jika gagal
                setItems((prev) =>
                    prev.map((item) => {
                        if (item.id !== subId) return item;
                        return { ...item, is_liked: !item.is_liked };
                    })
                );
            }
        } catch (err) {
            console.error("Error toggling like:", err);
            // Rollback
            setItems((prev) =>
                prev.map((item) => {
                    if (item.id !== subId) return item;
                    return { ...item, is_liked: !item.is_liked };
                })
            );
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
                body: JSON.stringify({ studentId, content }),
            });
            const result = await res.json();
            if (res.ok) {
                // comment_count akan naik dari Realtime INSERT event
                return result.data as Comment;
            }
        } catch (err) {
            console.error("Error adding comment:", err);
        }
        return null;
    };

    /**
     * Dipanggil dari galeri page saat dialog detail dibuka/ditutup,
     * agar Realtime tahu perlu inject komentar baru ke state mana.
     */
    const registerOpenDialog = (
        subId: string | null,
        setCommentsFn: ((fn: (prev: Comment[]) => Comment[]) => void) | null
    ) => {
        openSubIdRef.current = subId;
        setOpenCommentsRef.current = setCommentsFn;
    };

    return {
        items,
        loading,
        refresh: fetchGallery,
        toggleLike,
        fetchComments,
        addComment,
        registerOpenDialog,
    };
}
