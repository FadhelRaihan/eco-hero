"use client";

import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";

export default function BadgeModal4() {
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
                <Crown className="w-20 h-20 text-[#FA8072] mb-4 mx-auto" />
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                    Lencana Diraih!
                </h2>
                <p className="text-sm text-gray-500 mb-1">
                    Kamu telah menyelesaikan
                </p>
                <p className="text-base font-bold text-[#7A2A2A] mb-6">
                    Misi 4: Aksi Nyata
                </p>

                <div className="bg-[#FFFDF1] rounded-2xl px-4 py-3 mb-6 border border-[#7A2A2A]/10">
                    <p className="text-sm text-[#7A2A2A] font-semibold">
                        Selamat! Kamu telah menjadi Pahlawan Lingkungan sejati.
                    </p>
                </div>

                <button
                    onClick={handleClose}
                    className="w-full py-3.5 bg-[#7A2A2A] text-white font-bold rounded-2xl hover:bg-[#5C2020] transition-all active:scale-95 cursor-pointer"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    );
}
