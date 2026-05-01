"use client";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    School, 
    ClipboardCheck, 
    LogOut, 
    ShieldCheck,
    User,
    ChevronRight,
    Settings,
    Users,
    UsersRound
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_MENU_ITEMS = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Manajemen User",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Manajemen Kelas",
        href: "/admin/kelas",
        icon: School,
    },
    {
        title: "Manajemen Tes",
        href: "/admin/tes",
        icon: ClipboardCheck,
    },
    {
        title: "Pengaturan",
        href: "/admin/pengaturan",
        icon: Settings,
    },
];

export default function AdminSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-[#F0F4F8] border-r border-blue-900/10 flex flex-col fixed left-0 top-0 z-50">
            {/* Logo */}
            <div className="p-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-900 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-black text-[#333333] tracking-tight">
                        ECO<span className="text-blue-900">ADMIN</span>
                    </span>
                </Link>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {ADMIN_MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-2xl transition-all group border-none",
                                isActive 
                                    ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20" 
                                    : "text-[#333333]/70 hover:bg-blue-900/5 hover:text-[#333333] border-none"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={cn(
                                    "transition-colors",
                                    isActive ? "text-white" : "text-[#333333]/40 group-hover:text-[#333333]/70"
                                )} />
                                <span className="text-sm font-bold">{item.title}</span>
                            </div>
                            {isActive && <ChevronRight size={14} className="opacity-50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-blue-900/10">
                <div className="bg-white rounded-2xl p-3 mb-3 flex items-center gap-3 border border-blue-900/5">
                    <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-white">
                        <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#333333] truncate">
                            {user?.full_name}
                        </p>
                        <p className="text-[10px] text-blue-900 font-bold uppercase tracking-wider">
                            Administrator
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
