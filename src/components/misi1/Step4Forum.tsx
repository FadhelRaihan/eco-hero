"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonal, Crown, MessageCircleQuestion, Loader2, Check } from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";
import { cn } from "@/lib/utils";

type CaseTopic = "plastik_kantin" | "alih_fungsi_lahan" | "pencemaran_air";

const TOPIC_LABEL: Record<CaseTopic, string> = {
    plastik_kantin: "Kantin",
    alih_fungsi_lahan: "Lahan",
    pencemaran_air: "Sungai",
};

const TOPIC_COLOR: Record<CaseTopic, string> = {
    plastik_kantin: "bg-[#F9FFA4] text-[#7A7200]",
    alih_fungsi_lahan: "bg-[#B4FF9F] text-[#1A5C0A]",
    pencemaran_air: "bg-blue-100 text-blue-700",
};

function timeAgo(dateStr: string) {
    const utcStr = dateStr.endsWith("Z") || dateStr.includes("+")
        ? dateStr
        : dateStr + "Z";

    const date = new Date(utcStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 0) return "Baru saja";

    const secs = Math.floor(diff / 1000);
    if (secs < 60) return "Baru saja";

    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins} mnt lalu`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;

    return `${Math.floor(hours / 24)} hari lalu`;
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
    "bg-[#B4FF9F] text-[#1A5C0A]",
    "bg-[#F9FFA4] text-[#7A7200]",
    "bg-[#FFD59E] text-[#6B3A00]",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
];

interface Step4ForumProps {
    classId: string;
    studentId: string;
    selectedTopic: CaseTopic;
    posts: any[];
    loadingPosts: boolean;
    hasPosted: boolean;
    submitting: boolean;
    onSubmitPost: (data: {
        case_topic: CaseTopic;
        perspective_env: string;
        perspective_soc: string;
    }) => Promise<{ success: boolean; error?: string }>;
    onComplete: () => Promise<void>;
    onFetchPosts: () => void;
}

export default function Step4Forum({
    classId,
    studentId,
    selectedTopic,
    posts,
    loadingPosts,
    hasPosted,
    submitting,
    onSubmitPost,
    onComplete,
    onFetchPosts,
}: Step4ForumProps) {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [completing, setCompleting] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    useRealtime({
        table: "mission1_forum_posts",
        filter: `class_id=eq.${classId}`,
        onInsert: () => {
            onFetchPosts();
        },
    });

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [posts]);

    async function handleSend() {
        if (!input.trim() || hasPosted) return;
        if (input.trim().length < 20) {
            setError("Pendapat minimal 20 karakter");
            return;
        }

        setError("");
        const midpoint = Math.ceil(input.length / 2);
        const result = await onSubmitPost({
            case_topic: selectedTopic,
            perspective_env: input.slice(0, midpoint).trim() || input,
            perspective_soc: input.slice(midpoint).trim() || input,
        });

        if (!result.success) {
            setError(result.error ?? "Gagal mengirim");
        } else {
            setInput("");
        }
    }

    async function handleComplete() {
        setCompleting(true);
        try {
            await onComplete();
        } catch (err) {
            console.error("handleComplete error:", err);
        } finally {
            setCompleting(false);
        }
    }

    const uniqueStudents = new Set(posts.map((p) => p.student_id)).size;

    return (
        <div className="flex-1 flex flex-col min-h-0 py-6">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#B4FF9F] flex items-center justify-center">
                    <span className="text-[#1A5C0A] font-bold text-lg">4</span>
                </div>
                <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                    Forum Dilema Kelas
                </h2>
            </div>

            {/* Forum container */}
            <div className="rounded-2xl border border-[#D4EFD0] bg-white flex flex-col min-h-0 overflow-hidden">
                {/* Forum header bar */}
                <div className="px-3 sm:px-5 py-3 bg-[#F0FFF0] border-b border-[#D4EFD0] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                            <MessageCircleQuestion className="w-6 h-6 text-[#1A5C0A]" />
                        </div>
                        <span className="text-xs font-semibold text-[#1A5C0A]">
                            Diskusi Kelas
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-[#FFA1A1] text-[#8A1A1A] text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#8A1A1A] animate-pulse" />
                            LIVE
                        </div>
                        <span className="text-sm text-[#333333]/50">
                            {uniqueStudents} pendapat masuk
                        </span>
                    </div>
                </div>

                {/* Posts list */}
                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 min-h-[180px] max-h-[400px]"
                >
                    {loadingPosts ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-[#B4FF9F] border-t-transparent rounded-full" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-[#333333]/40">
                                Belum ada yang posting. Jadilah yang pertama!
                            </p>
                        </div>
                    ) : (
                        posts.map((post) => {
                            const isOwn = post.student_id === studentId;
                            const avatarColor =
                                AVATAR_COLORS[
                                post.users.full_name.charCodeAt(0) % AVATAR_COLORS.length
                                ];
                            return (
                                <div key={post.id} className="flex gap-3">
                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                                        avatarColor
                                    )}>
                                        {getInitials(post.users.full_name)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Name row */}
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-xs font-bold text-[#333333]">
                                                {post.users.full_name}
                                            </span>
                                            <span className={cn(
                                                "text-[9px] font-bold px-2 py-0.5 rounded-full",
                                                TOPIC_COLOR[post.case_topic as CaseTopic]
                                            )}>
                                                {TOPIC_LABEL[post.case_topic as CaseTopic]}
                                            </span>
                                            {isOwn && (
                                                <span className="text-[9px] bg-[#B4FF9F] text-[#1A5C0A] font-bold px-2 py-0.5 rounded-full">
                                                    Kamu
                                                </span>
                                            )}
                                            <span className="text-xs text-[#333333]/50 ml-auto">
                                                {timeAgo(post.created_at)}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <p className="text-sm text-[#333333]/80 leading-relaxed">
                                            {post.perspective_env}
                                            {post.perspective_soc &&
                                                post.perspective_soc !== post.perspective_env && (
                                                    <> {post.perspective_soc}</>
                                                )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input bar */}
                <div className="bg-[#F7FFF4] border-t border-[#DDDDDD] px-3 py-3">
                    {!hasPosted ? (
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    if (error) setError("");
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Tulis pendapatmu tentang isu yang kamu pilih..."
                                className="flex-1 h-11 px-4 rounded-xl bg-white border border-[#333333]/15 text-sm focus:outline-none focus:border-[#1A5C0A]/40 transition-colors"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || submitting}
                                className={cn(
                                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0 cursor-pointer",
                                    input.trim()
                                        ? "bg-[#B4FF9F] text-[#1A5C0A] hover:bg-[#9AEF85]"
                                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                )}
                            >
                                {submitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <SendHorizonal size={20} />
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-[#B4FF9F]/20 rounded-xl px-4 py-2.5 text-sm sm:text-base">
                            <Check size={20} className="text-[#1A5C0A] flex-shrink-0" /> Pendapatmu sudah terkirim ke forum
                        </div>
                    )}

                    {error && <p className="text-xs text-[#8A1A1A] mt-2 pl-1">{error}</p>}
                </div>
            </div>

            <div className="pt-4 pb-6 mt-2">
                <button
                    onClick={handleComplete}
                    disabled={!hasPosted || completing}
                    className={cn(
                        "w-full py-3 sm:py-2 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer",
                        hasPosted
                            ? "bg-[#B4FF9F] text-[#1A5C0A] border-2 border-[#1A5C0A]/60 hover:bg-[#9AEF85]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    {completing ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            Selesaikan Misi & Dapatkan Lencana
                            <Crown size={24} className="text-[#FF9100]" />
                        </>
                        )}
                </button>
            </div>
        </div>
    );
}