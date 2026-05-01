"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { guruRegisterSchema, type GuruRegisterInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterGuruPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GuruRegisterInput>({
        resolver: zodResolver(guruRegisterSchema),
    });

    async function onSubmit(data: GuruRegisterInput) {
        setLoading(true);

        try {
            const res = await fetch("/api/auth/guru/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error ?? "Gagal mendaftar");
                return;
            }

            toast.success("Registrasi berhasil! Silakan login.");
            router.push("/login/guru");
        } catch {
            toast.error("Tidak dapat terhubung ke server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md py-12">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-4xl font-extrabold text-[#333333]">
                    Daftar Guru
                </h1>
                <p className="text-sm text-[#333333]/60 mt-2 font-medium">
                    Mulai kelola kelas Eco Hero Anda
                </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl border-2 border-[#1A5C0A]/20 p-8 shadow-xl shadow-[#1A5C0A]/5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Nama Lengkap
                        </Label>
                        <Input
                            {...register("full_name")}
                            placeholder="Contoh: Budi Santoso, S.Pd."
                            className={cn(
                                "w-full h-12 px-4 rounded-xl border-2 bg-gray-50 focus:ring-0",
                                errors.full_name ? "border-red-300" : "border-gray-100 focus:border-[#1A5C0A]"
                            )}
                        />
                        {errors.full_name && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.full_name.message}</p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Username
                        </Label>
                        <Input
                            {...register("username")}
                            placeholder="Gunakan untuk login"
                            className={cn(
                                "w-full h-12 px-4 rounded-xl border-2 bg-gray-50 focus:ring-0",
                                errors.username ? "border-red-300" : "border-gray-100 focus:border-[#1A5C0A]"
                            )}
                        />
                        {errors.username && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Minimal 6 karakter"
                                className={cn(
                                    "w-full h-12 px-4 pr-12 rounded-xl border-2 bg-gray-50 focus:ring-0",
                                    errors.password ? "border-red-300" : "border-gray-100 focus:border-[#1A5C0A]"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="pt-2 pb-1">
                        <div className="h-px bg-gray-100 w-full" />
                    </div>

                    {/* Class Name */}
                    <div>
                        <Label className="block text-sm font-bold text-[#1A5C0A] mb-1.5">
                            Nama Kelas yang Akan Dikelola
                        </Label>
                        <Input
                            {...register("class_name")}
                            placeholder="Contoh: Kelas 5A - SDN 1 Cibiru"
                            className={cn(
                                "w-full h-12 px-4 rounded-xl border-2 bg-[#B4FF9F]/10 focus:ring-0",
                                errors.class_name ? "border-red-300" : "border-[#1A5C0A]/20 focus:border-[#1A5C0A]"
                            )}
                        />
                        {errors.class_name && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.class_name.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-[#1A5C0A] hover:bg-[#1A5C0A]/90 text-white font-black text-base shadow-lg shadow-[#1A5C0A]/20 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <UserPlus size={20} />
                        )}
                        {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                    </Button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-400 font-medium">
                    Sudah punya akun?{" "}
                    <Link href="/login/guru" className="text-[#1A5C0A] font-bold hover:underline">
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}
