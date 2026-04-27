"use client";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    School, 
    ClipboardCheck, 
    LogOut, 
    Leaf,
    User,
    ChevronRight,
    Settings,
    Users,
    Target
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
        title: "Manajemen Misi",
        href: "/guru/misi",
        icon: Target,
    },
    {
        title: "Kelola Tes",
        href: "/guru/tes",
        icon: ClipboardCheck,
    },
    {
        title: "Pengaturan",
        href: "/guru/pengaturan",
        icon: Settings,
    },
];

export default function TeacherSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-[#FFFDF1] border-r border-[#1A5C0A]/10 flex flex-col fixed left-0 top-0 z-50">
            {/* Logo */}
            <div className="p-6">
                <Link href="/guru/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#B4FF9F] rounded-xl flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-[#1A5C0A]" />
                    </div>
                    <span className="text-lg font-black text-[#333333] tracking-tight">
                        ECO<span className="text-[#1A5C0A]">HERO</span>
                    </span>
                </Link>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
                >
                    <LogOut size={20} />
                    Keluar
                </button>
            </div>
        </div>
    );
}
