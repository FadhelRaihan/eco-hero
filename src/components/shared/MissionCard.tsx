import Link from "next/link";
import { Search, Cog, Clock, Leaf, Lock, CheckCircle, PlayCircle, ClipboardCheck, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export type MissionProgress = {
    id: "pretest" | "misi1" | "misi2" | "misi3" | "misi4" | "posttest";
    status: "locked" | "in_progress" | "completed";
    progress?: number | null;
    completed_at?: string | null;
    started_at?: string | null;
};

const MISSION_CONFIG = [
    {
        id: "pretest",
        number: 0,
        title: "Pemanasan",
        subtitle: "Pemanasan awal sebelum mulai",
        icon: ClipboardCheck,
        color: {
            bg: "bg-[#FFF9C4]",
            border: "border-[#FBC02D]/30",
            icon: "bg-white/60 text-[#FBC02D]",
            title: "text-[#F57F17]",
            sub: "text-[#F57F17]/70",
            badge: "bg-white/70 text-[#F57F17]",
            locked: "opacity-50",
        },
        href: "/test/pretest",
    },
    {
        id: "misi1",
        number: 1,
        title: "Sang Penyelidik",
        subtitle: "Investigasi isu lingkungan",
        icon: Search,
        color: {
            bg: "bg-[#B4FF9F]",
            border: "border-[#1A5C0A]/30",
            icon: "bg-white/60 text-[#1A5C0A]",
            title: "text-[#1A5C0A]",
            sub: "text-[#1A5C0A]/70",
            badge: "bg-white/70 text-[#1A5C0A]",
            locked: "opacity-50",
        },
        href: "/misi/1",
    },
    {
        id: "misi2",
        number: 2,
        title: "Arsitek Solusi",
        subtitle: "Bentuk tim & rancang solusi",
        icon: Cog,
        color: {
            bg: "bg-[#F9FFA4]",
            border: "border-[#7A7200]/30",
            icon: "bg-white/60 text-[#7A7200]",
            title: "text-[#7A7200]",
            sub: "text-[#7A7200]/70",
            badge: "bg-white/70 text-[#7A7200]",
            locked: "opacity-50",
        },
        href: "/misi/2",
    },
    {
        id: "misi3",
        number: 3,
        title: "Sang Pengatur Waktu",
        subtitle: "Susun jadwal proyek tim",
        icon: Clock,
        color: {
            bg: "bg-[#FFD59E]",
            border: "border-[#6B3A00]/30",
            icon: "bg-white/60 text-[#6B3A00]",
            title: "text-[#6B3A00]",
            sub: "text-[#6B3A00]/70",
            badge: "bg-white/70 text-[#6B3A00]",
            locked: "opacity-50",
        },
        href: "/misi/3",
    },
    {
        id: "misi4",
        number: 4,
        title: "Aksi Nyata",
        subtitle: "Laksanakan proyek & refleksi",
        icon: Leaf,
        color: {
            bg: "bg-[#FFA1A1]",
            border: "border-[#8A1A1A]/30",
            icon: "bg-white/60 text-[#8A1A1A]",
            title: "text-[#8A1A1A]",
            sub: "text-[#8A1A1A]/70",
            badge: "bg-white/70 text-[#8A1A1A]",
            locked: "opacity-50",
        },
        href: "/misi/4",
    },
    {
        id: "posttest",
        number: 5,
        title: "Bos Akhir",
        subtitle: "Tantangan terakhir perjalanan",
        icon: GraduationCap,
        color: {
            bg: "bg-[#C5CAE9]",
            border: "border-[#3F51B5]/30",
            icon: "bg-white/60 text-[#3F51B5]",
            title: "text-[#1A237E]",
            sub: "text-[#1A237E]/70",
            badge: "bg-white/70 text-[#1A237E]",
            locked: "opacity-50",
        },
        href: "/test/posttest",
    },
];

export interface MissionCardProps {
    progress?: any;
    missionNumber: number | string;
    variant?: "compact" | "full";
}

export default function MissionCard({
    progress,
    missionNumber,
    variant = "full",
}: MissionCardProps) {
    const config = typeof missionNumber === "number" 
        ? MISSION_CONFIG.find(m => m.number === missionNumber)
        : MISSION_CONFIG.find(m => m.id === missionNumber);

    if (!config) return null;

    const Icon = config.icon;
    const status = progress?.status || (typeof missionNumber === 'string' ? (progress?.status || 'locked') : 'locked');
    
    // Khusus untuk pretest/posttest jika status belum ada di DB
    const isLocked = status === "locked";
    const isDone = status === "completed";

    const card = (
        <div
            className={cn(
                "rounded-2xl border-2 p-3 sm:p-4 transition-all w-full flex flex-col justify-between min-h-[80px]",
                config.color.bg,
                config.color.border,
                isLocked && config.color.locked,
                !isLocked && "hover:scale-[1.02] cursor-pointer"
            )}
        >
            <div className="flex items-start gap-2 sm:gap-3">
                {/* Icon */}
                <div
                    className={cn(
                        "rounded-xl flex items-center justify-center flex-shrink-0",
                        config.color.icon,
                        variant === "full"
                            ? "w-9 h-9 sm:w-11 sm:h-11"
                            : "w-8 h-8 sm:w-9 sm:h-9"
                    )}
                >
                    <Icon size={variant === "full" ? 18 : 16} className="sm:hidden" />
                    <Icon size={variant === "full" ? 22 : 18} className="hidden sm:block" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide opacity-60">
                        {config.number === 0 || config.number === 5 ? `Tahap ${config.subtitle}` : `Misi ${config.number}`}
                    </p>
                    <p className={cn(
                        "font-bold truncate",
                        config.color.title,
                        variant === "full"
                            ? "text-xs sm:text-sm lg:text-base"
                            : "text-[10px] sm:text-xs"
                    )}>
                        {config.title}
                    </p>
                    {/* Subtitle */}
                    {variant === "full" && (
                        <p className={cn(
                            "text-[10px] sm:text-xs mt-0.5 hidden xs:block",
                            config.color.sub
                        )}>
                            {config.subtitle}
                        </p>
                    )}
                </div>

                {/* Status badge */}
                <div className={cn(
                    "rounded-full px-1.5 sm:px-2.5 py-1 flex items-center gap-1 flex-shrink-0",
                    config.color.badge
                )}>
                    {isLocked && <Lock size={10} />}
                    {isDone && <CheckCircle size={10} />}
                    {status === "in_progress" && <PlayCircle size={10} />}
                    <span className="text-[9px] font-bold hidden xs:inline">
                        {isLocked ? "Terkunci" : isDone ? "Selesai" : "Aktif"}
                    </span>
                </div>
            </div>

            {/* Footer */}
            {variant === "full" && !isLocked && (
                <div className={cn(
                    "mt-3 sm:mt-4 flex items-center justify-between border-t border-black/5 pt-2.5 sm:pt-3",
                    config.color.title
                )}>
                    <span className="text-[9px] sm:text-[10px] font-medium opacity-70">
                        {isDone ? "✓ Lencana diraih" : "Ketuk untuk melanjutkan"}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold opacity-90">
                        {isDone ? "Lihat ulang →" : "Lanjutkan →"}
                    </span>
                </div>
            )}
        </div>
    );

    if (isLocked) return card;
    return <Link href={config.href} className="block w-full h-full">{card}</Link>;
}