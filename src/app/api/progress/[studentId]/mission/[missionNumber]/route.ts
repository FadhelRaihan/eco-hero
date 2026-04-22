import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string; missionNumber: string }> }
) {
    try {
        const { studentId, missionNumber } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission_progress")
            .select("*")
            .eq("student_id", studentId)
            .eq("mission_number", parseInt(missionNumber))
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json({ error: "Gagal mengambil progress" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string; missionNumber: string }> }
) {
    try {
        const { studentId, missionNumber } = await params;
        const body = await request.json();
        const supabase = createAdminClient();
        const missionNum = parseInt(missionNumber);

        // Update progress individu
        const { error: progressError } = await supabase
            .from("mission_progress")
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq("student_id", studentId)
            .eq("mission_number", missionNum);

        if (progressError) throw progressError;

        // Jika update mission2_step, sinkronkan ke semua anggota tim
        if (missionNum === 2 && body.mission2_step !== undefined) {
            const { data: teamMember } = await supabase
                .from("team_members")
                .select("team_id")
                .eq("student_id", studentId)
                .single();

            if (teamMember) {
                const { data: allMembers } = await supabase
                    .from("team_members")
                    .select("student_id")
                    .eq("team_id", teamMember.team_id);

                if (allMembers) {
                    const memberIds = allMembers.map((m) => m.student_id);
                    await supabase
                        .from("mission_progress")
                        .update({ mission2_step: body.mission2_step })
                        .in("student_id", memberIds)
                        .eq("mission_number", 2);
                }
            }
        }

        // Jika status completed dan misi >= 2, cek apakah semua anggota tim selesai
        if (body.status === "completed" && missionNum >= 2) {
            // Ambil team_id siswa ini
            const { data: teamMember } = await supabase
                .from("team_members")
                .select("team_id")
                .eq("student_id", studentId)
                .single();

            if (teamMember) {
                const teamId = teamMember.team_id;

                // Ambil semua anggota tim
                const { data: allMembers } = await supabase
                    .from("team_members")
                    .select("student_id")
                    .eq("team_id", teamId);

                if (allMembers) {
                    const memberIds = allMembers.map((m) => m.student_id);

                    // Cek apakah semua anggota sudah completed misi ini
                    const { data: completedMembers } = await supabase
                        .from("mission_progress")
                        .select("student_id")
                        .in("student_id", memberIds)
                        .eq("mission_number", missionNum)
                        .eq("status", "completed");

                    if (completedMembers?.length === memberIds.length) {
                        // Semua selesai — update team_mission_progress
                        await supabase
                            .from("team_mission_progress")
                            .upsert({
                                team_id: teamId,
                                mission_number: missionNum,
                                status: "completed",
                                completed_at: new Date().toISOString(),
                            }, { onConflict: "team_id,mission_number" });

                        // Unlock misi berikutnya untuk semua anggota tim
                        if (missionNum < 4) {
                            for (const memberId of memberIds) {
                                await supabase
                                    .from("mission_progress")
                                    .update({ status: "in_progress" })
                                    .eq("student_id", memberId)
                                    .eq("mission_number", missionNum + 1)
                                    .eq("status", "locked");
                            }
                        }
                    }
                }
            }
        }

        // Jika misi 1 completed, langsung unlock misi 2 untuk individu (belum ada tim)
        if (body.status === "completed" && missionNum === 1) {
            await supabase
                .from("mission_progress")
                .update({ status: "in_progress" })
                .eq("student_id", studentId)
                .eq("mission_number", 2)
                .eq("status", "locked");
        }

        return NextResponse.json({ message: "Progress diperbarui" });
    } catch {
        return NextResponse.json({ error: "Gagal memperbarui progress" }, { status: 500 });
    }
}