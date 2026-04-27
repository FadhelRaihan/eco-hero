"use client";

import { CheckCircle, Check, ArrowRight } from "lucide-react";
import Image from "next/image";
import Lokasi1 from "@/assets/Lokasi1.png";
import Lokasi2 from "@/assets/Lokasi2.png";
import { cn } from "@/lib/utils";
import { CaseTopic, MISSION_1_DATA } from "@/lib/mission-data";

const LOCATIONS: {
    id: CaseTopic;
    name: string;
    sub: string;
    bgColor: string;
}[] = [
        {
            id: "sampah",
            name: "TPA Sarimukti",
            sub: "Isu Sampah & PLTSa",
            bgColor: "bg-[#F9FFA4]", 
        },
        {
            id: "kendaraan",
            name: "Kota Masa Depan",
            sub: "Kendaraan Listrik & BRT",
            bgColor: "bg-[#EBF5FF]", 
        },
    ];

function LocationIllustration({ id }: { id: CaseTopic }) {
    if (id === "sampah") {
        return (
            <Image 
                src={Lokasi1} 
                alt="TPA Sarimukti" 
                fill 
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover" 
            />
        );
    }

    return (
        <Image 
            src={Lokasi2} 
            alt="Kendaraan Listrik" 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 py-4 overflow-y-auto min-h-0">
                <div className="flex items-center gap-3 mb-4 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#B4FF9F] flex items-center justify-center">
                        <span className="text-[#1A5C0A] font-extrabold text-lg">1</span>
                    </div>
                    <h2 className="text-sm font-bold text-[#333333] uppercase tracking-wide">
                        Pilih Kasus Investigasi
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
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
                                <div className="w-full aspect-[1/0.6] rounded-xl overflow-hidden relative">
                                    <LocationIllustration id={loc.id} />
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow">
                                            <CheckCircle size={16} className="text-[#1A5C0A]" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 text-center">
                                    <p className="font-bold text-[#333333] text-sm mb-0.5">
                                        {MISSION_1_DATA[loc.id].title}
                                    </p>
                                    <p className="text-[11px] leading-tight text-[#333333]/60 mb-3 px-2 line-clamp-2">
                                        {MISSION_1_DATA[loc.id].description}
                                    </p>
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

            <div className="flex justify-end pt-3 shrink-0">
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
                    Mulai Penyelidikan <ArrowRight size={16} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}