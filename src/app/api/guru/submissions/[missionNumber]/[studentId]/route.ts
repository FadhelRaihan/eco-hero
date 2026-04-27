import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ missionNumber: string; studentId: string }> }
) {
    try {
        const { missionNumber, studentId } = await params;
        const supabase = createAdminClient();

        // 1. Get team_id for the student (needed for missions 2, 3, 4)
        const { data: teamMember } = await supabase
            .from("team_members")
            .select("team_id, teams(name)")
            .eq("student_id", studentId)
            .single();

        const teamId = teamMember?.team_id;
        const teamName = (teamMember?.teams as any)?.name;

        let submissionData = null;

        if (missionNumber === "1") {
            const { data } = await supabase
                .from("mission1_forum_posts")
                .select("*")
                .eq("student_id", studentId)
                .single();
            submissionData = data;
        } else if (missionNumber === "2") {
            if (teamId) {
                const { data } = await supabase
                    .from("mission2_submissions")
                    .select("*")
                    .eq("team_id", teamId)
                    .single();
                submissionData = data;
            }
        } else if (missionNumber === "3") {
            if (teamId) {
                const { data: schedule } = await supabase
                    .from("mission3_schedules")
                    .select("id")
                    .eq("team_id", teamId)
                    .single();
                
                if (schedule) {
                    const { data: tasks } = await supabase
                        .from("mission3_tasks")
                        .select(`
                            *,
                            user:assigned_to ( id, full_name )
                        `)
                        .eq("schedule_id", schedule.id);
                    submissionData = { tasks };
                }
            }
        } else if (missionNumber === "4") {
            if (teamId) {
                const { data } = await supabase
                    .from("mission4_submissions")
                    .select("*")
                    .eq("team_id", teamId);
                submissionData = { files: data };
            }
        }

        return NextResponse.json({ 
            data: submissionData,
            team_id: teamId,
            team_name: teamName
        });
    } catch (err: any) {
        console.error("Error fetching submission:", err);
        return NextResponse.json({ error: "Gagal mengambil data submission" }, { status: 500 });
    }
}
