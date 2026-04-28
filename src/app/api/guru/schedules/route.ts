import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/guru/schedules?teacher_id=xxx
// Ambil semua jadwal misi 3 dari kelas yang dimiliki guru
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacher_id");

        if (!teacherId) {
            return NextResponse.json({ error: "teacher_id diperlukan" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Ambil kelas yang dimiliki guru
        const { data: classes, error: classError } = await supabase
            .from("classes")
            .select("id")
            .eq("teacher_id", teacherId);

        if (classError) throw classError;
        if (!classes || classes.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const classIds = classes.map(c => c.id);

        // Ambil semua jadwal dari tim di kelas guru beserta tasks
        const { data, error } = await supabase
            .from("mission3_schedules")
            .select(`
                id,
                team_id,
                submitted_at,
                teacher_approved,
                approved_at,
                updated_at,
                teams (
                    id,
                    name,
                    selected_case,
                    class_id,
                    team_members (
                        student_id,
                        users ( full_name )
                    )
                ),
                mission3_tasks (
                    id,
                    title,
                    scheduled_date,
                    status,
                    assigned_to
                )
            `)
            .in("teams.class_id", classIds)
            .order("submitted_at", { ascending: false, nullsFirst: false });

        if (error) throw error;

        // Filter hanya jadwal yang timnya ada di kelas guru ini
        const filtered = (data ?? []).filter(s => s.teams !== null);

        return NextResponse.json({ data: filtered });
    } catch (e: any) {
        console.error("Fetch schedules error:", e);
        return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
    }
}
