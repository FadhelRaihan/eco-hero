"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Home,
    Map,
    Image,
    Award,
    LogOut,
    LayoutDashboard,
    School,
    ArrowLeft,
    Crown,
} from "lucide-react";

interface NavbarProps {
    role: "siswa" | "guru";
    backUrl?: string;
    title?: string;
    variant?: "default" | "misi";
    bgBtn?: string;
    textColor?: string;
}

const SISWA_NAV = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/misi/1", label: "Misi", icon: Map },
    { href: "/galeri", label: "Galeri", icon: Image },
    { href: "/dashboard#lencana", label: "Lencana", icon: Award },
];

const GURU_NAV = [
    { href: "/guru/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/guru/kelas", label: "Kelas", icon: School },
];

export default function Navbar({ role, backUrl, title, variant = "default", bgBtn, textColor }: NavbarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <>
            {/* Topbar Responsive */}
            <div className="flex fixed top-3 sm:top-4 left-3 right-3 sm:left-4 sm:right-4 z-50 justify-center pointer-events-none">
                <nav className="w-full max-w-7xl flex items-center justify-between bg-[#FFFDF1] px-2 py-2 rounded-[2rem] shadow-[0px_1px_6px_0px_rgba(0,_0,_0,_0.1)] pointer-events-auto">
                    {/* Logo area / Back Button */}
                    {backUrl ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link href={backUrl} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${bgBtn} flex items-center justify-center hover:bg-[#9ded88] transition-colors pointer-events-auto`}>
                                <ArrowLeft className={`${textColor} w-4 h-4 sm:w-5 sm:h-5`} strokeWidth={3} />
                            </Link>
                            {title && (
                                <span className={`font-bold ${textColor} text-sm sm:text-lg line-clamp-1`}>
                                    {title}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3 pl-1">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#B4FF9F] flex items-center justify-center">
                                <span className="text-[#1A5C0A] text-base sm:text-lg font-extrabold pb-0.5">E</span>
                            </div>
                            <span className="font-extrabold text-[#333333] text-base sm:text-xl">
                                Eco Hero
                            </span>
                        </div>
                    )}

                    {/* User & Logout / Lencana Badge */}
                    <div className="flex items-center gap-1.5 sm:gap-1 pr-1">
                        {variant === "misi" ? (
                            <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#F9FFA4] text-[#7A7200] font-bold text-xs sm:text-sm">
                                <Crown className="text-[#F59E0B] w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                <span>+ Lencana</span>
                            </div>
                        ) : (
                            <>
                                <div className="hidden sm:flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-l-xl rounded-r-sm bg-[#F9FFA4] text-[#7A7200] font-bold text-xs sm:text-sm">
                                    Halo, {user?.full_name?.split(' ')[0] || "User"}!
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center justify-center px-3 py-1.5 sm:py-2 bg-red-50 text-red-500 rounded-xl sm:rounded-r-xl sm:rounded-l-sm hover:bg-red-100 transition-colors cursor-pointer"
                                    title="Keluar"
                                >
                                    <LogOut className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </>
    );
}