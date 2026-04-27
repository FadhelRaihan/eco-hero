"use client";

import { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Users, User, ShieldCheck, ArrowRight, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
    id: string;
    full_name: string;
    is_leader: boolean;
}

interface TeamData {
    id: string;
    name: string;
    selected_case: string;
    members: TeamMember[];
}

interface TeamStatusDialogProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string | undefined;
}

export default function TeamStatusDialog({ isOpen, onClose, studentId }: TeamStatusDialogProps) {
    const [loading, setLoading] = useState(false);
    const [teamData, setTeamData] = useState<TeamData | null>(null);

    useEffect(() => {
        if (isOpen && studentId) {
            fetchTeamData();
        }
    }, [isOpen, studentId]);

    async function fetchTeamData() {
        setLoading(true);
        try {
            const res = await fetch(`/api/teams/my-team?studentId=${studentId}`);
            const result = await res.json();
            if (res.ok) {
                setTeamData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch team data:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none rounded-3xl bg-[#F8FFF5]">
                <div className="bg-[#B4FF9F] p-6 pb-12 relative">
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black text-[#1A5C0A] flex items-center gap-3">
                            <Users className="w-8 h-8" /> Tim Saya
                        </DialogTitle>
                        <DialogDescription className="text-[#1A5C0A]/70 font-bold">
                            Informasi kolaborasi tim kamu
                        </DialogDescription>
                    </DialogHeader>
                    {/* Decorative leaf icon */}
                    <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-[#1A5C0A]/5" />
                </div>

                <div className="p-6 -mt-8 relative z-20 bg-[#F8FFF5] rounded-t-[32px]">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#1A5C0A]">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm font-bold">Memuat data tim...</p>
                        </div>
                    ) : teamData ? (
                        <div className="space-y-6">
                            {/* Team Identity */}
                            <div className="bg-white p-5 rounded-3xl border-2 border-[#1A5C0A]/10 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Tim</p>
                                <h2 className="text-xl font-black text-[#1A5C0A] mb-3">{teamData.name}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F9FFA4] text-[#7A7200] uppercase tracking-tighter">
                                        Topik: {teamData.selected_case === 'sampah' ? 'TPA Sarimukti' : 'Kota Masa Depan'}
                                    </span>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    Anggota Tim <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{teamData.members.length} Orang</span>
                                </h3>
                                <div className="space-y-2">
                                    {teamData.members.map((member) => (
                                        <div 
                                            key={member.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-2xl border transition-all",
                                                member.is_leader 
                                                    ? "bg-[#1A5C0A] text-white border-transparent shadow-md" 
                                                    : "bg-white border-gray-100 text-gray-700 hover:border-[#1A5C0A]/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                                    member.is_leader ? "bg-white/20" : "bg-gray-100 text-gray-400"
                                                )}>
                                                    <User size={16} />
                                                </div>
                                                <span className="text-sm font-bold truncate max-w-[180px]">
                                                    {member.full_name} {member.id === studentId && "(Kamu)"}
                                                </span>
                                            </div>
                                            {member.is_leader && (
                                                <div className="bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <ShieldCheck size={12} className="text-[#B4FF9F]" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Ketua</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Info size={32} />
                            </div>
                            <h3 className="text-lg font-black text-gray-800 mb-1">Belum Memiliki Tim</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-[200px]">
                                Kamu belum terdaftar dalam tim mana pun. Selesaikan Misi 1 & 2 untuk membentuk atau bergabung dengan tim.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-[#1A5C0A] text-white rounded-2xl font-black text-sm hover:bg-[#134407] transition-all"
                            >
                                Mengerti
                            </button>
                        </div>
                    )}
                </div>

                {teamData && (
                    <div className="p-6 pt-0 bg-[#F8FFF5]">
                         <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
