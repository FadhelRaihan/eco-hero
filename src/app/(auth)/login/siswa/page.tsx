"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Loader2, Play } from "lucide-react";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { DEMO_AUTH_USER } from "@/contexts/DemoContext";
import { IconChevronDown } from "@tabler/icons-react";
import { siswaLoginSchema, type SiswaLoginInput } from "@/lib/validations/auth";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Kelas {
    id: string;
    name: string;
}

interface Student {
    student_id: string;
    users: {
        id: string;
        full_name: string;
    } | null;
}

export default function LoginSiswaPage() {
    const router = useRouter();
    const { loginUser } = useAuth();
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [loadingKelas, setLoadingKelas] = useState(true);
    const [studentList, setStudentList] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);

    const handleStartDemo = () => {
        setDemoLoading(true);
        localStorage.setItem("eco_demo_mode", "true");
        document.cookie = "eco_demo_mode=true; path=/; max-age=3600";
        // Set user di AuthContext langsung agar dashboard tidak loading stuck
        loginUser(DEMO_AUTH_USER as AuthUser);
        setTimeout(() => router.push("/dashboard"), 700);
    };

    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<SiswaLoginInput>({
        resolver: zodResolver(siswaLoginSchema),
    });

    // Ambil daftar kelas yang tersedia
    useEffect(() => {
        async function fetchKelas() {
            try {
                const res = await fetch("/api/classes");
                const result = await res.json();
                if (res.ok) setKelasList(result.data ?? []);
            } catch {
                // Kelas tidak bisa dimuat, biarkan dropdown kosong
            } finally {
                setLoadingKelas(false);
            }
        }
        fetchKelas();
    }, []);

    // Ambil daftar siswa ketika kelas dipilih
    const selectedClassId = watch("class_id");
    useEffect(() => {
        if (!selectedClassId) {
            setStudentList([]);
            return;
        }

        async function fetchStudents() {
            setLoadingStudents(true);
            try {
                const res = await fetch(`/api/classes/${selectedClassId}/students`);
                const result = await res.json();
                if (res.ok) setStudentList(result.data ?? []);
            } catch {
                setStudentList([]);
            } finally {
                setLoadingStudents(false);
            }
        }
        
        // Reset pilihan nama saat ganti kelas
        setValue("full_name", "");
        fetchStudents();
    }, [selectedClassId, setValue]);

    async function onSubmit(data: SiswaLoginInput) {
        setLoading(true);
        setServerError("");

        try {
            const res = await fetch("/api/auth/siswa/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                setServerError(result.error ?? "Terjadi kesalahan");
                return;
            }

            // Update AuthContext langsung tanpa perlu reload
            // sehingga useMissionProgress bisa langsung fetch dengan user.id
            loginUser(result.data.user);
            router.push("/dashboard");
        } catch {
            setServerError("Tidak dapat terhubung ke server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md">
            {/* Logo & Maskot area */}
            <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold text-[#333333]">
                    Eco Hero
                </h1>
                <p className="text-sm text-[#333333] mt-1 font-medium">
                    Halo, Pahlawan Lingkungan!
                </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl border-2 border-[#1A5C0A]/20 p-6">
                <h2 className="text-xl font-bold text-[#333333] mb-1 text-center">
                    Masuk ke kelasmu
                </h2>
                <p className="text-sm text-[#333333]/50 mb-8 text-center">
                    Ketik nama lengkapmu dan pilih kelas
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Pilih Kelas */}
                    <div>
                        <Label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Langkah 1: Pilih Kelas
                        </Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-12 w-full p-4 justify-between border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:text-[#1A5C0A] hover:border-[#1A5C0A] transition-all bg-white"
                                >
                                    {kelasList.find(k => k.id === watch("class_id"))?.name || "Pilih Kelas"}
                                    <IconChevronDown className="w-3 h-3 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto rounded-2xl border-none shadow-2xl p-2">
                                <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Daftar Kelas</p>
                                {kelasList.map((kelas) => (
                                    <DropdownMenuCheckboxItem key={kelas.id} checked={watch("class_id") === kelas.id} onCheckedChange={(value) => {
                                        if (value) {
                                            setValue("class_id", kelas.id);
                                        }
                                    }}>
                                        {kelas.name}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {errors.class_id && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.class_id.message}
                            </p>
                        )}
                        {!loadingKelas && kelasList.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                                Belum ada kelas tersedia. Hubungi gurumu.
                            </p>
                        )}
                    </div>

                    {/* Pilih Nama Lengkap */}
                    <div>
                        <Label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Langkah 2: Pilih Namamu
                        </Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={!selectedClassId || loadingStudents}
                                    className="h-12 w-full p-4 justify-between border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:text-[#1A5C0A] hover:border-[#1A5C0A] transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingStudents ? "Memuat..." : watch("full_name") || "Pilih Namamu"}
                                    <IconChevronDown className="w-3 h-3 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto rounded-2xl border-none shadow-2xl p-2">
                                <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Siswa di Kelas Ini</p>
                                {studentList.length > 0 ? (
                                    studentList.map((student) => {
                                        const name = student.users?.full_name;
                                        if (!name) return null;
                                        return (
                                            <DropdownMenuCheckboxItem 
                                                key={student.student_id} 
                                                checked={watch("full_name") === name} 
                                                onCheckedChange={(value) => {
                                                    if (value) setValue("full_name", name);
                                                }}
                                            >
                                                {name}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })
                                ) : (
                                    <div className="px-2 py-3 text-sm text-center text-gray-500 font-medium">
                                        Belum ada data siswa
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {errors.full_name && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.full_name.message}
                            </p>
                        )}
                    </div>

                    {/* Server Error */}
                    {serverError && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
                            <p className="text-sm text-red-600">{serverError}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={loading || loadingKelas || kelasList.length === 0}
                        className={cn(
                            "w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                            "bg-[#1A5C0A] text-white hover:bg-[#1A5C0A]/80 hover:text-white active:scale-95 cursor-pointer",
                            (loading || loadingKelas || kelasList.length === 0) &&
                            "opacity-60 cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                            <LogIn size={16} />
                        )}
                        {loading ? "Memproses..." : "Ayo Mulai Petualangan!"}
                    </Button>
                </form>

                {/* Demo Button */}
                <div className="mt-4 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3 w-full">
                        <div className="flex-1 h-px bg-[#1A5C0A]/10" />
                        <span className="text-[10px] font-bold text-[#333333]/40 uppercase tracking-widest">atau</span>
                        <div className="flex-1 h-px bg-[#1A5C0A]/10" />
                    </div>
                    <button
                        onClick={handleStartDemo}
                        disabled={demoLoading || loading}
                        className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border-2 border-[#1A5C0A]/30 text-[#1A5C0A] hover:bg-[#B4FF9F]/20 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {demoLoading ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                            <Play size={15} />
                        )}
                        {demoLoading ? "Memuat Demo..." : "Coba Mode Demo"}
                    </button>
                    <p className="text-[10px] text-[#333333]/40 font-medium text-center">
                        Gratis · Tanpa login · Tanpa data tersimpan
                    </p>
                </div>
            </div>
        </div>
    );
}
