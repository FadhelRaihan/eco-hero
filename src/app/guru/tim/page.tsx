"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
    UsersRound, 
    Target, 
    Loader2, 
    ChevronRight,
    Users,
    Search
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

interface Team {
    id: string;
    name: string;
    selected_case: string;
    member_count: number;
    members: {
        full_name: string;
        role: string;
    }[];
}

export default function ManajemenTimPage() {
    const { user } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    const fetchTeams = useCallback(async () => {
        try {
            const res = await fetch(`/api/guru/teams?teacher_id=${user?.id}`);
            const result = await res.json();
            if (res.ok) setTeams(result.data ?? []);
        } catch {
            toast.error("Gagal mengambil data tim");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) fetchTeams();
    }, [user?.id, fetchTeams]);

    const filteredTeams = teams.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.selected_case.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-[#1A5C0A]" size={32} />
            </div>
        );
    }

    return (
        <div className="mx-auto px-8 py-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-[#333333] tracking-tight">Manajemen Tim</h1>
                    <p className="text-xs text-[#333333]/60 font-bold uppercase tracking-widest">Pantau kolaborasi dan pembentukan kelompok siswa</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Cari nama tim atau kasus..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-[#1A5C0A]/10 text-sm focus:outline-none focus:border-[#1A5C0A] transition-all shadow-sm"
                    />
                </div>
            </div>

            {filteredTeams.length === 0 ? (
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-[#1A5C0A]/10 p-20 text-center">
                    <UsersRound size={64} className="text-[#1A5C0A]/10 mx-auto mb-6" />
                    <p className="text-[#333333]/40 font-bold uppercase tracking-widest text-sm">Belum ada tim yang terbentuk</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map((team) => (
                        <div key={team.id} className="bg-white rounded-[2.5rem] border border-[#1A5C0A]/10 p-8 hover:shadow-2xl hover:shadow-[#1A5C0A]/5 transition-all duration-500 group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 bg-[#B4FF9F]/20 rounded-2xl flex items-center justify-center text-[#1A5C0A] group-hover:bg-[#B4FF9F] transition-colors">
                                    <UsersRound size={28} />
                                </div>
                                <span className="px-3 py-1 bg-[#F9FFA4] text-[#7A7200] text-[9px] font-black uppercase tracking-widest rounded-full">
                                    {team.member_count} Anggota
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-[#333333] mb-2 group-hover:text-[#1A5C0A] transition-colors">{team.name}</h3>
                            <div className="flex items-center gap-2 mb-6">
                                <Target size={14} className="text-[#1A5C0A]/40" />
                                <p className="text-xs font-bold text-[#1A5C0A] uppercase tracking-tighter capitalize">{team.selected_case || "Belum pilih kasus"}</p>
                            </div>

                            <div className="space-y-3 mb-8">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Anggota Tim</p>
                                <div className="flex -space-x-3">
                                    {team.members.map((member, i) => (
                                        <Avatar key={i} className="w-9 h-9 border-2 border-white ring-1 ring-gray-100">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.full_name}`} />
                                            <AvatarFallback className="bg-gray-100 text-[10px] font-bold">{member.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {team.member_count > team.members.length && (
                                        <div className="w-9 h-9 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400">
                                            +{team.member_count - team.members.length}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedTeam(team)}
                                className="w-full h-12 rounded-xl bg-gray-50 text-[#333333]/40 group-hover:bg-[#1A5C0A] group-hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Detail Tim <ChevronRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Drawer Detail Tim */}
            <Drawer open={!!selectedTeam} onOpenChange={(open) => !open && setSelectedTeam(null)}>
                <DrawerContent className="max-h-[90vh] rounded-t-[3rem] border-none shadow-2xl bg-[#F7FFF4]">
                    <div className="mx-auto w-12 h-1.5 bg-[#1A5C0A]/10 rounded-full my-4 shrink-0" />
                    <DrawerHeader className="px-8 md:px-12 text-center md:text-left">
                        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                            <div className="p-2 bg-[#B4FF9F] rounded-xl">
                                <Users size={20} className="text-[#1A5C0A]" />
                            </div>
                            <DrawerTitle className="text-2xl font-black text-[#333333] tracking-tight uppercase">
                                Detail Tim: {selectedTeam?.name}
                            </DrawerTitle>
                        </div>
                    </DrawerHeader>

                    <div className="px-8 md:px-12 pb-12 pt-6 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedTeam?.members?.map((m, i) => (
                                <div key={i} className="p-4 bg-white rounded-2xl border border-[#1A5C0A]/5 flex items-center gap-3 shadow-sm">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.full_name}`} />
                                        <AvatarFallback className="bg-gray-100 text-[10px] font-bold">
                                            {m.full_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#333333]">{m.full_name}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {m.role.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 border-t border-[#1A5C0A]/5 bg-white/80 backdrop-blur-md rounded-b-[3rem]">
                        <Button onClick={() => setSelectedTeam(null)} className="w-full h-12 rounded-2xl bg-[#1A5C0A] text-white font-black text-[10px] uppercase tracking-widest cursor-pointer">
                            Tutup
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
