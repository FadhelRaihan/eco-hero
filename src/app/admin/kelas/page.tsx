"use client";

import { useState, useEffect } from "react";
import { 
    School, 
    Loader2, 
    User,
    MoreVertical,
    Pencil,
    Trash2
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ClassProfile {
    id: string;
    name: string;
    teacher_name: string;
    teacher_id?: string;
    member_count: number;
    team_count: number;
    created_at: string;
}

interface TeacherOption {
    id: string;
    full_name: string;
    classes?: { id: string, name: string }[];
}

export default function AdminClassManagementPage() {
    const [classes, setClasses] = useState<ClassProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);

    // Modal states
    const [selectedClass, setSelectedClass] = useState<ClassProfile | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [editForm, setEditForm] = useState({
        name: "",
        teacher_id: ""
    });

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    async function fetchClasses() {
        try {
            const res = await fetch("/api/admin/classes");
            const result = await res.json();
            if (res.ok) setClasses(result.data ?? []);
        } finally {
            setLoading(false);
        }
    }

    async function fetchTeachers() {
        try {
            const res = await fetch("/api/admin/users?role=guru");
            const result = await res.json();
            if (res.ok) setTeachers(result.data ?? []);
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        }
    }

    const handleEditClick = (c: ClassProfile) => {
        setSelectedClass(c);
        setEditForm({
            name: c.name,
            teacher_id: c.teacher_id || ""
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (c: ClassProfile) => {
        setSelectedClass(c);
        setIsDeleteModalOpen(true);
    };

    const handleUpdateClass = async () => {
        if (!selectedClass) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/classes/${selectedClass.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                toast.success("Kelas berhasil diperbarui");
                setIsEditModalOpen(false);
                fetchClasses();
            } else {
                const err = await res.json();
                toast.error(err.error || "Gagal memperbarui kelas");
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClass = async () => {
        if (!selectedClass) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/classes/${selectedClass.id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Kelas berhasil dihapus");
                setIsDeleteModalOpen(false);
                fetchClasses();
            } else {
                toast.error("Gagal menghapus kelas");
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: ColumnDef<ClassProfile>[] = [
        {
            accessorKey: "name",
            header: "Nama Kelas",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-900">
                        <School size={18} />
                    </div>
                    <span className="font-bold text-[#333333] text-sm">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: "teacher_name",
            header: "Guru Pengampu",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-600">{row.original.teacher_name || "Belum Ada"}</span>
                </div>
            ),
        },
        {
            accessorKey: "member_count",
            header: () => <div className="text-center">Siswa</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <div className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500">
                        {row.original.member_count} SISWA
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "team_count",
            header: () => <div className="text-center">Tim</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <div className="px-3 py-1 bg-indigo-50 rounded-lg text-[10px] font-black text-indigo-600">
                        {row.original.team_count} TIM
                    </div>
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-center items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-lg transition-colors outline-none cursor-pointer">
                            <MoreVertical size={16} className="text-gray-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                            <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opsi Kelas</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="rounded-lg text-xs font-bold py-2.5 flex items-center gap-2 cursor-pointer"
                                onClick={() => handleEditClick(row.original)}
                            >
                                <Pencil size={14} className="text-indigo-900" />
                                Edit Kelas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="rounded-lg text-xs font-bold py-2.5 text-red-500 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                onClick={() => handleDeleteClick(row.original)}
                            >
                                <Trash2 size={14} />
                                Hapus Kelas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-indigo-900" size={32} />
            </div>
        );
    }

    return (
        <div className="mx-auto px-8 py-10 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-[#333333] tracking-tight">Manajemen Kelas</h1>
                    <p className="text-xs text-[#333333]/60 font-bold uppercase tracking-widest">Otoritas pengaturan seluruh kelas yang terdaftar</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-indigo-900/10 p-2 shadow-2xl shadow-indigo-900/5">
                <DataTable 
                    columns={columns}
                    data={classes}
                    filterColumn="name"
                    searchPlaceholder="Filter berdasarkan nama kelas..."
                />
            </div>

            {/* Modal Edit Kelas */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-[#333333]">Edit Kelas</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Ubah nama kelas dan guru pengampu
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Nama Kelas</Label>
                            <Input 
                                value={editForm.name || ""}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="rounded-xl border-indigo-900/10 focus:border-indigo-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Guru Pengampu</Label>
                            <Select 
                                value={editForm.teacher_id || ""} 
                                onValueChange={(val) => setEditForm({...editForm, teacher_id: val})}
                            >
                                <SelectTrigger className="rounded-xl border-indigo-900/10">
                                    <SelectValue placeholder="Pilih Guru" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {teachers
                                        .filter(t => {
                                            // Tampilkan guru jika:
                                            // 1. Dia belum punya kelas sama sekali
                                            // 2. ATAU dia adalah guru yang sedang mengampu kelas ini (agar tidak hilang dari pilihan)
                                            const hasNoClass = !t.classes || t.classes.length === 0;
                                            const isCurrentTeacher = t.id === selectedClass?.teacher_id;
                                            return hasNoClass || isCurrentTeacher;
                                        })
                                        .map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.full_name} {t.classes && t.classes.length > 0 ? `(Saat ini: ${t.classes[0].name})` : "(Tersedia)"}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            className="w-full h-12 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold shadow-lg shadow-indigo-900/20 transition-all"
                            onClick={handleUpdateClass}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Konfirmasi Hapus */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                            <Trash2 className="text-red-600" size={32} />
                        </div>
                        <DialogTitle className="text-xl font-black text-[#333333]">Hapus Kelas?</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-gray-500 mt-2">
                            Apakah Anda yakin ingin menghapus kelas <span className="font-bold text-[#333333]">{selectedClass?.name}</span>? Seluruh data siswa dan tim di dalamnya akan terpengaruh.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:justify-center mt-4">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-12 rounded-xl font-bold"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button 
                            className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                            onClick={handleDeleteClass}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Ya, Hapus Kelas"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
