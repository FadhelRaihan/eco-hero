"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
    Users, 
    CheckCircle, 
    Clock, 
    Lock, 
    PlayCircle, 
    Download, 
    Loader2, 
    Target, 
    FileText, 
    Image as ImageIcon, 
    Video as VideoIcon,
    ExternalLink,
    School,
    Briefcase,
    Trash2,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown } from "lucide-react";

interface StudentProgress {
    student_id: string;
    full_name: string;
    team_role: string;
    class_id: string;
    class_name: string;
    team_id?: string;
    team_name: string;
    missions: {
        mission_number: number;
        status: string;
        badge_earned: boolean;
    }[];
}

const STATUS_CONFIG = {
    completed: { icon: CheckCircle, color: "text-[#1A5C0A] bg-[#B4FF9F]" },
    in_progress: { icon: PlayCircle, color: "text-[#7A7200] bg-[#F9FFA4]" },
    locked: { icon: Lock, color: "text-[#333333]/30 bg-[#333333]/5" },
};

export default function ManajemenSiswaPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [selectedClass, setSelectedClass] = useState<string>("all");
    const [classes, setClasses] = useState<{id: string, name: string}[]>([]);

    // Drawer state
    const [drawerType, setDrawerType] = useState<'MISSION' | 'TEAM' | null>(null);
    const [selectedMission, setSelectedMission] = useState<number | null>(null);
    const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<StudentProgress | null>(null);
    const [submissionDetail, setSubmissionDetail] = useState<any>(null);
    const [teamDetail, setTeamDetail] = useState<any>(null);
    const [loadingDrawer, setLoadingDrawer] = useState(false);

    // Delete state
    const [studentToDelete, setStudentToDelete] = useState<StudentProgress | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchStudents();
            fetchClasses();
        }
    }, [user?.id]);

    async function fetchClasses() {
        try {
            const res = await fetch(`/api/classes?teacher_id=${user?.id}`);
            const result = await res.json();
            if (res.ok) setClasses(result.data ?? []);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    }

    async function fetchStudents() {
        try {
            const res = await fetch(`/api/guru/students?teacher_id=${user?.id}`);
            const result = await res.json();
            if (res.ok) setStudents(result.data ?? []);
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/guru/students/${studentToDelete.student_id}?class_id=${studentToDelete.class_id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setStudents(prev => prev.filter(s => !(s.student_id === studentToDelete.student_id && s.class_id === studentToDelete.class_id)));
                toast.success("Siswa berhasil dihapus");
                setStudentToDelete(null);
            } else {
                toast.error("Gagal menghapus siswa");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setDeleting(false);
        }
    };

    const handleOpenMissionDrawer = async (student: StudentProgress, missionNumber: number) => {
        setSelectedStudentForDrawer(student);
        setSelectedMission(missionNumber);
        setDrawerType('MISSION');
        setLoadingDrawer(true);
        setSubmissionDetail(null);

        try {
            const res = await fetch(`/api/guru/submissions/${missionNumber}/${student.student_id}`);
            const result = await res.json();
            if (res.ok) {
                setSubmissionDetail(result.data);
            } else {
                toast.error("Gagal mengambil detail submission");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat mengambil data");
        } finally {
            setLoadingDrawer(false);
        }
    };

    const handleOpenTeamDrawer = async (student: StudentProgress) => {
        if (!student.team_id) return;
        setSelectedStudentForDrawer(student);
        setDrawerType('TEAM');
        setLoadingDrawer(true);
        setTeamDetail(null);

        try {
            const res = await fetch(`/api/guru/teams/${student.team_id}`);
            const result = await res.json();
            if (res.ok) {
                setTeamDetail(result.data);
            } else {
                toast.error("Gagal mengambil detail tim");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat mengambil data");
        } finally {
            setLoadingDrawer(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            if (filteredStudents.length === 0) {
                toast.error("Tidak ada data untuk diekspor");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Manajemen Siswa');

            worksheet.columns = [
                { header: 'Nama Siswa', key: 'full_name', width: 30 },
                { header: 'Kelas', key: 'class_name', width: 20 },
                { header: 'Nama Tim', key: 'team_name', width: 25 },
                { header: 'Misi 1', key: 'm1', width: 15 },
                { header: 'Misi 2', key: 'm2', width: 15 },
                { header: 'Misi 3', key: 'm3', width: 15 },
                { header: 'Misi 4', key: 'm4', width: 15 },
            ];

            filteredStudents.forEach(student => {
                const getStatus = (num: number) => student.missions.find(m => m.mission_number === num)?.status || 'locked';
                worksheet.addRow({
                    full_name: student.full_name,
                    class_name: student.class_name,
                    team_name: student.team_name,
                    m1: getStatus(1).toUpperCase(),
                    m2: getStatus(2).toUpperCase(),
                    m3: getStatus(3).toUpperCase(),
                    m4: getStatus(4).toUpperCase(),
                });
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
            const className = selectedClass === "all" ? "Semua_Kelas" : classes.find(c => c.id === selectedClass)?.name || "Kelas";
            const fileName = `Manajemen_Siswa_${className}_${new Date().getTime()}.xlsx`;
            
            saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
            toast.success(`Data ${filteredStudents.length} siswa berhasil diekspor`);
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Gagal mengekspor data");
        }
    };

    const columns: ColumnDef<StudentProgress>[] = [
        {
            accessorKey: "full_name",
            header: "Nama Siswa",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-[#1A5C0A]/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.getValue("full_name")}`} />
                        <AvatarFallback className="bg-[#B4FF9F] text-[#1A5C0A] text-[10px] font-bold">
                            {(row.getValue("full_name") as string).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-[#333333] text-sm">{row.getValue("full_name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "class_name",
            header: "Kelas",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <School size={14} className="text-[#1A5C0A]/40" />
                    <span className="text-xs font-bold text-[#333333]/60">{row.getValue("class_name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "team_name",
            header: "Tim",
            cell: ({ row }) => {
                const student = row.original;
                return (
                    <button
                        onClick={() => student.team_id && handleOpenTeamDrawer(student)}
                        disabled={!student.team_id}
                        className={cn(
                            "text-xs font-bold truncate max-w-[100px] transition-all",
                            student.team_id 
                                ? "text-[#1A5C0A] hover:underline cursor-pointer" 
                                : "text-[#333333]/40 cursor-not-allowed"
                        )}
                    >
                        {row.getValue("team_name") || "-"}
                    </button>
                );
            },
        },
        ...[1, 2, 3, 4].map((num) => ({
            id: `misi-${num}`,
            header: () => <div className="text-center w-12">M{num}</div>,
            cell: ({ row }: { row: { original: StudentProgress } }) => {
                const mission = row.original.missions.find((m) => m.mission_number === num);
                const status = mission?.status ?? "locked";
                const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                
                return (
                    <div className="flex justify-center w-12">
                        <button
                            onClick={() => status !== "locked" && handleOpenMissionDrawer(row.original, num)}
                            disabled={status === "locked"}
                            className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                status !== "locked" ? "hover:scale-110 active:scale-95 shadow-sm cursor-pointer" : "opacity-50 cursor-not-allowed",
                                config.color
                            )}
                        >
                            {config.icon && <config.icon size={16} />}
                        </button>
                    </div>
                );
            },
        })),
        {
            id: "actions",
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => setStudentToDelete(row.original)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    const filteredStudents = selectedClass === "all" 
        ? students 
        : students.filter(s => s.class_id === selectedClass);

    return (
        <div className="mx-auto px-8 py-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-[#333333] tracking-tight">Manajemen Siswa</h1>
                    <p className="text-xs text-[#333333]/60 font-bold uppercase tracking-widest">{students.length} Total Siswa Terdaftar</p>
                </div>

                <Button
                    onClick={handleExportExcel}
                    className="bg-[#B4FF9F] hover:bg-[#B4FF9F]/80 text-[#1A5C0A] font-bold px-6 h-11 rounded-xl shadow-sm border border-[#1A5C0A]/10 transition-all active:scale-95 cursor-pointer"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Ekspor Excel
                </Button>
            </div>

            {/* Table Area */}
            <div className="space-y-4">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-1 border border-[#1A5C0A]/10 shadow-xl shadow-[#1A5C0A]/5">
                    <DataTable
                        columns={columns as any}
                        data={filteredStudents}
                        filterColumn="full_name"
                        searchPlaceholder="Cari nama siswa..."
                        extraActions={
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-12 w-full md:w-auto px-5 border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:text-[#1A5C0A] hover:border-[#1A5C0A] transition-all bg-white"
                                    >
                                        <Filter className="w-4 h-4 mr-2 text-[#1A5C0A]/40" />
                                        {selectedClass === "all" ? "Semua Kelas" : classes.find(c => c.id === selectedClass)?.name}
                                        <ChevronDown className="w-3 h-3 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl p-2">
                                    <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Filter Kelas</p>
                                    <DropdownMenuRadioGroup value={selectedClass} onValueChange={setSelectedClass}>
                                        <DropdownMenuRadioItem value="all" className="rounded-xl font-bold text-xs py-2 mb-1">
                                            Semua Kelas
                                        </DropdownMenuRadioItem>
                                        {classes.map((c) => (
                                            <DropdownMenuRadioItem key={c.id} value={c.id} className="rounded-xl font-bold text-xs py-2 mb-1">
                                                {c.name}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        }
                    />
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                <AlertDialogContent className="rounded-[2.5rem] border-none p-8">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-[#333333] uppercase tracking-tight">Hapus Siswa?</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium text-[#333333]/60 italic">
                            Apakah Anda yakin ingin menghapus <span className="font-bold text-[#1A5C0A]">{studentToDelete?.full_name}</span> dari kelas <span className="font-bold text-[#1A5C0A]">{studentToDelete?.class_name}</span>? Data progress misi dan tim juga akan dihapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="rounded-2xl border-none bg-gray-100 font-bold uppercase tracking-widest text-[10px] h-11 cursor-pointer">Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteStudent}
                            disabled={deleting}
                            className="rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest text-[10px] h-11 border-none cursor-pointer"
                        >
                            {deleting ? "Menghapus..." : "Hapus Sekarang"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Submission & Team Drawer */}
            <Drawer open={!!drawerType} onOpenChange={(open) => !open && setDrawerType(null)}>
                <DrawerContent className="max-h-[90vh] rounded-t-[3rem] border-none shadow-2xl bg-[#F7FFF4] focus-visible:outline-none">
                    <div className="mx-auto w-12 h-1.5 bg-[#1A5C0A]/10 rounded-full my-4 shrink-0" />
                    
                    <DrawerHeader className="px-8 md:px-12 text-center md:text-left">
                        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                            <div className="p-2 bg-[#B4FF9F] rounded-xl">
                                {drawerType === 'MISSION' ? <Target className="w-5 h-5 text-[#1A5C0A]" /> : <Users className="w-5 h-5 text-[#1A5C0A]" />}
                            </div>
                            <DrawerTitle className="text-2xl font-black text-[#333333] tracking-tight uppercase">
                                {drawerType === 'MISSION' 
                                    ? `Detail Misi ${selectedMission}: ${selectedStudentForDrawer?.full_name}`
                                    : `Detail Tim: ${teamDetail?.name || selectedStudentForDrawer?.team_name}`}
                            </DrawerTitle>
                        </div>
                        <DrawerDescription className="font-bold text-[#1A5C0A]/60 uppercase tracking-widest text-[10px]">
                            {drawerType === 'MISSION' 
                                ? `Hasil pekerjaan siswa untuk misi ke-${selectedMission}`
                                : `Informasi lengkap mengenai anggota dan kesatuan tim`}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-8 md:px-12 pb-12 pt-6 overflow-y-auto custom-scrollbar">
                        {loadingDrawer ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 text-[#1A5C0A] animate-spin" />
                                <p className="text-[#333333]/40 font-bold uppercase tracking-widest text-xs">Menarik data dari arsip...</p>
                            </div>
                        ) : drawerType === 'MISSION' ? (
                            !submissionDetail ? (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                                        <FileText className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-[#333333]/40 font-bold italic uppercase tracking-widest text-xs">Belum ada submission yang tersimpan</p>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Mission Rendering (Same as Detail Kelas) */}
                                    {selectedMission === 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 rounded-[2rem] bg-white border border-[#1A5C0A]/5 shadow-sm">
                                                <h4 className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-[0.2em] mb-4">Perspektif Lingkungan</h4>
                                                <p className="text-sm text-[#333333] leading-relaxed font-medium">{submissionDetail.perspective_env}</p>
                                            </div>
                                            <div className="p-6 rounded-[2rem] bg-white border border-[#1A5C0A]/5 shadow-sm">
                                                <h4 className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-[0.2em] mb-4">Perspektif Sosial</h4>
                                                <p className="text-sm text-[#333333] leading-relaxed font-medium">{submissionDetail.perspective_soc}</p>
                                            </div>
                                            <div className="md:col-span-2 p-4 rounded-2xl bg-[#F9FFA4]/30 border border-[#F9FFA4] inline-block w-fit">
                                                <span className="text-[10px] font-black text-[#7A7200] uppercase tracking-widest">Topik Kasus: {submissionDetail.case_topic}</span>
                                            </div>
                                        </div>
                                    )}

                                    {selectedMission === 2 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { label: "Masalah Lingkungan", val: submissionDetail.env_problem, icon: ImageIcon },
                                                { label: "Masalah Sosial", val: submissionDetail.social_problem, icon: Users },
                                                { label: "Solusi Kreatif", val: submissionDetail.solution, icon: Target },
                                                { label: "Alasan Solusi", val: submissionDetail.solution_reason, icon: FileText },
                                                { label: "Jenis Aksi", val: submissionDetail.action_type, icon: Briefcase },
                                                { label: "Nama Aksi", val: submissionDetail.action_name, icon: Target },
                                                { label: "Bahan & Alat", val: submissionDetail.materials, icon: ImageIcon },
                                                { label: "Target Audience", val: submissionDetail.target_audience, icon: Users },
                                            ].map((item, i) => (
                                                <div key={i} className="p-5 rounded-[2rem] bg-white border border-[#1A5C0A]/5 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <item.icon size={14} className="text-[#1A5C0A]/40" />
                                                        <h4 className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-widest">{item.label}</h4>
                                                    </div>
                                                    <p className="text-sm text-[#333333] leading-relaxed font-medium">{item.val}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedMission === 3 && submissionDetail.tasks && (
                                        <div className="space-y-3">
                                            {submissionDetail.tasks.map((task: any, i: number) => (
                                                <div key={i} className="p-4 rounded-2xl bg-white border border-[#1A5C0A]/5 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", task.status === "selesai" ? "bg-[#B4FF9F] text-[#1A5C0A]" : "bg-gray-100 text-gray-400")}>
                                                            {task.status === "selesai" ? <CheckCircle size={20} /> : <Clock size={20} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-[#333333]">{task.title}</h4>
                                                            <p className="text-[10px] font-bold text-[#1A5C0A] uppercase tracking-widest">PJ: {task.user?.full_name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full", task.status === "selesai" ? "bg-[#B4FF9F]/20 text-[#1A5C0A]" : "bg-gray-100 text-gray-400")}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedMission === 4 && submissionDetail.files && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {submissionDetail.files.map((file: any, i: number) => (
                                                <div key={i} className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-[#1A5C0A]/10 shadow-lg hover:shadow-2xl transition-all duration-500">
                                                    <div className="aspect-square relative overflow-hidden">
                                                        {file.media_type === "image" ? (
                                                            <img src={file.cloudinary_url} alt={file.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        ) : (
                                                            <div className="w-full h-full bg-[#1A5C0A] flex flex-col items-center justify-center gap-3 text-[#B4FF9F]">
                                                                <VideoIcon size={48} />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Video Submission</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                                            <p className="text-white text-xs font-medium leading-relaxed italic">"{file.caption}"</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-5 border-t border-[#1A5C0A]/5 bg-white flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {file.media_type === "image" ? <ImageIcon size={14} className="text-[#1A5C0A]" /> : <VideoIcon size={14} className="text-[#1A5C0A]" />}
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1A5C0A]">{file.media_type}</span>
                                                        </div>
                                                        <a href={file.cloudinary_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-[#B4FF9F] flex items-center justify-center text-[#1A5C0A] hover:bg-[#1A5C0A] hover:text-[#B4FF9F] transition-all shadow-sm">
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            /* TEAM DETAILS VIEW */
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-[2.5rem] bg-white border border-[#1A5C0A]/10 shadow-sm flex items-center gap-4">
                                        <div className="w-14 h-14 bg-[#B4FF9F] rounded-2xl flex items-center justify-center text-[#1A5C0A]"><Users size={28} /></div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-[#1A5C0A]/40 uppercase tracking-widest mb-1">Nama Tim</h4>
                                            <p className="text-xl font-black text-[#333333]">{teamDetail?.name}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-[2.5rem] bg-white border border-[#1A5C0A]/10 shadow-sm flex items-center gap-4">
                                        <div className="w-14 h-14 bg-[#F9FFA4] rounded-2xl flex items-center justify-center text-[#7A7200]"><Target size={28} /></div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-[#7A7200]/40 uppercase tracking-widest mb-1">Topik Fokus</h4>
                                            <p className="text-xl font-black text-[#333333] capitalize">{teamDetail?.selected_case}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-[#333333]/40 uppercase tracking-[0.2em] px-2">Anggota Kesatuan ({teamDetail?.team_members?.length || 0})</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {teamDetail?.team_members?.map((member: any, i: number) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white border border-[#1A5C0A]/5 flex items-center gap-4 shadow-sm">
                                                <Avatar className="w-12 h-12 border-2 border-[#1A5C0A]/5">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.users?.full_name}`} />
                                                    <AvatarFallback className="bg-[#B4FF9F] text-[#1A5C0A] font-bold">{member.users?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h5 className="text-sm font-bold text-[#333333]">{member.users?.full_name}</h5>
                                                    <p className="text-[10px] font-bold text-[#1A5C0A]/60 uppercase tracking-widest">ID: {member.student_id.split('-')[0]}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DrawerFooter className="bg-white/80 backdrop-blur-md px-8 py-6 rounded-b-[3rem] border-t border-[#1A5C0A]/5">
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-[#1A5C0A]/10 font-black uppercase tracking-[0.2em] text-[10px] text-[#1A5C0A] hover:bg-[#1A5C0A] hover:text-white transition-all shadow-sm cursor-pointer">
                                Tutup {drawerType === 'MISSION' ? 'Laporan' : 'Info Tim'}
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
