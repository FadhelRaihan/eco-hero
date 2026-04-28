import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const supabase = createAdminClient();

        // Cari schedule yang ada untuk tim
        const { data: schedule, error: fetchError } = await supabase
            .from("mission3_schedules")
            .select("id")
            .eq("team_id", teamId)
            .single();

        if (fetchError) throw fetchError;

        const now = new Date().toISOString();

        // Hanya set submitted_at — TIDAK auto-approve
        const { data, error } = await supabase
            .from("mission3_schedules")
            .update({
                submitted_at: now,
                teacher_approved: false, // Menunggu persetujuan guru
                updated_at: now,
            })
            .eq("id", schedule.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (e: any) {
        return NextResponse.json(
            { error: "Gagal submit jadwal" },
            { status: 500 }
        );
    }
}
