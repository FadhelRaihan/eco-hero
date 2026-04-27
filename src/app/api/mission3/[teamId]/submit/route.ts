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

        // Bypass approval langsung:
        const { data, error } = await supabase
            .from("mission3_schedules")
            .update({
                submitted_at: now,
                teacher_approved: true, // Bypass!
                approved_at: now,
                updated_at: now,
            })
            .eq("id", schedule.id)
            .select()
            .single();

        if (error) throw error;

        // Update progress semua anak di tim ini
        const { data: members } = await supabase
            .from("team_members")
            .select("student_id")
            .eq("team_id", teamId);

        if (members && members.length > 0) {
            const memberIds = members.map(m => m.student_id);

            // 1. Update Mission 3 status to completed for all members
            await supabase
                .from("mission_progress")
                .update({ 
                    status: "completed",
                    badge_earned: true,
                    completed_at: now
                })
                .in("student_id", memberIds)
                .eq("mission_number", 3);

            // 2. Unlock Mission 4 (set to in_progress) for all members
            await supabase
                .from("mission_progress")
                .update({ 
                    status: "in_progress" 
                })
                .in("student_id", memberIds)
                .eq("mission_number", 4)
                .eq("status", "locked");

            // 3. Update team-wide mission progress
            await supabase
                .from("team_mission_progress")
                .upsert({
                    team_id: teamId,
                    mission_number: 3,
                    status: "completed",
                    completed_at: now
                }, { onConflict: "team_id,mission_number" });
        }

        return NextResponse.json({ data });
    } catch (e: any) {
        return NextResponse.json(
            { error: "Gagal submit jadwal" },
            { status: 500 }
        );
    }
}
