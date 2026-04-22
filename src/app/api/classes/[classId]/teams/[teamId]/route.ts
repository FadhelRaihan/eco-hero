import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string; teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("teams")
            .select(`
        id, name, selected_case, leader_id,
        users!teams_leader_id_fkey (id, full_name),
        team_members (
          student_id,
          users (id, full_name)
        )
      `)
            .eq("id", teamId)
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Gagal mengambil detail tim" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string; teamId: string }> }
) {
    try {
        const { classId, teamId } = await params;
        const body = await request.json();
        const { add_student_id, remove_student_id } = body;
        const supabase = createAdminClient();

        if (add_student_id) {
            const { data: existingMember } = await supabase
                .from("team_members")
                .select("team_id")
                .eq("student_id", add_student_id)
                .single();

            if (existingMember) {
                return NextResponse.json(
                    { error: "Siswa sudah tergabung di tim lain" },
                    { status: 409 }
                );
            }

            await supabase.from("team_members").insert({
                team_id: teamId,
                student_id: add_student_id,
            });
            await supabase
                .from("class_members")
                .update({ team_role: "anggota" })
                .eq("class_id", classId)
                .eq("student_id", add_student_id);

            // Ambil step ketua saat ini untuk disinkronkan ke anggota baru
            const { data: teamInfo } = await supabase.from("teams").select("leader_id").eq("id", teamId).single();
            let syncStep = 2;
            if (teamInfo) {
                const { data: leaderProg } = await supabase
                    .from("mission_progress")
                    .select("mission2_step")
                    .eq("mission_number", 2)
                    .eq("student_id", teamInfo.leader_id)
                    .single();
                if (leaderProg && leaderProg.mission2_step) {
                    syncStep = leaderProg.mission2_step;
                }
            }

            // Sinkronkan step anggota
            await supabase
                .from("mission_progress")
                .update({ mission2_step: syncStep })
                .eq("mission_number", 2)
                .eq("student_id", add_student_id);
        }

        if (remove_student_id) {
            await supabase
                .from("team_members")
                .delete()
                .eq("team_id", teamId)
                .eq("student_id", remove_student_id);

            await supabase
                .from("class_members")
                .update({ team_role: "belum_pilih" })
                .eq("class_id", classId)
                .eq("student_id", remove_student_id);

            // Kembalikan step anggota ke 1 karena keluar dari tim
            await supabase
                .from("mission_progress")
                .update({ mission2_step: 1 })
                .eq("mission_number", 2)
                .eq("student_id", remove_student_id);
        }

        return NextResponse.json({ message: "Tim diperbarui" });
    } catch {
        return NextResponse.json(
            { error: "Gagal memperbarui tim" },
            { status: 500 }
        );
    }
}