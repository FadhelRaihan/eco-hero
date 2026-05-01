"use client";

import { useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGuruForum } from "@/hooks/useGuruForum";
import { useRealtime } from "@/hooks/useRealtime";
import { cn } from "@/lib/utils";
import { MessageCircleQuestion, MessagesSquare, Loader2 } from "lucide-react";

const TOPIC_LABEL: Record<string, string> = {
    sampah: "Sampah",
    kendaraan: "Kendaraan",
};

const TOPIC_COLOR: Record<string, string> = {
    sampah: "bg-[#F9FFA4] text-[#7A7200]",
    kendaraan: "bg-[#B4FF9F] text-[#1A5C0A]",
};

const AVATAR_COLORS = [
    "bg-[#B4FF9F] text-[#1A5C0A]",
    "bg-[#F9FFA4] text-[#7A7200]",
    "bg-[#FFD59E] text-[#6B3A00]",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
];

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

export default function GuruForumPage() {
    const { user } = useAuth();
    const { posts, loading, classId, refresh } = useGuruForum(user?.id);
    const listRef = useRef<HTMLDivElement>(null);

    // Refresh realtime jika ada post baru
    useRealtime({
        table: "mission1_forum_posts",
        filter: classId ? `class_id=eq.${classId}` : undefined,
        onInsert: () => {
            refresh();
        },
    });

    // Otomatis scroll ke bawah (opsional, jika urutan asending. Jika descending biarkan diam)
    useEffect(() => {
        // Jika kita merender post terbaru di atas, maka tidak perlu auto-scroll ke bawah
    }, [posts]);

    const uniqueStudents = new Set(posts.map((p) => p.student_id)).size;

    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF1]">
            {/* Header */}
            <div className="px-4 md:px-8 lg:px-26 pt-20 lg:pt-24 pb-12">
                <p className="text-[10px] font-bold text-[#1A5C0A] uppercase tracking-widest mb-3">
                    Pantauan Kelas · Curah Pendapat
                </p>
                <h1 className="text-xl lg:text-3xl font-extrabold text-[#1A5C0A] flex items-center gap-3 mb-3">
                    <span className="text-3xl"><MessagesSquare className="w-6 h-6 lg:w-8 lg:h-8" /></span> Forum Diskusi Misi 1
                </h1>
                <p className="text-xs lg:text-sm text-[#1A5C0A]/70 leading-relaxed mb-6 max-w-lg font-medium">
                    Pantau secara langsung perdebatan, ide, dan perspektif lingkungan serta sosial dari anak didik Anda.
                </p>
                
                <div className="flex gap-3 flex-wrap">
                    <div className="bg-white/50 backdrop-blur-sm border border-[#1A5C0A]/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                        <MessageCircleQuestion className="w-4 h-4 text-[#1A5C0A]" />
                        <span className="text-xs font-bold text-[#1A5C0A]">{posts.length} Pendapat Total</span>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm border border-[#1A5C0A]/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold text-[#1A5C0A]">Siaran Langsung (Live)</span>
                    </div>
                </div>
            </div>

            {/* Forum Container */}
            <div className="flex-1 px-4 md:px-8 lg:px-26 py-4 pb-24">
                <div className="rounded-2xl border border-[#D4EFD0] bg-white flex flex-col min-h-[60vh] max-h-[80vh] overflow-hidden shadow-sm">
                    {/* Forum Header Bar */}
                    <div className="px-5 py-4 bg-[#F0FFF0] border-b border-[#D4EFD0] flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <MessageCircleQuestion className="w-4 h-4 text-[#1A5C0A]" />
                            </div>
                            <span className="text-sm font-extrabold text-[#1A5C0A] tracking-tight">
                                Live Forum Siswa
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-[#333333]/60 bg-white/60 px-3 py-1.5 rounded-full border border-[#D4EFD0]">
                            <span>{uniqueStudents} siswa telah berkontribusi</span>
                        </div>
                    </div>

                    {/* Posts List */}
                    <div
                        ref={listRef}
                        className="flex-1 overflow-y-auto px-5 py-6 bg-[#FAFAFA]"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-8 h-8 text-[#1A5C0A] animate-spin" />
                                <span className="text-xs font-bold text-gray-400">Menarik data forum...</span>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center flex flex-col items-center justify-center py-20 opacity-50 gap-3">
                                <MessagesSquare className="w-12 h-12 text-gray-400" />
                                <p className="text-sm font-bold text-[#333333]/50">
                                    Belum ada siswa yang menyuarakan pendapatnya.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5">
                                {posts.map((post) => {
                                    const avatarColor = AVATAR_COLORS[
                                        (post.users?.full_name?.charCodeAt(0) || 0) % AVATAR_COLORS.length
                                    ];
                                    
                                    const topicLabel = TOPIC_LABEL[post.case_topic] || post.case_topic;
                                    const topicColor = TOPIC_COLOR[post.case_topic] || "bg-gray-200 text-gray-700";

                                    return (
                                        <div key={post.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {/* Avatar */}
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 shadow-sm border-2 border-white",
                                                avatarColor
                                            )}>
                                                {getInitials(post.users?.full_name || "?")}
                                            </div>

                                            <div className="flex-1 min-w-0 bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                                {/* Name row */}
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <span className="text-xs font-black text-[#333333]">
                                                        {post.users?.full_name || "Tanpa Nama"}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest",
                                                        topicColor
                                                    )}>
                                                        {topicLabel}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 ml-auto">
                                                        {timeAgo(post.created_at)}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="text-sm text-gray-700 leading-relaxed font-medium">
                                                    <p>
                                                        {post.perspective_env}
                                                        {post.perspective_soc && post.perspective_soc !== post.perspective_env && (
                                                            <> {post.perspective_soc}</>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer bar for teacher */}
                    <div className="bg-[#F7FFF4] border-t border-[#DDDDDD] px-5 py-4 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Anda sedang dalam Mode Pemantauan (Read-Only)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
