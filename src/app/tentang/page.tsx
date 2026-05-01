"use client";

import { ArrowLeft, Users, BookOpen, Lightbulb, GraduationCap } from "lucide-react";
import { IconBrandGithub, IconBrandInstagram, IconBrandWhatsapp, IconBrandLinkedin, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function TentangPengembangPage() {
    const coreTeam = [
        {
            name: "Ismail Nursidik",
            role: "Inisiator dan Peneliti",
            desc: "Mahasiswa Pascasarjana UPI Kampus Cibiru yang menggagas pengembangan bahan ajar interaktif berbasis Socio Scientific Issues sebagai bagian dari penelitian tesis, dengan fokus pada Ecological Citizenship siswa sekolah dasar.",
            image: "/assets/fotoTim/Penulis.jpg"
        },
        {
            name: "Dr. H. Dede Margo Irianto, M.Pd.",
            role: "Dosen Pembimbing I",
            desc: "Sebagai pembimbing dalam aspek pedagogik, validasi pembelajaran, serta penguatan landasan ilmiah penelitian.",
            image: "/assets/fotoTim/Dosbing1.jpg"
        },
        {
            name: "Dr. Dinie Anggraeni Dewi S.Pd., M.Pd",
            role: "Dosen Pembimbing II",
            desc: "Sebagai pembimbing dalam penguatan konsep pendidikan, pengembangan bahan ajar, serta kesesuaian bahan ajar dengan kebutuhan peserta didik",
            image: "/assets/fotoTim/Dosbing2.jpg"
        }
    ];

    const partnerTeam = [
        {
            name: "Rootly",
            role: "Studio Pengembang",
            desc: "Berperan sebagai partner studio pengembang dalam implementasi teknis, desain sistem, pengembangan aplikasi, serta visualisasi bahan ajar berbasis teknologi interaktif",
            image: "/assets/Logo-Icon.svg",
            social: {
                github: "https://github.com/FadhelRaihan",
                instagram: "https://www.instagram.com/fadhelraihann/",
                whatsapp: "https://wa.me/6281310117226",
                linkedin: "https://www.linkedin.com/in/fadhelraihan/",
                mail: "mailto:mfadhelraihan@gmail.com"
            }
        }
    ];

    const handleCopyEmail = (email: string) => {
        const cleanEmail = email.replace("mailto:", "");
        navigator.clipboard.writeText(cleanEmail);
        toast.success("Email berhasil disalin ke papan klip!");
    };

    return (
        <div className="min-h-screen bg-[#F8FFF5] flex flex-col items-center py-12 px-6 sm:px-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#B4FF9F]/10 rounded-full blur-[100px] -ml-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1A5C0A]/5 rounded-full blur-[120px] -mr-64 -mb-64 pointer-events-none" />

            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-[#1A5C0A] font-extrabold hover:opacity-70 transition-all cursor-pointer z-50"
            >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Beranda</span>
            </Link>

            {/* Hero Section */}
            <div className="max-w-4xl w-full text-center mb-16 relative z-10">
                <div className="w-20 h-20 bg-[#B4FF9F] rounded-[24px] mx-auto mb-6 flex items-center justify-center text-[#1A5C0A] shadow-lg shadow-[#1A5C0A]/5">
                    <BookOpen size={36} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#333333] mb-6 tracking-tight">Tentang <span className="text-[#1A5C0A]">Eco Hero</span></h1>
                <div className="bg-white rounded-[32px] p-8 md:p-10 border-2 border-[#1A5C0A]/10 shadow-xl shadow-[#1A5C0A]/5 text-left">
                    <p className="text-lg md:text-xl text-[#333333]/70 leading-relaxed mb-6 font-medium">
                        <span className="font-black text-[#1A5C0A]">Eco Hero</span> adalah bahan ajar interaktif berbasis <span className="italic text-[#333333]">Socio Scientific Issue</span> yang dirancang dalam bentuk website dengan tujuan untuk meningkatkan <span className="italic text-[#333333]">Ecological Citizenship</span> siswa terutama di sekolah dasar secara aktif dan menyenangkan.
                    </p>
                    <p className="text-[#333333]/60 leading-relaxed mb-8">
                        Siswa akan melewati serangkaian misi yang dirancang secara bertahap mulai dari mengidentifikasi isu lingkungan, merancang Solusi Bersama tim, merencanakan aksi nyata hingga mengdokumentasikan hasilnya.
                    </p>
                    <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex -space-x-3">
                            <div className="w-12 h-12 rounded-full border-4 border-white bg-[#B4FF9F] flex items-center justify-center text-[#1A5C0A] font-bold overflow-hidden relative">
                                <Image src="/assets/Logo-Icon.svg" alt="Partner" fill className="object-cover object-top" />
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-white bg-[#B4FF9F] flex items-center justify-center text-[#1A5C0A] font-bold overflow-hidden relative">
                                <Image src="/assets/fotoTim/Penulis.jpg" alt="Penulis" fill className="object-cover object-top" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 font-medium italic text-center md:text-left">
                            Dikembangkan sebagai bagian dari penelitian tesis oleh <span className="text-[#333333] font-bold not-italic">Ismail Nursidik</span>, mahasiswa Pascasarjana Universitas Pendidikan Indonesia Kampus Cibiru. Bekerja sama dengan <span className="text-[#333333] font-bold not-italic">Rootly</span> sebagai partner studio.
                        </p>
                    </div>
                </div>
            </div>

            {/* Definitions Section */}
            <div className="w-full mb-24 relative z-10">
                <div className="flex justify-center items-center gap-3 mb-8 px-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1A5C0A] flex items-center justify-center text-white">
                        <Lightbulb size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-[#333333]">Konsep Utama</h2>
                </div>

                <div className="flex flex-col md:flex-row justify-center pb-8 gap-6">
                    {/* SSI Definition */}
                    <div className="min-w-[320px] md:min-w-[436px] md:w-[436px] snap-center bg-white rounded-[40px] p-8 md:p-12 border-2 border-[#1A5C0A]/10 shadow-lg shadow-[#1A5C0A]/5 flex flex-col">
                        <h3 className="text-2xl font-black text-[#1A5C0A] mb-4">Apa itu Socio Scientific Issue?</h3>
                        <p className="text-gray-600 leading-relaxed">
                            <span className="font-bold text-[#333333]">Socio Scientific Issues</span> yaitu sebuah pendekatan yang menjadi jembatan penghubung antara ilmu sains murni dan dinamika sosial kemasyarakatan.
                        </p>
                        <div className="mt-6 p-5 bg-[#F8FFF5] rounded-3xl border border-[#1A5C0A]/10 italic text-sm text-[#1A5C0A]/70">
                            Contoh: Dilema penggunaan plastik sebagai wadah yang murah dan tahan lama, namun menjadi limbah berbahaya jika tidak dikelola dengan benar.
                        </div>
                    </div>

                    {/* Ecological Citizenship Definition */}
                    <div className="min-w-[320px] md:min-w-[436px] md:w-[436px] snap-center bg-white rounded-[40px] p-8 md:p-12 border-2 border-[#1A5C0A]/10 shadow-lg shadow-[#1A5C0A]/5 flex flex-col">
                        <h3 className="text-2xl font-black text-[#1A5C0A] mb-4">Apa itu Ecological Citizenship?</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Dipahami sebagai sebuah proses edukatif yang komprehensif untuk membangun fondasi pengetahuan yang kokoh, sekaligus mengintegrasikan keterampilan, nilai, dan sikap yang relevan bagi warga negara yang sadar lingkungan.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {["Bertanggung Jawab", "Berkelanjutan", "Hak & Keadilan", "Partisipasi", "Agen Perubahan", "Berpikir Sistem"].map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-[#B4FF9F]/30 text-[#1A5C0A] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#1A5C0A]/5">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="max-w-4xl w-full relative z-10 px-4">
                <div className="flex items-center gap-3 mb-12 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-[#1A5C0A] flex items-center justify-center text-white">
                        <Users size={20} />
                    </div>
                    <h2 className="text-3xl font-black text-[#333333]">Tim Pengembang</h2>
                </div>

                {/* Core Team - Vertical Column */}
                <div className="flex flex-col gap-6 mb-12">
                    {coreTeam.map((member, i) => (
                        <div key={i} className="group bg-white rounded-[32px] p-6 md:p-8 border-2 border-transparent hover:border-[#1A5C0A]/20 transition-all shadow-xl shadow-gray-200/50 hover:shadow-[#1A5C0A]/10 flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-[#F0FFF0] border-2 border-[#1A5C0A]/10 flex items-center justify-center text-[#1A5C0A] overflow-hidden group-hover:scale-105 transition-transform shrink-0 relative">
                                {member.image ? (
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover object-top"
                                    />
                                ) : (
                                    <GraduationCap size={36} />
                                )}
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-xs font-black text-[#1A5C0A] uppercase tracking-widest mb-1">{member.role}</p>
                                <h4 className="text-xl font-extrabold text-[#333333] mb-2">{member.name}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{member.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Partner Studio - Bottom Section */}
                <div className="pt-10 border-t border-gray-100">
                    {partnerTeam.map((member, i) => (
                        <div key={i} className="group bg-white rounded-[32px] p-6 md:p-8 border-2 border-[#1A5C0A]/10 hover:border-[#1A5C0A]/20 transition-all shadow-xl shadow-[#1A5C0A]/5 flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-[#1C1C1A] flex items-center justify-center text-white overflow-hidden group-hover:scale-105 transition-transform shrink-0 shadow-lg shadow-[#1A5C0A]/20 relative">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-xs font-black text-[#1A5C0A] uppercase tracking-widest mb-1">{member.role}</p>
                                <h4 className="text-xl font-extrabold text-[#333333] mb-2">{member.name}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">{member.desc}</p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1A5C0A] hover:bg-[#B4FF9F]/20 transition-all cursor-pointer border border-transparent hover:border-[#1A5C0A]/10">
                                        <IconBrandGithub size={20} stroke={1.5} />
                                    </a>
                                    <a href={member.social.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1A5C0A] hover:bg-[#B4FF9F]/20 transition-all cursor-pointer border border-transparent hover:border-[#1A5C0A]/10">
                                        <IconBrandInstagram size={20} stroke={1.5} />
                                    </a>
                                    <a href={member.social.whatsapp} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1A5C0A] hover:bg-[#B4FF9F]/20 transition-all cursor-pointer border border-transparent hover:border-[#1A5C0A]/10">
                                        <IconBrandWhatsapp size={20} stroke={1.5} />
                                    </a>
                                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1A5C0A] hover:bg-[#B4FF9F]/20 transition-all cursor-pointer border border-transparent hover:border-[#1A5C0A]/10">
                                        <IconBrandLinkedin size={20} stroke={1.5} />
                                    </a>
                                    <button
                                        onClick={() => handleCopyEmail(member.social.mail)}
                                        className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1A5C0A] hover:bg-[#B4FF9F]/20 transition-all cursor-pointer border border-transparent hover:border-[#1A5C0A]/10"
                                        title="Salin Email"
                                    >
                                        <IconMail size={20} stroke={1.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-24 text-center border-t border-gray-100 pt-10 w-full">
                <p className="text-xs text-gray-300 font-bold uppercase tracking-[0.4em]">
                    ECO HERO · Universitas Pendidikan Indonesia ©2026
                </p>
            </footer>
        </div>
    );
}
