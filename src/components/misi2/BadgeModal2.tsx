"use client";

import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";

export default function BadgeModal2() {
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
                <p className="text-base font-bold text-[#7A6200] mb-6">
                    Misi 2: Arsitek Solusi
                </p>

                <div className="bg-[#FCFEBA] rounded-2xl px-4 py-3 mb-6">
                    <p className="text-sm text-[#7A6200] font-semibold">
                        Misi 3: Sang Pengatur Waktu sudah terbuka!
                    </p>
                </div>

                <button
                    onClick={handleClose}
                    className="w-full py-3.5 bg-[#7A6200] text-white font-bold rounded-2xl hover:bg-[#5C4A00] transition-all active:scale-95 cursor-pointer"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    );
}