import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const supabase = createAdminClient();

        // Cari schedule yang sudah disubmit
        const { data: schedule, error: fetchError } = await supabase
            .from("mission3_schedules")
            .select("id, submitted_at, teacher_approved")
            .eq("team_id", teamId)
            .single();

        if (fetchError) throw fetchError;
        if (!schedule.submitted_at) {
            return NextResponse.json(
                { error: "Jadwal belum diajukan oleh tim" },
                { status: 400 }
            );
        }
        if (schedule.teacher_approved) {
            return NextResponse.json(
                { error: "Jadwal sudah disetujui sebelumnya" },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        // Approve jadwal
        const { data, error } = await supabase
            .from("mission3_schedules")
            .update({
                teacher_approved: true,
                approved_at: now,
                updated_at: now,
            })
            .eq("id", schedule.id)
            .select()
            .single();

        if (error) throw error;

        // Update progress semua anggota tim
        const { data: members } = await supabase
            .from("team_members")
            .select("student_id")
            .eq("team_id", teamId);

        if (members && members.length > 0) {
            const memberIds = members.map(m => m.student_id);

            // 1. Misi 3 selesai
            await supabase
                .from("mission_progress")
                .update({
                    status: "completed",
                    badge_earned: true,
                    completed_at: now
                })
                .in("student_id", memberIds)
                .eq("mission_number", 3);

            // 2. Buka kunci Misi 4
            await supabase
                .from("mission_progress")
                .update({ status: "in_progress" })
                .in("student_id", memberIds)
                .eq("mission_number", 4)
                .eq("status", "locked");

            // 3. Update team mission progress
            await supabase
                .from("team_mission_progress")
                .upsert({
                    team_id: teamId,
                    mission_number: 3,
                    status: "completed",
                    completed_at: now
                }, { onConflict: "team_id,mission_number" });
        }

        return NextResponse.json({ data, message: "Jadwal berhasil disetujui" });
    } catch (e: any) {
        console.error("Approve error:", e);
        return NextResponse.json(
            { error: "Gagal menyetujui jadwal" },
            { status: 500 }
        );
    }
}
