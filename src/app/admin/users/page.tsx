"use client";

import { useState, useEffect } from "react";
import { 
    Loader2, 
    MoreVertical,
    ShieldCheck,
    GraduationCap,
    Pencil,
    Trash2
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface UserProfile {
    id: string;
    full_name: string;
    username: string;
    role: "guru" | "admin" | "siswa";
    created_at: string;
}

export default function AdminUserManagementPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRole] = useState<string>("all");
    
    // Modal states
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [editForm, setEditForm] = useState({
        full_name: "",
        username: "",
        role: ""
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const res = await fetch("/api/admin/users");
            const result = await res.json();
            if (res.ok) setUsers(result.data ?? []);
        } finally {
            setLoading(false);
        }
    }

    const handleEditClick = (user: UserProfile) => {
        setSelectedUser(user);
        setEditForm({
            full_name: user.full_name,
            username: user.username,
            role: user.role
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (user: UserProfile) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                toast.success("User berhasil diperbarui");
                setIsEditModalOpen(false);
                fetchUsers();
            } else {
                const err = await res.json();
                toast.error(err.error || "Gagal memperbarui user");
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("User berhasil dihapus");
                setIsDeleteModalOpen(false);
                fetchUsers();
            } else {
                toast.error("Gagal menghapus user");
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: ColumnDef<UserProfile>[] = [
        {
            accessorKey: "full_name",
            header: "Nama Lengkap",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-blue-900/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.original.username}`} />
                        <AvatarFallback className="bg-blue-100 text-blue-900 font-bold">
                            {row.original.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-[#333333] text-sm">{row.original.full_name}</span>
                        <span className="text-[10px] text-gray-400 font-medium italic">@{row.original.username}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.original.role;
                return (
                    <div className="flex items-center gap-2">
                        {role === "admin" ? (
                            <div className="px-3 py-1 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                <ShieldCheck size={10} /> Admin
                            </div>
                        ) : (
                            role === "guru" ? (
                                <div className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                    <GraduationCap size={10} /> Guru
                                </div>
                            ) : (
                                <div className="px-3 py-1 bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                    <GraduationCap size={10} /> Siswa
                                </div>
                            )
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Bergabung Pada",
            cell: ({ row }) => (
                <span className="text-xs text-gray-400 font-medium">
                    {new Date(row.original.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </span>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-lg transition-colors outline-none cursor-pointer">
                            <MoreVertical size={16} className="text-gray-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                            <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opsi Akun</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="rounded-lg text-xs font-bold py-2.5 flex items-center gap-2 cursor-pointer"
                                onClick={() => handleEditClick(row.original)}
                            >
                                <Pencil size={14} className="text-blue-900" />
                                Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="rounded-lg text-xs font-bold py-2.5 text-red-500 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                onClick={() => handleDeleteClick(row.original)}
                            >
                                <Trash2 size={14} />
                                Hapus User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    const filteredUsers = filterRole === "all" 
        ? users 
        : users.filter(u => u.role === filterRole);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-900" size={32} />
            </div>
        );
    }

    return (
        <div className="mx-auto px-8 py-10 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-[#333333] tracking-tight">Manajemen User</h1>
                    <p className="text-xs text-[#333333]/60 font-bold uppercase tracking-widest">Kelola otoritas dan akses seluruh pengguna sistem</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-blue-900/10 p-2 shadow-2xl shadow-blue-900/5">
                <DataTable 
                    columns={columns}
                    data={filteredUsers}
                    filterColumn="full_name"
                    searchPlaceholder="Filter berdasarkan nama..."
                />
            </div>

            {/* Modal Edit User */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-[#333333]">Edit User</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Ubah informasi profil dan peran pengguna
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Nama Lengkap</Label>
                            <Input 
                                value={editForm.full_name || ""}
                                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                                className="rounded-xl border-blue-900/10 focus:border-blue-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Username</Label>
                            <Input 
                                value={editForm.username || ""}
                                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                className="rounded-xl border-blue-900/10 focus:border-blue-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Role</Label>
                            <Select 
                                value={editForm.role || ""} 
                                onValueChange={(val) => setEditForm({...editForm, role: val})}
                            >
                                <SelectTrigger className="rounded-xl border-blue-900/10">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="siswa">Siswa</SelectItem>
                                    <SelectItem value="guru">Guru</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            className="w-full h-12 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold"
                            onClick={handleUpdateUser}
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
                        <DialogTitle className="text-xl font-black text-[#333333]">Hapus User?</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-gray-500 mt-2">
                            Apakah Anda yakin ingin menghapus <span className="font-bold text-[#333333]">{selectedUser?.full_name}</span>? Tindakan ini tidak dapat dibatalkan.
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
                            onClick={handleDeleteUser}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Ya, Hapus User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
