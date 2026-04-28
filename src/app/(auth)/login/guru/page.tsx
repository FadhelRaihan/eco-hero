"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { guruLoginSchema, type GuruLoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function LoginGuruPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuruLoginInput>({
    resolver: zodResolver(guruLoginSchema),
  });

  async function onSubmit(data: GuruLoginInput) {
    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/guru/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error ?? "Terjadi kesalahan");
        return;
      }

      loginUser(result.data.user);
      router.push("/guru/dashboard");
    } catch {
      setServerError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo area */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-[#333333]">
          Eco Hero
        </h1>
        <p className="text-sm text-[#333333] mt-1 font-medium">
          Portal Guru
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border-2 border-[#1A5C0A]/20 p-6">
        <h2 className="text-xl font-bold text-[#333333] mb-1 text-center">
          Selamat datang
        </h2>
        <p className="text-sm text-[#333333]/50 mb-8 text-center">
          Masuk untuk memantau perkembangan siswa
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <Label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Username
            </Label>
            <Input
              {...register("username")}
              type="text"
              placeholder="Masukkan username"
              className={cn(
                "w-full h-11 px-4 rounded-xl border-2 bg-gray-50",
                errors.username ? "border-red-300" : "border-gray-200"
              )}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </Label>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                className={cn(
                  "w-full h-11 px-4 pr-11 rounded-xl border-2 bg-gray-50",
                  errors.password ? "border-red-300" : "border-gray-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
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
            disabled={loading}
            className={cn(
              "w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
              "bg-[#1A5C0A] text-white hover:bg-[#1A5C0A]/80 hover:text-white active:scale-95 cursor-pointer",
              loading && "opacity-60 cursor-not-allowed"
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}