"use client";

import { CheckCircle, Check, ArrowRight } from "lucide-react";
import Image from "next/image";
import Lokasi1 from "@/assets/Lokasi1.png";
import Lokasi2 from "@/assets/Lokasi2.png";
import Lokasi3 from "@/assets/Lokasi3.png";
import { cn } from "@/lib/utils";

type CaseTopic = "plastik_kantin" | "alih_fungsi_lahan" | "pencemaran_air";

const LOCATIONS: {
    id: CaseTopic;
    name: string;
    sub: string;
    bgColor: string;
}[] = [
        {
            id: "plastik_kantin",
            name: "Kantin Sekolah",
            sub: "Isu plastik & wadah jajanan",
            bgColor: "bg-[#F9FFA4]", 
        },
        {
            id: "alih_fungsi_lahan",
            name: "Lahan Hijau Desa",
            sub: "Isu alih fungsi lahan",
            bgColor: "bg-[#F0FFF0]", 
        },
        {
            id: "pencemaran_air",
            name: "Sungai Pemukiman",
            sub: "Isu pencemaran air",
            bgColor: "bg-[#EBF5FF]", 
        },
    ];

// Ilustrasi isometric PNG per lokasi
function LocationIllustration({ id }: { id: CaseTopic }) {
    if (id === "plastik_kantin") {
        return (
            <Image 
                src={Lokasi1} 
                alt="Kantin Sekolah" 
                fill 
                className="object-cover" 
            />
        );
    }

    if (id === "alih_fungsi_lahan") {
        return (
            <Image 
                src={Lokasi2} 
                alt="Lahan Hijau Desa" 
                fill 
                className="object-cover" 
            />
        );
    }

    return (
        <Image 
            src={Lokasi3} 
            alt="Sungai Pemukiman" 
            fill 
            className="object-cover" 
        />
    );
}

interface Step1LocationProps {
    selected: CaseTopic | null;
    onSelect: (loc: CaseTopic) => void;
    onLanjut: () => void;
}

export default function Step1Location({ selected, onSelect, onLanjut }: Step1LocationProps) {
    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 py-6">
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#B4FF9F] flex items-center justify-center">
                        <span className="text-[#1A5C0A] font-extrabold text-lg">1</span>
                    </div>
                    <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                        Pilih Lokasi Investigasi
                    </h2>
                </div>

                {/* Location cards — 3 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {LOCATIONS.map((loc) => {
                        const isSelected = selected === loc.id;
                        return (
                            <button
                                key={loc.id}
                                onClick={() => onSelect(loc.id)}
                                className={cn(
                                    "rounded-2xl p-4 overflow-hidden border-2 text-left transition-all active:scale-[0.98] cursor-pointer",
                                    loc.bgColor,
                                    isSelected
                                        ? "border-[#333333] ring-4 ring-[#333333]/60 shadow-lg"
                                        : "border-[#333333]/15 hover:border-[#1A5C0A]/30 hover:shadow-sm"
                                )}
                            >
                                {/* Illustration area */}
                                <div className="w-full aspect-[0.5/0.3] rounded-xl overflow-hidden relative">
                                    <LocationIllustration id={loc.id} />
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow">
                                            <CheckCircle size={16} className="text-[#1A5C0A]" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="mt-2 text-center">
                                    <p className="font-bold text-[#333333] text-sm mb-0.5">
                                        {loc.name}
                                    </p>
                                    <p className="text-xs text-[#333333]/50 mb-3">{loc.sub}</p>
                                    <div className={cn(
                                        "text-[10px] font-bold px-3 py-1.5 rounded-lg inline-block",
                                        isSelected
                                            ? "bg-[#B4FF9F] text-[#1A5C0A]"
                                            : "bg-[#FFFDF1] text-[#333333]"
                                    )}>
                                        {isSelected ? <div className="flex items-center gap-1"><Check size={16} />Dipilih</div> : "Klik Untuk Pilih"}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Lanjut button */}
            <div className="flex justify-end">
                <button
                    onClick={onLanjut}
                    disabled={!selected}
                    className={cn(
                        "flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer",
                        selected
                            ? "bg-[#B4FF9F] text-[#1A5C0A] border border-[#1A5C0A] hover:bg-[#9AEF85] shadow-sm"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Lanjut <ArrowRight size={16} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}