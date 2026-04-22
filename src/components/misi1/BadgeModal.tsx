"use client";

import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";

interface BadgeModalProps {
    onClose: () => void;
}

export default function BadgeModal({ onClose }: BadgeModalProps) {
    const router = useRouter();

    function handleClose() {
        router.push("/dashboard");
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <Crown className="w-20 h-20 text-[#FF9100] mb-4 mx-auto" />
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                    Lencana Diraih!
                </h2>
                <p className="text-sm text-gray-500 mb-1">
                    Kamu telah menyelesaikan
                </p>
                <p className="text-base font-bold text-[#1A5C0A] mb-6">
                    Misi 1: Sang Penyelidik
                </p>

                <div className="bg-[#B4FF9F] rounded-2xl px-4 py-3 mb-6">
                    <p className="text-sm text-[#1A5C0A] font-semibold">
                        Misi 2: Arsitek Solusi sudah terbuka!
                    </p>
                </div>

                <button
                    onClick={handleClose}
                    className="w-full py-3.5 bg-[#1A5C0A] text-white font-bold rounded-2xl hover:bg-[#145208] transition-all active:scale-95 cursor-pointer"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    );
}