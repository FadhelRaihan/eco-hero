import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Users, GraduationCap, Info } from "lucide-react";

export default async function RootPage() {
    const cookieStore = await cookies();
    
    // Cek session untuk redirect otomatis jika sudah login
    const siswaSession = cookieStore.get("siswa_session");
    const guruSession = cookieStore.get("guru_session");

    if (siswaSession) redirect("/dashboard");
    if (guruSession) redirect("/guru/dashboard");

    return (
        <div className="min-h-screen bg-[#F8FFF5] relative overflow-hidden flex flex-col">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B4FF9F]/20 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1A5C0A]/5 rounded-full blur-[80px] -ml-48 -mb-48 pointer-events-none" />

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center text-center relative z-10 pb-20">
                
                {/* Logo Section - Large & Centered Flex Row */}
                <div className="flex flex-row items-center justify-center gap-4 md:gap-16 mb-2">
                    {/* Logo UPI Besar */}
                    <div className="relative w-24 h-24 md:w-60 md:h-60 drop-shadow-2xl">
                        <Image 
                            src="/assets/LogoUpi.svg" 
                            alt="Logo UPI" 
                            fill
                            className="object-contain"
                        />
                    </div>
                    
                    {/* Divider */}
                    <div className="h-16 md:h-24 w-1 bg-gradient-to-b from-transparent via-[#1A5C0A]/20 to-transparent" />

                    {/* Logo Eco Hero Besar */}
                    <div className="flex flex-col items-center gap-3 group">
                        <span className="text-sm md:text-4xl font-black text-[#1A5C0A] tracking-tighter">Eco Hero</span>
                    </div>

                    {/* Divider */}
                    <div className="h-16 md:h-24 w-1 bg-gradient-to-b from-transparent via-[#1A5C0A]/20 to-transparent" />

                    {/* Logo Rootly */}
                    <div className="relative w-24 h-24 md:w-60 md:h-60 drop-shadow-2xl">
                        <Image 
                            src="/assets/Logo-Name-Icon.svg" 
                            alt="Logo Rootly" 
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Hero Text */}
                <h1 className="text-4xl md:text-7xl font-black text-[#333333] leading-[1.1] mb-8 max-w-5xl tracking-tight">
                    Selamat Datang <span className="text-[#1A5C0A]">Pahlawan Lingkungan</span>
                </h1>
                
                <p className="text-base md:text-xl text-[#333333]/60 max-w-2xl mb-14 font-medium leading-relaxed">
                    Mulai petualangan seru Anda sekarang dan kumpulkan lencana untuk setiap misi penyelamatan bumi yang berhasil!
                </p>

                {/* Buttons Container - Flex Row */}
                <div className="flex flex-wrap sm:flex-row items-center justify-center gap-4 w-full max-w-2xl px-4">
                    {/* Button Siswa */}
                    <Link href="/login/siswa" className="w-full sm:w-auto">
                        <div className="group bg-[#1A5C0A] hover:bg-[#1A5C0A]/90 text-white px-10 h-16 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-[#1A5C0A]/20 active:scale-95 cursor-pointer">
                            <Users size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-lg font-black tracking-wide">Login Siswa</span>
                        </div>
                    </Link>

                    {/* Button Guru */}
                    <Link href="/login/guru" className="w-full sm:w-auto">
                        <div className="group bg-white hover:bg-gray-50 text-[#1A5C0A] border-2 border-[#1A5C0A]/20 hover:border-[#1A5C0A] px-10 h-16 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-gray-200 active:scale-95 cursor-pointer">
                            <GraduationCap size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-lg font-black tracking-wide">Login Guru</span>
                        </div>
                    </Link>

                    {/* Button Tentang */}
                    <Link href="/tentang" className="w-full sm:w-auto">
                        <div className="group bg-white hover:bg-gray-50 text-gray-400 border-2 border-gray-100 hover:border-gray-200 px-8 h-16 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 cursor-pointer">
                            <Info size={20} />
                            <span className="text-sm font-bold uppercase tracking-widest">Tentang Pengembang</span>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}