"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, Lock, PlayCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentProgress {
    student_id: string;
    full_name: string;
    team_role: string;
    team_name: string;
    missions: {
        mission_number: number;
        status: string;
        badge_earned: boolean;
    }[];
}

const STATUS_CONFIG = {
    completed: { icon: CheckCircle, color: "text-eco-green-text bg-eco-green", label: "✓" },
    in_progress: { icon: PlayCircle, color: "text-eco-yellow-text bg-eco-yellow", label: "▶" },
    locked: { icon: Lock, color: "text-gray-400 bg-gray-100", label: "🔒" },
};

export default function DetailKelasPage({
    params,
}: {
    params: Promise<{ classId: string }>;
}) {
    const { classId } = use(params);
    const router = useRouter();
    const [kelasName, setKelasName] = useState("");
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [kelasRes, progressRes] = await Promise.all([
                    fetch(`/api/classes/${classId}`),
                    fetch(`/api/classes/${classId}/progress`),
                ]);

                const kelasResult = await kelasRes.json();
                const progressResult = await progressRes.json();

                if (kelasRes.ok) setKelasName(kelasResult.data?.name ?? "");
                if (progressRes.ok) setStudents(progressResult.data ?? []);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [classId]);

    const totalSiswa = students.length;
    const misi1Selesai = students.filter(
        (s) => s.missions.find((m) => m.mission_number === 1)?.status === "completed"
    ).length;

    return (
        <div className="max-w-4xl mx-auto px-5 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                >
                    <ArrowLeft size={18} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-800">{kelasName}</h1>
                    <p className="text-xs text-gray-500">{totalSiswa} siswa terdaftar</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {[1, 2, 3, 4].map((num) => {
                    const selesai = students.filter(
                        (s) => s.missions.find((m) => m.mission_number === num)?.status === "completed"
                    ).length;
                    const missionColors = [
                        "bg-eco-green text-eco-green-text",
                        "bg-eco-yellow text-eco-yellow-text",
                        "bg-eco-orange text-eco-orange-text",
                        "bg-eco-red text-eco-red-text",
                    ];
                    return (
                        <div key={num} className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
                            <div className={cn("w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-sm font-bold", missionColors[num - 1])}>
                                {num}
                            </div>
                            <p className="text-lg font-extrabold text-gray-800">{selesai}</p>
                            <p className="text-[9px] text-gray-400">Misi {num} selesai</p>
                        </div>
                    );
                })}
            </div>

            {/* Tabel Progress Siswa */}
            <h2 className="text-sm font-extrabold text-gray-700 mb-3 uppercase tracking-wide">
                Progress Per Siswa
            </h2>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-eco-green border-t-transparent rounded-full" />
                </div>
            ) : students.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                    <Users size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500">Belum ada siswa yang masuk</p>
                    <p className="text-xs text-gray-400 mt-1">Siswa akan muncul setelah login ke kelas ini</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 bg-gray-50 border-b border-gray-100 px-4 py-2.5">
                        <span className="text-xs font-bold text-gray-500">Nama Siswa</span>
                        <span className="text-xs font-bold text-gray-500 text-center w-16">Tim</span>
                        <span className="text-xs font-bold text-gray-500 text-center w-12">M1</span>
                        <span className="text-xs font-bold text-gray-500 text-center w-12">M2</span>
                        <span className="text-xs font-bold text-gray-500 text-center w-12">M3</span>
                        <span className="text-xs font-bold text-gray-500 text-center w-12">M4</span>
                    </div>

                    {/* Table Rows */}
                    {students.map((student, idx) => (
                        <div
                            key={student.student_id}
                            className={cn(
                                "grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 px-4 py-3 items-center",
                                idx % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                                "border-b border-gray-50 last:border-0"
                            )}
                        >
                            <div>
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                    {student.full_name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    {student.team_role === "ketua" ? "👑 Ketua" : student.team_role === "anggota" ? "Anggota" : "Belum bergabung"}
                                </p>
                            </div>

                            <span className="text-[10px] text-gray-500 text-center w-16 truncate">
                                {student.team_name}
                            </span>

                            {[1, 2, 3, 4].map((num) => {
                                const mission = student.missions.find((m) => m.mission_number === num);
                                const status = mission?.status ?? "locked";
                                const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                                return (
                                    <div key={num} className="flex justify-center w-12">
                                        <span className={cn(
                                            "text-[10px] font-bold w-7 h-7 rounded-lg flex items-center justify-center",
                                            config.color
                                        )}>
                                            {config.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}