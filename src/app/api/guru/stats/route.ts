import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get("class_id");

        if (!classId) {
            return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Cari daftar siswa yang tergabung di kelas tersebut
        const { data: members, error: membersError } = await supabase
            .from("class_members")
            .select("student_id")
            .eq("class_id", classId);

        if (membersError) throw membersError;
        
        if (!members || members.length === 0) {
            return NextResponse.json({ data: { completed_missions: 0 } });
        }

        const studentIds = members.map((m) => m.student_id);

        // 2. Hitung akumulasi Misi yang diselesaikan oleh mereka
        const { count, error: countError } = await supabase
            .from("mission_progress")
            .select("*", { count: "exact", head: true })
            .in("student_id", studentIds)
            .eq("status", "completed");

        if (countError) throw countError;

        return NextResponse.json({ 
            data: { completed_missions: count || 0 } 
        }, {
            headers: {
                "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
            },
        });
    } catch (error) {
        console.error("GET /api/guru/stats error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Gagal mengambil statistik" },
            { status: 500 }
        );
    }
}
