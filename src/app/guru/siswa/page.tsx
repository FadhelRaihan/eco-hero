"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    Users,
    CheckCircle,
    Lock,
    PlayCircle,
    Download,
    Loader2,
    Target,
    Trash2,
    Pencil,
    UserPlus
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
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

interface TeamDetail {
    id: string;
    name: string;
    selected_case: string;
    team_members: {
        student_id: string;
        users: {
            full_name: string;
        };
    }[];
}

interface Mission1Detail {
    case_topic?: string;
    perspective_env?: string;
    perspective_soc?: string;
    created_at?: string;
}

interface Mission2Detail {
    env_problem?: string;
    social_problem?: string;
    solution?: string;
    solution_reason?: string;
    action_type?: string;
    action_name?: string;
    materials?: string;
    target_audience?: string;
}

interface Mission3Task {
    id: string;
    title: string;
    scheduled_date: string;
    status: string;
    user?: { full_name: string };
}

interface Mission3Detail {
    tasks?: Mission3Task[];
}

interface Mission4File {
    id: string;
    cloudinary_url: string;
    media_type: string;
    caption?: string;
    created_at?: string;
}

interface Mission4Detail {
    files?: Mission4File[];
}

export default function ManajemenSiswaPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState("");

    // Drawer state
    const [drawerType, setDrawerType] = useState<'MISSION' | 'TEAM' | null>(null);
    const [selectedMission, setSelectedMission] = useState<number | null>(null);
    const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<StudentProgress | null>(null);
    const [submissionDetail, setSubmissionDetail] = useState<unknown>(null);
    const [teamDetail, setTeamDetail] = useState<TeamDetail | null>(null);
    const [loadingDrawer, setLoadingDrawer] = useState(false);

    // Add/Edit states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<StudentProgress | null>(null);
    const [editingStudent, setEditingStudent] = useState<StudentProgress | null>(null);

    // Form inputs
    const [newStudent, setNewStudent] = useState({ full_name: "" });
    const [editName, setEditName] = useState("");
    const [deleting, setDeleting] = useState(false);

    const fetchStudents = useCallback(async () => {
        try {
            const res = await fetch(`/api/guru/students?teacher_id=${user?.id}`);
            const result = await res.json();
            if (res.ok) {
                setStudents(result.data ?? []);
                if (result.data && result.data.length > 0) {
                    setClassName(result.data[0].class_name);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchStudents();
        }
    }, [user?.id, fetchStudents]);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setFormLoading(true);
        try {
            const res = await fetch("/api/guru/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newStudent, teacher_id: user.id }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Siswa berhasil ditambahkan");
                setIsAddDialogOpen(false);
                setNewStudent({ full_name: "" });
                fetchStudents();
            } else {
                toast.error(result.error || "Gagal menambahkan siswa");
            }
        } catch {
            toast.error("Terjadi kesalahan");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        setFormLoading(true);
        try {
            const res = await fetch(`/api/guru/students/${editingStudent.student_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: editName }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Nama siswa berhasil diperbarui");
                setIsEditDialogOpen(false);
                fetchStudents();
            } else {
                toast.error(result.error || "Gagal memperbarui siswa");
            }
        } catch {
            toast.error("Terjadi kesalahan");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/guru/students/${studentToDelete.student_id}?class_id=${studentToDelete.class_id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setStudents(prev => prev.filter(s => s.student_id !== studentToDelete.student_id));
                toast.success("Siswa berhasil dihapus");
                setStudentToDelete(null);
            } else {
                toast.error("Gagal menghapus siswa");
            }
        } catch {
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
        } catch {
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
        } catch {
            toast.error("Terjadi kesalahan saat mengambil data");
        } finally {
            setLoadingDrawer(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            if (students.length === 0) {
                toast.error("Tidak ada data untuk diekspor");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Manajemen Siswa');

            worksheet.columns = [
                { header: 'Nama Siswa', key: 'full_name', width: 30 },
                { header: 'Nama Tim', key: 'team_name', width: 25 },
                { header: 'Misi 1', key: 'm1', width: 15 },
                { header: 'Misi 2', key: 'm2', width: 15 },
                { header: 'Misi 3', key: 'm3', width: 15 },
                { header: 'Misi 4', key: 'm4', width: 15 },
            ];

            students.forEach(student => {
                const getStatus = (num: number) => student.missions.find(m => m.mission_number === num)?.status || 'locked';
                worksheet.addRow({
                    full_name: student.full_name,
                    team_name: student.team_name,
                    m1: getStatus(1).toUpperCase(),
                    m2: getStatus(2).toUpperCase(),
                    m3: getStatus(3).toUpperCase(),
                    m4: getStatus(4).toUpperCase(),
                });
            });

            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: "FF1A5C0A" } };
            headerRow.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB4FF9F" } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer], { type: "application/octet-stream" }), `Manajemen_Siswa_${className}_${new Date().getTime()}.xlsx`);
            toast.success(`Data ${students.length} siswa berhasil diekspor`);
        } catch {
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
            accessorKey: "team_name",
            header: "Tim",
            cell: ({ row }) => {
                const student = row.original;
                const teamName = student.team_name;
                if (!teamName) return <div className="flex justify-center w-8 md:w-12 text-[#333333]/40 font-bold">-</div>;
                return (
                    <div className="flex items-center gap-2 min-w-[80px] md:min-w-[120px]">
                        <button
                            onClick={() => student.team_id && handleOpenTeamDrawer(student)}
                            className="flex items-center gap-2 cursor-pointer hover:underline"
                        >
                            <div className="w-6 h-6 rounded-lg bg-[#F9FFA4] flex items-center justify-center shrink-0">
                                <Users size={12} className="text-[#7A7200]" />
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-[#333333] truncate">
                                {teamName}
                            </span>
                        </button>
                    </div>
                );
            },
        },
        {
            id: "m1",
            header: () => <div className="text-center w-8 md:w-12">M1</div>,
            cell: ({ row }) => {
                const num = 1;
                const mission = row.original.missions.find((m) => m.mission_number === num);
                const status = mission?.status ?? "locked";
                const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                return (
                    <div className="flex justify-center w-8 md:w-12">
                        <button
                            onClick={() => status !== "locked" && handleOpenMissionDrawer(row.original, num)}
                            disabled={status === "locked"}
                            className={cn(
                                "w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110",
                                status !== "locked" ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                                config.color
                            )}
                        >
                            {config.icon && <config.icon size={12} />}
                        </button>
                    </div>
                );
            },
        },
        {
            id: "m2",
            header: () => <div className="text-center w-8 md:w-12">M2</div>,
            cell: ({ row }) => {
                const num = 2;
                const mission = row.original.missions.find((m) => m.mission_number === num);
                const status = mission?.status ?? "locked";
                const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                return (
                    <div className="flex justify-center w-8 md:w-12">
                        <button
                            onClick={() => status !== "locked" && handleOpenMissionDrawer(row.original, num)}
                            disabled={status === "locked"}
                            className={cn(
                                "w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110",
                                status !== "locked" ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                                config.color
                            )}
                        >
                            {config.icon && <config.icon size={12} />}
                        </button>
                    </div>
                );
            },
        },
        {
            id: "m3",
            header: () => <div className="text-center w-8 md:w-12">M3</div>,
            cell: ({ row }) => {
                const num = 3;
                const mission = row.original.missions.find((m) => m.mission_number === num);
                const status = mission?.status ?? "locked";
                const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                return (
                    <div className="flex justify-center w-8 md:w-12">
                        <button
                            onClick={() => status !== "locked" && handleOpenMissionDrawer(row.original, num)}
                            disabled={status === "locked"}
                            className={cn(
                                "w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110",
                                status !== "locked" ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                                config.color
                            )}
                        >
                            {config.icon && <config.icon size={12} />}
                        </button>
                    </div>
                );
            },
        },
        {
            id: "m4",
            header: () => <div className="text-center w-8 md:w-12">M4</div>,
            cell: ({ row }) => {
                const num = 4;
                const mission = row.original.missions.find((m) => m.mission_number === num);
                const status = mission?.status ?? "locked";
                const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                return (
                    <div className="flex justify-center w-8 md:w-12">
                        <button
                            onClick={() => status !== "locked" && handleOpenMissionDrawer(row.original, num)}
                            disabled={status === "locked"}
                            className={cn(
                                "w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110",
                                status !== "locked" ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                                config.color
                            )}
                        >
                            {config.icon && <config.icon size={12} />}
                        </button>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center w-8 md:w-12">Aksi</div>,
            cell: ({ row }) => {
                const student = row.original;
                return (
                    <div className="flex items-center justify-center gap-1 md:gap-2 w-8 md:w-12">
                        <button
                            onClick={() => {
                                setEditingStudent(student);
                                setEditName(student.full_name);
                                setIsEditDialogOpen(true);
                            }}
                            className="p-1.5 md:p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                );
            },
        },
    ];

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
                    <h1 className="text-2xl font-black text-[#333333] tracking-tight">Manajemen Siswa</h1>
                    <p className="text-xs text-[#333333]/60 font-bold uppercase tracking-widest">{className || "Siswa Kelas"} • {students.length} Total Terdaftar</p>
                </div>

                <div className="flex gap-2 md:gap-3">
                    <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-[#1A5C0A] hover:bg-[#1A5C0A]/90 text-white font-bold px-4 md:px-6 h-9 md:h-11 text-[10px] md:text-sm rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                        <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        Tambah Siswa
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        className="bg-[#B4FF9F] hover:bg-[#B4FF9F]/80 text-[#1A5C0A] font-bold px-4 md:px-6 h-9 md:h-11 text-[10px] md:text-sm rounded-xl shadow-sm border border-[#1A5C0A]/10 transition-all active:scale-95 cursor-pointer"
                    >
                        <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        Ekspor
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-1 border border-[#1A5C0A]/10 shadow-xl shadow-[#1A5C0A]/5">
                <DataTable
                    columns={columns}
                    data={students}
                    filterColumn="full_name"
                    searchPlaceholder="Cari nama siswa..."
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                <AlertDialogContent className="rounded-[2.5rem] border-none p-8">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-[#333333] uppercase tracking-tight">Hapus Siswa?</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium text-[#333333]/60 italic">
                            Apakah Anda yakin ingin menghapus <span className="font-bold text-[#1A5C0A]">{studentToDelete?.full_name}</span>? Data progress misi dan tim juga akan dihapus secara permanen.
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

            {/* Add Student Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="rounded-2xl bg-[#F7FFF4]">
                    <DialogHeader className="px-4 pt-4">
                        <DialogTitle className="text-2xl font-black text-[#333333]">Tambah Siswa Baru</DialogTitle>
                        <DialogDescription className="font-bold text-[#1A5C0A]/60 uppercase tracking-widest text-[10px]">
                            Daftarkan siswa baru ke dalam kelas Anda
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddStudent} className="space-y-6 mt-4">
                        <div className="space-y-4 px-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-[#333333]/40 ml-1">Nama Lengkap</Label>
                                <Input
                                    required
                                    placeholder="Contoh: Ahmad Subardjo"
                                    className="h-12 rounded-xl bg-white border-[#1A5C0A]/10 focus:ring-[#1A5C0A]"
                                    value={newStudent.full_name}
                                    onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddDialogOpen(false)}
                                className="px-8 h-12 rounded-xl font-bold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={formLoading}
                                className="bg-[#1A5C0A] hover:bg-[#1A5C0A]/90 text-white rounded-xl font-bold px-8 h-12"
                            >
                                {formLoading ? <Loader2 className="animate-spin mr-2" /> : "Tambah Siswa"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="rounded-2xl bg-[#F7FFF4]">
                    <DialogHeader className="px-4 pt-4">
                        <DialogTitle className="text-2xl font-black text-[#333333]">Edit Nama Siswa</DialogTitle>
                        <DialogDescription className="font-bold text-[#1A5C0A]/60 uppercase tracking-widest text-[10px]">
                            Perbarui identitas siswa terpilih
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditStudent} className="space-y-6 mt-4">
                        <div className="space-y-2 px-4">
                            <Label className="text-[10px] font-black uppercase text-[#333333]/40 ml-1">Nama Lengkap</Label>
                            <Input
                                required
                                className="h-12 rounded-xl bg-white border-[#1A5C0A]/10 focus:ring-[#1A5C0A]"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEditDialogOpen(false)}
                                className="px-8 h-12 rounded-xl font-bold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={formLoading}
                                className="bg-[#1A5C0A] hover:bg-[#1A5C0A]/90 text-white rounded-xl font-bold px-8 h-12"
                            >
                                {formLoading ? <Loader2 className="animate-spin mr-2" /> : "Edit Siswa"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Submission & Team Drawer */}
            <Drawer open={!!drawerType} onOpenChange={(open) => !open && setDrawerType(null)}>
                <DrawerContent className="max-h-[90vh] rounded-t-[3rem] border-none shadow-2xl bg-[#F7FFF4]">
                    <div className="mx-auto w-12 h-1.5 bg-[#1A5C0A]/10 rounded-full my-4 shrink-0" />
                    <DrawerHeader className="px-8 md:px-12 text-center md:text-left">
                        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                            <div className="p-2 bg-[#B4FF9F] rounded-xl">
                                {drawerType === 'MISSION' ? <Target className="w-5 h-5 text-[#1A5C0A]" /> : <Users size={20} className="text-[#1A5C0A]" />}
                            </div>
                            <DrawerTitle className="text-2xl font-black text-[#333333] tracking-tight uppercase">
                                {drawerType === 'MISSION' ? `Misi ${selectedMission}: ${selectedStudentForDrawer?.full_name}` : `Tim: ${teamDetail?.name || selectedStudentForDrawer?.team_name}`}
                            </DrawerTitle>
                        </div>
                    </DrawerHeader>

                    <div className="px-8 md:px-12 pb-12 pt-6 overflow-y-auto">
                        {loadingDrawer ? (
                            <div className="py-20 text-center"><Loader2 className="w-10 h-10 text-[#1A5C0A] animate-spin mx-auto mb-4" /><p className="text-xs font-bold text-gray-400">MEMUAT DATA...</p></div>
                        ) : drawerType === 'MISSION' ? (
                            submissionDetail ? (
                                <div className="space-y-6">
                                    {selectedMission === 1 ? (
                                        <div className="space-y-4">
                                            <div className="bg-white p-5 rounded-2xl border border-[#1A5C0A]/10 shadow-sm flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#B4FF9F]/30 flex items-center justify-center shrink-0">
                                                    <Target className="w-5 h-5 text-[#1A5C0A]" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-[#1A5C0A] uppercase tracking-widest mb-1">Kasus yang Dipilih</p>
                                                    <p className="text-sm font-bold text-[#333333] capitalize">{(submissionDetail as Mission1Detail).case_topic?.replace(/_/g, ' ') || "-"}</p>
                                                </div>
                                            </div>

                                            <div className="bg-[#FFFDF1] p-5 rounded-2xl border border-[#7A7200]/10 shadow-sm">
                                                <p className="text-[10px] font-bold text-[#7A7200] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#7A7200]" />
                                                    Perspektif Lingkungan
                                                </p>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{(submissionDetail as Mission1Detail).perspective_env || "-"}</p>
                                            </div>

                                            <div className="bg-[#F4F9FF] p-5 rounded-2xl border border-[#004A7A]/10 shadow-sm">
                                                <p className="text-[10px] font-bold text-[#004A7A] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#004A7A]" />
                                                    Perspektif Sosial
                                                </p>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{(submissionDetail as Mission1Detail).perspective_soc || "-"}</p>
                                            </div>

                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-6">
                                                Dikirim pada: {new Date((submissionDetail as Mission1Detail).created_at || "").toLocaleString("id-ID", { dateStyle: 'long', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    ) : selectedMission === 2 ? (
                                        <div className="space-y-4">
                                            <div className="bg-[#F4F9FF] p-5 rounded-2xl border border-[#004A7A]/10 shadow-sm">
                                                <p className="text-[10px] font-bold text-[#004A7A] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#004A7A]" /> Masalah Lingkungan
                                                </p>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{(submissionDetail as Mission2Detail).env_problem || "-"}</p>
                                            </div>
                                            <div className="bg-[#FFFDF1] p-5 rounded-2xl border border-[#7A7200]/10 shadow-sm">
                                                <p className="text-[10px] font-bold text-[#7A7200] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#7A7200]" /> Masalah Sosial
                                                </p>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{(submissionDetail as Mission2Detail).social_problem || "-"}</p>
                                            </div>
                                            <div className="bg-[#F7FFF4] p-5 rounded-2xl border border-[#1A5C0A]/10 shadow-sm">
                                                <p className="text-[10px] font-bold text-[#1A5C0A] uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#1A5C0A]" /> Solusi: {(submissionDetail as Mission2Detail).action_name || "-"} ({(submissionDetail as Mission2Detail).action_type || "-"})
                                                </p>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap mb-3">{(submissionDetail as Mission2Detail).solution || "-"}</p>
                                                <p className="text-[10px] font-bold text-[#1A5C0A]/60 uppercase tracking-widest mb-1">Alasan</p>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{(submissionDetail as Mission2Detail).solution_reason || "-"}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alat & Bahan</p>
                                                    <p className="text-xs font-bold text-gray-700">{(submissionDetail as Mission2Detail).materials || "-"}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Sasaran</p>
                                                    <p className="text-xs font-bold text-gray-700">{(submissionDetail as Mission2Detail).target_audience || "-"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedMission === 3 ? (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-widest mb-2 px-2">Jadwal & Tugas Tim</h4>
                                            {((submissionDetail as Mission3Detail).tasks || []).length > 0 ? (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {((submissionDetail as Mission3Detail).tasks || []).map((task, idx) => (
                                                        <div key={task.id || idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                                                            <div>
                                                                <p className="text-sm font-bold text-[#333333]">{task.title}</p>
                                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A5C0A]/40" />
                                                                    {task.user?.full_name || "Anggota Tim"} • {new Date(task.scheduled_date).toLocaleDateString("id-ID")}
                                                                </p>
                                                            </div>
                                                            <div className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shrink-0", 
                                                                task.status === "selesai" ? "bg-[#B4FF9F]/30 text-[#1A5C0A]" : "bg-[#F9FFA4]/30 text-[#7A7200]"
                                                            )}>
                                                                {task.status}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-sm font-medium text-gray-400">Belum ada tugas yang dijadwalkan</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedMission === 4 ? (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-widest mb-2 px-2">Dokumentasi Aksi</h4>
                                            {((submissionDetail as Mission4Detail).files || []).length > 0 ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {((submissionDetail as Mission4Detail).files || []).map((file, idx) => (
                                                        <div key={file.id || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                                            {file.media_type === "foto" ? (
                                                                <div className="aspect-video relative bg-gray-100">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={file.cloudinary_url} alt="Dokumentasi" className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : file.media_type === "video" ? (
                                                                <div className="aspect-video relative bg-gray-100 flex items-center justify-center">
                                                                    <PlayCircle className="w-8 h-8 text-white drop-shadow-md absolute z-10" />
                                                                    <video src={file.cloudinary_url} className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="aspect-video relative bg-gray-100 flex items-center justify-center flex-col gap-2">
                                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">📄</div>
                                                                    <span className="text-[10px] font-bold text-gray-500">Dokumen Pendukung</span>
                                                                </div>
                                                            )}
                                                            {file.caption && (
                                                                <div className="p-3 bg-white">
                                                                    <p className="text-xs text-gray-600 line-clamp-2">{file.caption}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-sm font-medium text-gray-400">Belum ada dokumentasi yang diunggah</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-white rounded-3xl border border-[#1A5C0A]/5 shadow-sm">
                                            <h4 className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-widest mb-2">Detail Submission (Mentah)</h4>
                                            <pre className="text-xs whitespace-pre-wrap font-medium text-gray-600 leading-relaxed overflow-x-auto">
                                                {JSON.stringify(submissionDetail, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ) : <p className="text-center text-gray-400 italic py-10">Belum ada submission</p>
                        ) : (
                            /* Team View */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {teamDetail?.team_members?.map((m, i) => (
                                    <div key={i} className="p-4 bg-white rounded-2xl border border-[#1A5C0A]/5 flex items-center gap-3 shadow-sm">
                                        <Avatar className="w-10 h-10"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.users?.full_name}`} /><AvatarFallback>ST</AvatarFallback></Avatar>
                                        <span className="text-sm font-bold text-[#333333]">{m.users?.full_name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-[#1A5C0A]/5 bg-white/80 backdrop-blur-md rounded-b-[3rem]">
                        <Button onClick={() => setDrawerType(null)} className="w-full h-12 rounded-2xl bg-[#1A5C0A] text-white font-black text-[10px] uppercase tracking-widest cursor-pointer">Tutup</Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </div >
    );
}
