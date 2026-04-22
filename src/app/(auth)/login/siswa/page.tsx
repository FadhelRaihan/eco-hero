"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf, Sparkles, LogIn, Loader2 } from "lucide-react";
import { siswaLoginSchema, type SiswaLoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Kelas {
    id: string;
    name: string;
}

export default function LoginSiswaPage() {
    const router = useRouter();
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [loadingKelas, setLoadingKelas] = useState(true);
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
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

            router.push("/dashboard");
            router.refresh();
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
                    {/* Nama Lengkap */}
                    <div>
                        <Label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nama Lengkap
                        </Label>
                        <Input
                            {...register("full_name")}
                            type="text"
                            placeholder="Contoh: Andi Saputra"
                            className={cn(
                                "w-full h-11 px-4 rounded-xl border-2 bg-gray-50",
                                errors.full_name ? "border-red-300" : "border-gray-200"
                            )}
                        />
                        {errors.full_name && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.full_name.message}
                            </p>
                        )}
                    </div>

                    {/* Pilih Kelas */}
                    <div>
                        <Label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Pilih Kelas
                        </Label>
                        <Select
                            disabled={loadingKelas}
                            onValueChange={(val) => {
                                setValue("class_id", val, { shouldValidate: true });
                            }}
                            value={watch("class_id")}
                        >
                            <SelectTrigger
                                className={cn(
                                    "w-full rounded-xl border-2 bg-gray-50",
                                    errors.class_id ? "border-red-300" : "border-gray-200"
                                )}
                            >
                                <SelectValue placeholder={loadingKelas ? "Memuat kelas..." : "-- Pilih kelasmu --"} />
                            </SelectTrigger>
                            <SelectContent>
                                {kelasList.map((kelas) => (
                                    <SelectItem key={kelas.id} value={kelas.id}>
                                        {kelas.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
            </div>
        </div>
    );
}