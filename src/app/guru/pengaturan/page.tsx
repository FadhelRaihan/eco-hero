"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
    User, 
    Mail, 
    Lock, 
    Camera, 
    Save, 
    Loader2, 
    ShieldCheck, 
    Bell,
    LogOut,
    ChevronRight,
    Settings as SettingsIcon,
    ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TeacherSettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<"profile" | "security">("profile");

    const [formData, setFormData] = useState({
        full_name: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.user_metadata?.full_name || user.full_name || "",
            }));
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/guru/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    user_id: user?.id
                })
            });

            if (res.ok) {
                toast.success("Profil diperbarui", {
                    description: "Nama Anda telah berhasil diperbarui."
                });
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal memperbarui profil");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Konfirmasi password tidak cocok");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    new_password: formData.newPassword
                })
            });

            if (res.ok) {
                toast.success("Password diperbarui", {
                    description: "Silakan gunakan password baru Anda saat login berikutnya."
                });
                setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
            } else {
                const data = await res.json();
                toast.error(data.error || "Gagal mengubah password");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto px-8 py-10 space-y-10 animate-in fade-in duration-700 max-w-6xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#333333] tracking-tight flex items-center gap-3">
                        Pengaturan Akun
                    </h1>
                    <p className="text-xs text-[#333333]/40 font-bold uppercase tracking-[0.2em] mt-2 ml-1">
                        Kelola informasi profil dan keamanan akun Anda
                    </p>
                </div>
                
                <Button 
                    variant="outline" 
                    onClick={() => logout()}
                    className="rounded-2xl border-2 border-red-100 hover:bg-red-50 hover:text-red-500 text-red-400 font-black text-[10px] uppercase tracking-widest h-12 px-8 transition-all cursor-pointer"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Keluar dari Sistem
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-2xl border border-[#1A5C0A]/10 p-4 shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setActiveSection("profile")}
                            className={cn(
                                "w-full flex items-center justify-between p-5 rounded-xl transition-all duration-300 group cursor-pointer",
                                activeSection === "profile" 
                                    ? "bg-[#1A5C0A] text-white shadow-xl scale-[1.02]" 
                                    : "text-[#333333]/60 hover:bg-[#B4FF9F]/20 hover:text-[#1A5C0A]"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-2.5 rounded-xl transition-colors",
                                    activeSection === "profile" ? "bg-white/20" : "bg-[#1A5C0A]/5"
                                )}>
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-xs uppercase tracking-widest">Informasi Profil</p>
                                    <p className={cn(
                                        "text-[9px] font-bold",
                                        activeSection === "profile" ? "text-white/60" : "text-[#333333]/30"
                                    )}>Nama & Email</p>
                                </div>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 opacity-40", activeSection === "profile" && "rotate-90")} />
                        </button>

                        <button 
                            onClick={() => setActiveSection("security")}
                            className={cn(
                                "w-full flex items-center justify-between p-5 rounded-xl transition-all duration-300 group mt-2 cursor-pointer",
                                activeSection === "security" 
                                    ? "bg-[#1A5C0A] text-white shadow-xl scale-[1.02]" 
                                    : "text-[#333333]/60 hover:bg-[#B4FF9F]/20 hover:text-[#1A5C0A]"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-2.5 rounded-xl transition-colors",
                                    activeSection === "security" ? "bg-white/20" : "bg-[#1A5C0A]/5"
                                )}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-xs uppercase tracking-widest">Keamanan Akun</p>
                                    <p className={cn(
                                        "text-[9px] font-bold",
                                        activeSection === "security" ? "text-white/60" : "text-[#333333]/30"
                                    )}>Ubah Password</p>
                                </div>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 opacity-40", activeSection === "security" && "rotate-90")} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-[#1A5C0A]/10 shadow-sm overflow-hidden relative min-h-[500px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B4FF9F]/10 rounded-full -mr-32 -mt-32" />
                        
                        <div className="p-10 md:p-14 relative z-10">
                            {activeSection === "profile" ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-1.5 h-6 bg-[#1A5C0A] rounded-full" />
                                        <h2 className="text-xl font-black text-[#333333] uppercase tracking-tight">Informasi Profil</h2>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Avatar Section */}
                                        <div className="flex items-center gap-8 pb-4">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-2xl bg-[#F7FFF4] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-[#1A5C0A]/5 transition-transform group-hover:scale-105 duration-500">
                                                    <User className="w-10 h-10 text-[#1A5C0A]/30" />
                                                </div>
                                                <button type="button" className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1A5C0A] rounded-xl border-4 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer">
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-[#333333] text-lg leading-tight uppercase tracking-tight">Foto Profil</h3>
                                                <p className="text-[10px] text-[#333333]/40 font-bold uppercase tracking-widest mt-1">Hanya format JPG, PNG atau WEBP. Maks 2MB.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#333333]/40 uppercase tracking-widest px-1">Nama Lengkap</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A5C0A]/40" />
                                                    <input 
                                                        type="text" 
                                                        value={formData.full_name}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                                        className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-[#1A5C0A]/5 bg-[#F7FFF4]/50 text-sm font-bold text-[#333333] focus:outline-none focus:border-[#1A5C0A] focus:bg-white transition-all shadow-inner"
                                                        placeholder="Masukkan nama lengkap"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-[#1A5C0A]/5">
                                        <Button 
                                            disabled={loading}
                                            className="rounded-2xl border-none bg-[#1A5C0A] hover:bg-[#1A5C0A]/90 text-white font-black text-[10px] uppercase tracking-widest h-14 px-10 shadow-xl shadow-[#1A5C0A]/20 transition-all cursor-pointer"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                            Simpan Perubahan Profil
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-1.5 h-6 bg-[#1A5C0A] rounded-full" />
                                        <h2 className="text-xl font-black text-[#333333] uppercase tracking-tight">Ubah Password</h2>
                                    </div>

                                    <div className="bg-[#FFF4F4]/30 border border-red-100 rounded-2xl p-6 flex items-start gap-4">
                                        <div className="p-2.5 bg-red-50 rounded-xl">
                                            <ShieldCheck className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Keamanan Password</h4>
                                            <p className="text-[10px] text-red-400 font-bold leading-relaxed">
                                                Gunakan kombinasi minimal 8 karakter dengan campuran huruf, angka, dan simbol untuk keamanan maksimal.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#333333]/40 uppercase tracking-widest px-1">Password Baru</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A5C0A]/40" />
                                                <input 
                                                    type="password" 
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                    className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-[#1A5C0A]/5 bg-[#F7FFF4]/50 text-sm font-bold text-[#333333] focus:outline-none focus:border-[#1A5C0A] focus:bg-white transition-all shadow-inner"
                                                    placeholder="Minimal 8 karakter"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#333333]/40 uppercase tracking-widest px-1">Konfirmasi Password Baru</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A5C0A]/40" />
                                                <input 
                                                    type="password" 
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-[#1A5C0A]/5 bg-[#F7FFF4]/50 text-sm font-bold text-[#333333] focus:outline-none focus:border-[#1A5C0A] focus:bg-white transition-all shadow-inner"
                                                    placeholder="Ulangi password baru"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-[#1A5C0A]/5">
                                        <Button 
                                            disabled={loading}
                                            className="rounded-2xl bg-[#1A5C0A] hover:bg-[#1A5C0A]/90 text-white font-black text-[10px] uppercase tracking-widest h-14 px-10 shadow-xl shadow-[#1A5C0A]/20 transition-all cursor-pointer"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                            Simpan Password Baru
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
