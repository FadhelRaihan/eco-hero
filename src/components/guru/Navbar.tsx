"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
    onMenuClick: () => void;
}

export default function GuruNavbar({ onMenuClick }: NavbarProps) {
    return (
        <header className="lg:hidden h-16 bg-[#FFFDF1] border-b border-[#1A5C0A]/10 flex items-center justify-between px-6 sticky top-0 z-40">
            <Link href="/guru/dashboard" className="flex items-center gap-2">
                <span className="text-lg font-black text-[#1A5C0A] tracking-tight">
                    ECO HERO
                </span>
            </Link>

            <button
                onClick={onMenuClick}
                className="p-2 -mr-2 text-[#1A5C0A] hover:bg-[#B4FF9F]/20 rounded-xl transition-colors cursor-pointer"
            >
                <Menu size={24} />
            </button>
        </header>
    );
}
