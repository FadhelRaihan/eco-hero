"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
    CheckCircle, 
    Video as VideoIcon,
    MessageSquare,
    Lightbulb,
    ClipboardList,
    Camera,
    Loader2,
    Download,
    CalendarCheck,
    CalendarX,
    ShieldCheck,
    Clock
} from "lucide-react";
import Image from "next/image";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";

interface Mission3Schedule {
    id: string;
    team_id: string;
    teacher_approved: boolean;
    submitted_at: string | null;
    approved_at: string | null;
    teams?: {
        name: string;
    };
    mission3_tasks?: {
        id: string;
        title: string;
    }[];
}

interface MissionFile {
    cloudinary_url: string;
    media_type: "foto" | "video" | "pdf";
    caption?: string;
}

interface MissionSubmission {
    id: string;
    case_topic?: string;
    perspective_env?: string;
    perspective_soc?: string;
    action_name?: string;
    solution?: string;
    action_type?: string;
    users?: { full_name: string };
    classes?: { name: string };
    teams?: { 
        name: string; 
        classes?: { name: string };
    };
    mission3_tasks?: { id: string; title: string; status: string }[];
    files?: MissionFile[];
    // Misi 4 combined data structure
    team_name?: string;
    class_name?: string;
}

export default function ManajemenMisiPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("1");
    const [data, setData] = useState<MissionSubmission[]>([]);
    const [selectedM4Submission, setSelectedM4Submission] = useState<MissionSubmission | null>(null);

    const [schedules, setSchedules] = useState<Mission3Schedule[]>([]);
    const [schedulesLoading, setSchedulesLoading] = useState(false);
    const [approvingTeamId, setApprovingTeamId] = useState<string | null>(null);

    const isDemoMode = typeof window !== "undefined"
        ? localStorage.getItem("eco_guru_demo_mode") === "true"
        : false;

    const fetchSchedules = useCallback(async () => {
        if (isDemoMode) {
            setSchedulesLoading(true);
            setTimeout(() => {
                setSchedules([
                    { id: "sch-1", team_id: "demo-team-001", teacher_approved: false, submitted_at: new Date().toISOString(), approved_at: null, teams: { name: "Penyelamat Bumi" }, mission3_tasks: [{ id: "t1", title: "Membersihkan halaman" }] },
                    { id: "sch-2", team_id: "demo-team-002", teacher_approved: true, submitted_at: new Date(Date.now() - 86400000).toISOString(), approved_at: new Date().toISOString(), teams: { name: "Pasukan Hijau" }, mission3_tasks: [{ id: "t2", title: "Membuat poster" }] },
                ]);
                setSchedulesLoading(false);
            }, 500);
            return;
        }

        if (!user?.id) return;
        setSchedulesLoading(true);
        try {
            const res = await fetch(`/api/guru/schedules?teacher_id=${user.id}`);
            const result = await res.json();
            if (res.ok) setSchedules(result.data || []);
        } catch {
            toast.error("Gagal memuat jadwal");
        } finally {
            setSchedulesLoading(false);
        }
    }, [user?.id, isDemoMode]);

    async function handleApprove(teamId: string) {
        setApprovingTeamId(teamId);

        if (isDemoMode) {
            setTimeout(() => {
                setSchedules(prev => prev.map(s => s.team_id === teamId ? { ...s, teacher_approved: true, approved_at: new Date().toISOString() } : s));
                toast.success("Jadwal berhasil disetujui! Misi 4 terbuka untuk tim ini (Demo).");
                setApprovingTeamId(null);
            }, 500);
            return;
        }

        try {
            const res = await fetch(`/api/mission3/${teamId}/approve`, { method: "POST" });
            const result = await res.json();
            if (res.ok) {
                toast.success("Jadwal berhasil disetujui! Misi 4 terbuka untuk tim ini.");
                fetchSchedules();
            } else {
                toast.error(result.error || "Gagal menyetujui jadwal");
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setApprovingTeamId(null);
        }
    }
    // ─────────────────────────────────────────────────────────

    const fetchMissionData = useCallback(async (missionNum: string) => {
        setLoading(true);

        if (isDemoMode) {
            setTimeout(() => {
                let mockData: Partial<MissionSubmission>[] = [];
                if (missionNum === "1") {
                    mockData = [
                        { id: "1", users: { full_name: "Andi Pratama" }, classes: { name: "Kelas 5A (Demo)" }, case_topic: "sampah", perspective_env: "Banyak sampah di sungai menghambat aliran air.", perspective_soc: "Warga tidak nyaman dengan bau menyengat." },
                        { id: "2", users: { full_name: "Citra Dewi" }, classes: { name: "Kelas 5A (Demo)" }, case_topic: "kendaraan", perspective_env: "Polusi udara meningkat.", perspective_soc: "Penyakit pernapasan pada lansia meningkat." },
                    ];
                } else if (missionNum === "2") {
                    mockData = [
                        { id: "1", teams: { name: "Penyelamat Bumi", classes: { name: "Kelas 5A (Demo)" } }, action_name: "Kerja Bakti Masal", solution: "Membersihkan sampah", action_type: "karya" }
                    ];
                } else if (missionNum === "3") {
                    mockData = [
                        { id: "1", teams: { name: "Penyelamat Bumi", classes: { name: "Kelas 5A (Demo)" } }, mission3_tasks: [{ id: "t1", title: "Siapkan alat", status: "selesai" }, { id: "t2", title: "Kerja bakti", status: "pending" }] }
                    ];
                } else if (missionNum === "4") {
                    mockData = [
                        { id: "1", team_name: "Penyelamat Bumi", class_name: "Kelas 5A (Demo)", files: [{ cloudinary_url: "/assets/komik_1/Sampah1.png", media_type: "foto" }] }
                    ];
                }
                setData(mockData as unknown as MissionSubmission[]);
                setLoading(false);
            }, 500);
            return;
        }

        try {
            const res = await fetch(`/api/guru/submissions/${missionNum}?teacher_id=${user?.id}`);
            const result = await res.json();
            if (res.ok) {
                setData(result.data || []);
            } else {
                toast.error("Gagal mengambil data misi");
            }
        } catch {
            toast.error("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }, [user?.id, isDemoMode]);

    useEffect(() => {
        if (user?.id || isDemoMode) {
            fetchMissionData(activeTab);
            if (activeTab === "3") fetchSchedules();
        }
    }, [user?.id, activeTab, fetchMissionData, fetchSchedules, isDemoMode]);

    const exportToExcel = async () => {
        if (data.length === 0) {
            toast.error("Tidak ada data untuk diekspor");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Misi ${activeTab}`);

        // Define columns based on mission
        let columns: { header: string; key: string; width: number }[] = [];
        if (activeTab === "1") {
            columns = [
                { header: "Nama Siswa", key: "full_name", width: 25 },
                { header: "Kelas", key: "class_name", width: 15 },
                { header: "Topik Kasus", key: "case_topic", width: 20 },
                { header: "Perspektif Lingkungan", key: "perspective_env", width: 50 },
                { header: "Perspektif Sosial", key: "perspective_soc", width: 50 },
            ];
        } else if (activeTab === "2") {
            columns = [
                { header: "Nama Tim", key: "team_name", width: 25 },
                { header: "Kelas", key: "class_name", width: 15 },
                { header: "Nama Aksi", key: "action_name", width: 30 },
                { header: "Solusi", key: "solution", width: 50 },
                { header: "Jenis Aksi", key: "action_type", width: 20 },
            ];
        } else if (activeTab === "3") {
            columns = [
                { header: "Nama Tim", key: "team_name", width: 25 },
                { header: "Kelas", key: "class_name", width: 15 },
                { header: "Tugas Selesai", key: "completed_tasks", width: 20 },
                { header: "Total Tugas", key: "total_tasks", width: 15 },
                { header: "Persentase", key: "percentage", width: 15 },
            ];
        } else if (activeTab === "4") {
            columns = [
                { header: "Nama Tim", key: "team_name", width: 25 },
                { header: "Kelas", key: "class_name", width: 15 },
                { header: "Jumlah Dokumentasi", key: "doc_count", width: 20 },
                { header: "Links", key: "links", width: 100 },
            ];
        }

        worksheet.columns = columns;

        // Add rows
        data.forEach((item: MissionSubmission) => {
            let rowData: Record<string, string | number | null | undefined> = {};
            if (activeTab === "1") {
                rowData = {
                    full_name: item.users?.full_name,
                    class_name: item.classes?.name,
                    case_topic: item.case_topic,
                    perspective_env: item.perspective_env,
                    perspective_soc: item.perspective_soc,
                };
            } else if (activeTab === "2") {
                rowData = {
                    team_name: item.teams?.name,
                    class_name: item.teams?.classes?.name,
                    action_name: item.action_name,
                    solution: item.solution,
                    action_type: item.action_type,
                };
            } else if (activeTab === "3") {
                const tasks = item.mission3_tasks || [];
                const completed = tasks.filter((t) => t.status === "selesai").length;
                const total = tasks.length;
                rowData = {
                    team_name: item.teams?.name,
                    class_name: item.teams?.classes?.name,
                    completed_tasks: completed,
                    total_tasks: total,
                    percentage: total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%",
                };
            } else if (activeTab === "4") {
                const files = item.files || [];
                rowData = {
                    team_name: item.team_name,
                    class_name: item.class_name,
                    doc_count: files.length,
                    links: files.map((f) => f.cloudinary_url).join(", "),
                };
            }
            worksheet.addRow(rowData);
        });

        // Styling the header
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FF1A5C0A" } };
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFB4FF9F" },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Add borders to all cells
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Laporan_EcoHero_Misi_${activeTab}.xlsx`);
        toast.success(`Berhasil ekspor laporan Misi ${activeTab}`);
    };

    // Columns for Mission 1
    const columnsM1: ColumnDef<MissionSubmission>[] = [
        {
            id: "full_name",
            accessorKey: "users.full_name",
            header: "Nama Siswa",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-[#1A5C0A]/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.original.users?.full_name}`} />
                        <AvatarFallback className="bg-[#B4FF9F] text-[#1A5C0A] text-[10px] font-bold">
                            {row.original.users?.full_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-[#333333] text-sm">{row.original.users?.full_name}</span>
                </div>
            ),
        },
        {
            accessorKey: "classes.name",
            header: "Kelas",
            cell: ({ row }) => (
                <span className="text-xs font-bold text-[#333333]/60">{row.original.classes?.name}</span>
            ),
        },
        {
            accessorKey: "case_topic",
            header: "Topik Kasus",
            cell: ({ row }) => (
                <span className="text-[10px] bg-[#F9FFA4] text-[#7A7200] font-bold px-2 py-1 rounded-full uppercase">
                    {row.getValue("case_topic")}
                </span>
            ),
        },
        {
            accessorKey: "perspective_env",
            header: "Perspektif Lingkungan",
            cell: ({ row }) => (
                <p className="text-xs text-[#333333]/70 max-w-[200px] line-clamp-2">{row.getValue("perspective_env")}</p>
            ),
        },
        {
            accessorKey: "perspective_soc",
            header: "Perspektif Sosial",
            cell: ({ row }) => (
                <p className="text-xs text-[#333333]/70 max-w-[200px] line-clamp-2">{row.getValue("perspective_soc")}</p>
            ),
        },
    ];

    // Columns for Mission 2
    const columnsM2: ColumnDef<MissionSubmission>[] = [
        {
            id: "team_name",
            accessorKey: "teams.name",
            header: "Nama Tim",
            cell: ({ row }) => (
                <span className="font-bold text-[#333333] text-sm">{row.original.teams?.name}</span>
            ),
        },
        {
            accessorKey: "teams.classes.name",
            header: "Kelas",
            cell: ({ row }) => (
                <span className="text-xs font-bold text-[#333333]/60">{row.original.teams?.classes?.name}</span>
            ),
        },
        {
            accessorKey: "action_name",
            header: "Nama Aksi",
            cell: ({ row }) => (
                <span className="text-xs font-bold text-[#1A5C0A]">{row.getValue("action_name")}</span>
            ),
        },
        {
            accessorKey: "solution",
            header: "Solusi",
            cell: ({ row }) => (
                <p className="text-xs text-[#333333]/70 max-w-[200px] line-clamp-2">{row.getValue("solution")}</p>
            ),
        },
        {
            accessorKey: "action_type",
            header: "Jenis Aksi",
            cell: ({ row }) => (
                <span className="text-[10px] bg-[#B4FF9F] text-[#1A5C0A] font-bold px-2 py-1 rounded-full uppercase">
                    {row.getValue("action_type")}
                </span>
            ),
        },
    ];

    // Columns for Mission 3
    const columnsM3: ColumnDef<MissionSubmission>[] = [
        {
            id: "team_name",
            accessorKey: "teams.name",
            header: "Nama Tim",
            cell: ({ row }) => (
                <span className="font-bold text-[#333333] text-sm">{row.original.teams?.name}</span>
            ),
        },
        {
            accessorKey: "teams.classes.name",
            header: "Kelas",
            cell: ({ row }) => (
                <span className="text-xs font-bold text-[#333333]/60">{row.original.teams?.classes?.name}</span>
            ),
        },
        {
            accessorKey: "mission3_tasks",
            header: "Progress Tugas",
            cell: ({ row }) => {
                const tasks = row.original.mission3_tasks || [];
                const completed = tasks.filter((t) => t.status === "selesai").length;
                const total = tasks.length;
                const percentage = total > 0 ? (completed / total) * 100 : 0;
                
                return (
                    <div className="flex flex-col gap-1 w-32">
                        <div className="flex justify-between text-[10px] font-bold text-[#333333]/40">
                            <span>{completed}/{total} Selesai</span>
                            <span>{Math.round(percentage)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1A5C0A]/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1A5C0A] transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                    </div>
                );
            },
        },
    ];

    // Columns for Mission 4
    const columnsM4: ColumnDef<MissionSubmission>[] = [
        {
            id: "team_name",
            accessorKey: "team_name",
            header: "Nama Tim",
            cell: ({ row }) => (
                <span className="font-bold text-[#333333] text-sm">{row.getValue("team_name")}</span>
            ),
        },
        {
            accessorKey: "class_name",
            header: "Kelas",
            cell: ({ row }) => (
                <span className="text-xs font-bold text-[#333333]/60">{row.getValue("class_name")}</span>
            ),
        },
        {
            accessorKey: "files",
            header: "Dokumentasi",
            cell: ({ row }) => {
                const files: MissionFile[] = row.original.files || [];
                if (files.length === 0) return <span className="text-xs text-gray-400 italic font-medium">Belum ada</span>;
                
                return (
                    <button 
                        onClick={() => setSelectedM4Submission(row.original)}
                        className="flex -space-x-2 cursor-pointer hover:scale-105 transition-transform"
                    >
                        {files.slice(0, 3).map((file, i) => (
                            <div key={i} className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 overflow-hidden shadow-sm relative">
                                {file.media_type === "foto" ? (
                                    <Image 
                                        src={file.cloudinary_url} 
                                        alt="Dokumentasi" 
                                        fill 
                                        className="object-cover"
                                        sizes="32px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#1A5C0A] text-white">
                                        <VideoIcon size={12} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {files.length > 3 && (
                            <div className="w-8 h-8 rounded-lg border-2 border-white bg-[#B4FF9F] flex items-center justify-center text-[#1A5C0A] text-[10px] font-bold shadow-sm">
                                +{files.length - 3}
                            </div>
                        )}
                    </button>
                );
            },
        },
    ];

    return (
        <div className="mx-auto px-4 md:px-8 py-4 md:py-6 space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#333333] tracking-tight">Manajemen Misi</h1>
                        <p className="text-xs text-[#333333]/60 font-bold uppercase tracking-widest">Pantau rincian jawaban pejuang setiap misi</p>
                    </div>
                </div>

                <Button
                    onClick={exportToExcel}
                    className="bg-[#B4FF9F] hover:bg-[#B4FF9F]/80 text-[#1A5C0A] font-bold px-6 h-11 rounded-xl shadow-sm border border-[#1A5C0A]/10 transition-all active:scale-95 cursor-pointer"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Ekspor Excel
                </Button>
            </div>

            <Tabs defaultValue="1" className="space-y-6" onValueChange={setActiveTab}>
                <TabsList className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1A5C0A]/10 w-full flex h-auto p-1 md:p-1.5 overflow-x-auto justify-start md:justify-center flex-nowrap scrollbar-hide">
                    {[
                        { id: "1", label: "Misi 1", icon: MessageSquare },
                        { id: "2", label: "Misi 2", icon: Lightbulb },
                        { id: "3", label: "Misi 3", icon: ClipboardList },
                        { id: "4", label: "Misi 4", icon: Camera },
                    ].map((tab) => (
                        <TabsTrigger 
                            key={tab.id} 
                            value={tab.id}
                            className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 rounded-xl data-[state=active]:bg-[#1A5C0A] data-[state=active]:text-white transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap"
                        >
                            <tab.icon size={14} className="md:w-4 md:h-4" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {[1, 2, 3, 4].map((n) => (
                    <TabsContent key={n} value={String(n)} className="space-y-4 outline-none">

                        {/* ── APPROVAL SECTION — hanya di Misi 3 ── */}
                        {n === 3 && (
                            <div className="bg-white rounded-2xl border border-[#FFD59E] shadow-sm overflow-hidden">
                                <div className="px-6 py-4 bg-[#FFF8EC] border-b border-[#FFD59E] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#FFD59E] rounded-xl flex items-center justify-center">
                                            <CalendarCheck size={16} className="text-[#6B3A00]" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-[#6B3A00] text-sm">Persetujuan Jadwal Tim</h3>
                                            <p className="text-[10px] text-[#6B3A00]/60 font-semibold">Tinjau dan setujui jadwal yang diajukan oleh setiap tim</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={fetchSchedules}
                                        className="text-xs font-bold text-[#6B3A00]/60 hover:text-[#6B3A00] transition-colors cursor-pointer"
                                    >
                                        {schedulesLoading ? <Loader2 size={14} className="animate-spin" /> : "↻ Refresh"}
                                    </button>
                                </div>

                                <div className="divide-y divide-[#FFD59E]/40">
                                    {schedulesLoading ? (
                                        <div className="flex items-center justify-center py-12 gap-3">
                                            <Loader2 size={20} className="animate-spin text-[#FF9100]" />
                                            <p className="text-sm text-[#6B3A00]/50 font-medium">Memuat jadwal...</p>
                                        </div>
                                    ) : schedules.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                                            <CalendarX size={32} className="text-[#FFD59E]" />
                                            <p className="text-sm font-bold text-[#6B3A00]/50">Belum ada jadwal yang diajukan</p>
                                            <p className="text-xs text-[#6B3A00]/40">Jadwal akan muncul di sini setelah tim mengajukan</p>
                                        </div>
                                    ) : (
                                        schedules.map((s) => {
                                            const isApproved = s.teacher_approved;
                                            const isPending = !!s.submitted_at && !isApproved;
                                            const approving = approvingTeamId === s.team_id;
                                            return (
                                                <div key={s.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-black text-sm text-[#333333]">{s.teams?.name || "Tim Tidak Dikenal"}</span>
                                                            {isApproved && (
                                                                <span className="text-[9px] font-black px-2 py-0.5 bg-[#B4FF9F] text-[#1A5C0A] rounded-full uppercase tracking-wide flex items-center gap-1">
                                                                    <ShieldCheck size={9} /> Disetujui
                                                                </span>
                                                            )}
                                                            {isPending && (
                                                                <span className="text-[9px] font-black px-2 py-0.5 bg-[#FFE4A6] text-[#7A5200] rounded-full uppercase tracking-wide flex items-center gap-1">
                                                                    <Clock size={9} /> Menunggu
                                                                </span>
                                                            )}
                                                            {!s.submitted_at && (
                                                                <span className="text-[9px] font-black px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase tracking-wide">
                                                                    Belum Diajukan
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-[#6B3A00]/60 font-medium">
                                                            {(s.mission3_tasks || []).length} tugas ·
                                                            {s.submitted_at
                                                                ? ` Diajukan ${new Date(s.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
                                                                : " Belum diajukan"
                                                            }
                                                            {isApproved && s.approved_at &&
                                                                ` · Disetujui ${new Date(s.approved_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`
                                                            }
                                                        </p>
                                                        {/* Task preview */}
                                                        {(s.mission3_tasks || []).slice(0, 3).length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {(s.mission3_tasks || []).slice(0, 3).map((t) => (
                                                                    <span key={t.id} className="text-[9px] font-bold px-2 py-0.5 bg-[#FFF3DF] text-[#905D17] rounded-md border border-[#FFD59E]/50">
                                                                        {t.title}
                                                                    </span>
                                                                ))}
                                                                {(s.mission3_tasks || []).length > 3 && (
                                                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md">
                                                                        +{(s.mission3_tasks || []).length - 3} lainnya
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isPending && (
                                                        <Button
                                                            onClick={() => handleApprove(s.team_id)}
                                                            disabled={approving}
                                                            className="shrink-0 bg-[#1A5C0A] hover:bg-[#134407] text-white font-bold px-5 h-9 rounded-xl text-xs cursor-pointer"
                                                        >
                                                            {approving
                                                                ? <><Loader2 size={13} className="animate-spin mr-1" /> Menyetujui...</>
                                                                : <><ShieldCheck size={13} className="mr-1" /> Setujui Jadwal</>
                                                            }
                                                        </Button>
                                                    )}
                                                    {isApproved && (
                                                        <div className="shrink-0 flex items-center gap-1.5 text-[#1A5C0A] font-bold text-xs">
                                                            <CheckCircle size={16} /> Sudah Disetujui
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-1 border border-[#1A5C0A]/10 shadow-xl shadow-[#1A5C0A]/5">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 size={32} className="animate-spin text-[#1A5C0A]" />
                                    <p className="text-sm font-bold text-[#1A5C0A]/50 tracking-widest uppercase">Memuat Data...</p>
                                </div>
                            ) : (
                                <DataTable
                                    columns={
                                        n === 1 ? columnsM1 :
                                        n === 2 ? columnsM2 :
                                        n === 3 ? columnsM3 :
                                        columnsM4
                                    }
                                    data={data}
                                    filterColumn={n === 1 ? "full_name" : "team_name"}
                                    searchPlaceholder={n === 1 ? "Cari nama siswa..." : "Cari nama tim..."}
                                />
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* Drawer Dokumentasi Misi 4 */}
            <Drawer open={!!selectedM4Submission} onOpenChange={(open) => !open && setSelectedM4Submission(null)}>
                <DrawerContent className="max-h-[90vh] rounded-t-[3rem] border-none shadow-2xl bg-[#F7FFF4]">
                    <div className="mx-auto w-12 h-1.5 bg-[#1A5C0A]/10 rounded-full my-4 shrink-0" />
                    <DrawerHeader className="px-8 md:px-12 text-center md:text-left">
                        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                            <div className="p-2 bg-[#B4FF9F] rounded-xl">
                                <Camera size={20} className="text-[#1A5C0A]" />
                            </div>
                            <DrawerTitle className="text-2xl font-black text-[#333333] tracking-tight uppercase">
                                Dokumentasi Tim: {selectedM4Submission?.team_name}
                            </DrawerTitle>
                        </div>
                    </DrawerHeader>

                    <div className="px-8 md:px-12 pb-12 pt-6 overflow-y-auto">
                        {selectedM4Submission?.files && selectedM4Submission.files.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {selectedM4Submission.files.map((file, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                        {file.media_type === "foto" ? (
                                            <div className="aspect-square relative bg-gray-100">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={file.cloudinary_url} alt="Dokumentasi" className="w-full h-full object-cover" />
                                            </div>
                                        ) : file.media_type === "video" ? (
                                            <div className="aspect-square relative bg-black flex items-center justify-center group">
                                                <video src={file.cloudinary_url} className="w-full h-full object-contain" controls />
                                            </div>
                                        ) : (
                                            <div className="aspect-square relative bg-gray-100 flex items-center justify-center flex-col gap-2">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">📄</div>
                                                <span className="text-[10px] font-bold text-gray-500">Dokumen Pendukung</span>
                                            </div>
                                        )}
                                        {file.caption && (
                                            <div className="p-3 bg-white">
                                                <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-3">{file.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-sm font-medium text-gray-400">Belum ada dokumentasi</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-[#1A5C0A]/5 bg-white/80 backdrop-blur-md rounded-b-[3rem]">
                        <Button onClick={() => setSelectedM4Submission(null)} className="w-full h-12 rounded-2xl bg-[#1A5C0A] text-white font-black text-[10px] uppercase tracking-widest cursor-pointer">
                            Tutup
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
