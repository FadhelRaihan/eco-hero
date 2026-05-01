"use client";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    LogOut, 
    X,
    User,
    ChevronRight,
    Settings,
    Users,
    UsersRound,
    Target,
    CheckCircle2,
    Image,
    MessageCircleQuestion
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
    {
        title: "Dashboard",
        href: "/guru/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Manajemen Siswa",
        href: "/guru/siswa",
        icon: Users,
    },
    {
        title: "Manajemen Tim",
        href: "/guru/tim",
        icon: UsersRound,
    },
    {
        title: "Manajemen Misi",
        href: "/guru/misi",
        icon: Target,
    },
    {
        title: "Forum Diskusi",
        href: "/guru/forum",
        icon: MessageCircleQuestion,
    },
    {
        title: "Galeri Aksi",
        href: "/guru/galeri",
        icon: Image,
    },
    {
        title: "Hasil Tes",
        href: "/guru/tes",
        icon: CheckCircle2,
    },
    {
        title: "Pengaturan",
        href: "/guru/pengaturan",
        icon: Settings,
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TeacherSidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={cn(
                    "fixed inset-0 bg-[#1A5C0A]/40 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={cn(
                "w-64 h-screen bg-[#FFFDF1] border-r border-[#1A5C0A]/10 flex flex-col fixed left-0 top-0 z-[60] transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo & Close Button (Mobile) */}
                <div className="p-6 flex items-center justify-between">
                    <Link href="/guru/dashboard" className="flex items-center gap-2" onClick={onClose}>
                        <span className="text-lg font-black text-[#1A5C0A] tracking-tight">
                            ECO HERO
                        </span>
                    </Link>
                    <button 
                        onClick={onClose}
                        className="lg:hidden p-2 -mr-2 text-[#333333]/40 hover:text-[#333333] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onClose()}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-2xl transition-all group border-none",
                                    isActive 
                                        ? "bg-[#B4FF9F] text-[#1A5C0A] shadow-sm" 
                                        : "text-[#333333]/70 hover:bg-[#B4FF9F]/20 hover:text-[#333333] border-none"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} className={cn(
                                        "transition-colors",
                                        isActive ? "text-[#1A5C0A]" : "text-[#333333]/40 group-hover:text-[#333333]/70"
                                    )} />
                                    <span className="text-sm font-bold">{item.title}</span>
                                </div>
                                {isActive && <ChevronRight size={14} className="opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-[#1A5C0A]/10">
                    <div className="bg-[#F9FFA4] rounded-2xl p-3 mb-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1A5C0A] flex items-center justify-center text-white">
                            <User size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#7A7200] truncate">
                                {user?.full_name}
                            </p>
                            <p className="text-[10px] text-[#7A7200]/70 font-medium uppercase tracking-wider">
                                Guru
                            </p>
                        </div>
                    </div>
                    
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm cursor-pointer"
                    >
                        <LogOut size={20} />
                        Keluar
                    </button>
                </div>
            </div>
        </>
    );
}
