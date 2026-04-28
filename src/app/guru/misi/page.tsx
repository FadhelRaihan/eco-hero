"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
    Target, 
    CheckCircle, 
    Clock, 
    FileText, 
    Image as ImageIcon, 
    Video as VideoIcon,
    Users,
    School,
    MessageSquare,
    Lightbulb,
    ClipboardList,
    Camera,
    Loader2,
    ExternalLink,
    Download,
    FileSpreadsheet,
    CalendarCheck,
    CalendarX,
    ShieldCheck
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ManajemenMisiPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("1");
    const [data, setData] = useState<any[]>([]);

    // ── Approval Jadwal Misi 3 ────────────────────────────────
    const [schedules, setSchedules] = useState<any[]>([]);
    const [schedulesLoading, setSchedulesLoading] = useState(false);
    const [approvingTeamId, setApprovingTeamId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) fetchMissionData(activeTab);
        if (user?.id && activeTab === "3") fetchSchedules();
    }, [user?.id, activeTab]);

    async function fetchSchedules() {
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
    }

    async function handleApprove(teamId: string) {
        setApprovingTeamId(teamId);
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

    async function fetchMissionData(missionNum: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/guru/submissions/${missionNum}?teacher_id=${user?.id}`);
            const result = await res.json();
            if (res.ok) {
                setData(result.data || []);
            } else {
                toast.error("Gagal mengambil data misi");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    const exportToExcel = async () => {
        if (data.length === 0) {
            toast.error("Tidak ada data untuk diekspor");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Misi ${activeTab}`);

        // Define columns based on mission
        let columns: any[] = [];
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
        data.forEach((item) => {
            let rowData: any = {};
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
                const completed = tasks.filter((t: any) => t.status === "selesai").length;
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
                    links: files.map((f: any) => f.cloudinary_url).join(", "),
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
    const columnsM1: ColumnDef<any>[] = [
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
    const columnsM2: ColumnDef<any>[] = [
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
    const columnsM3: ColumnDef<any>[] = [
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
                const completed = tasks.filter((t: any) => t.status === "selesai").length;
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
    const columnsM4: ColumnDef<any>[] = [
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
                const files = row.original.files || [];
                return (
                    <div className="flex -space-x-2">
                        {files.slice(0, 3).map((file: any, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                                {file.media_type === "image" ? (
                                    <img src={file.cloudinary_url} alt="" className="w-full h-full object-cover" />
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
                    </div>
                );
            },
        },
    ];

    return (
        <div className="mx-auto px-8 py-6 space-y-8 animate-in fade-in duration-500">
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
                <TabsList className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1A5C0A]/10 w-fit flex h-auto">
                    {[
                        { id: "1", label: "Misi 1", icon: MessageSquare },
                        { id: "2", label: "Misi 2", icon: Lightbulb },
                        { id: "3", label: "Misi 3", icon: ClipboardList },
                        { id: "4", label: "Misi 4", icon: Camera },
                    ].map((tab) => (
                        <TabsTrigger 
                            key={tab.id} 
                            value={tab.id}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-[#1A5C0A] data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <tab.icon size={16} />
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
                                        schedules.map((s: any) => {
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
                                                                {(s.mission3_tasks || []).slice(0, 3).map((t: any) => (
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
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
