import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ missionNumber: string }> }
) {
    try {
        const { missionNumber } = await params;
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacher_id");

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Ambil semua kelas milik guru ini
        const { data: classes } = await supabase
            .from("classes")
            .select("id, name")
            .eq("teacher_id", teacherId);
        
        const classIds = classes?.map(c => c.id) || [];
        if (classIds.length === 0) return NextResponse.json({ data: [] });

        let submissionData: any[] = [];

        if (missionNumber === "1") {
            const { data } = await supabase
                .from("mission1_forum_posts")
                .select(`
                    *,
                    users:student_id (id, full_name),
                    classes:class_id (name)
                `)
                .in("class_id", classIds);
            submissionData = data || [];
        } else if (missionNumber === "2") {
            const { data } = await supabase
                .from("mission2_submissions")
                .select(`
                    *,
                    teams:team_id (
                        id, 
                        name, 
                        class_id, 
                        classes:class_id (name),
                        team_members (
                            student_id,
                            users:student_id (full_name)
                        )
                    )
                `)
                .in("teams.class_id", classIds);
            
            // Filter out null teams (due to inner join behavior simulation)
            submissionData = data?.filter(s => s.teams) || [];
        } else if (missionNumber === "3") {
            const { data } = await supabase
                .from("mission3_schedules")
                .select(`
                    *,
                    teams:team_id (
                        id, 
                        name, 
                        class_id,
                        classes:class_id (name)
                    ),
                    mission3_tasks (*)
                `)
                .in("teams.class_id", classIds);
            submissionData = data?.filter(s => s.teams) || [];
        } else if (missionNumber === "4") {
            const { data } = await supabase
                .from("mission4_submissions")
                .select(`
                    *,
                    teams:team_id (
                        id, 
                        name, 
                        class_id,
                        classes:class_id (name)
                    )
                `)
                .in("teams.class_id", classIds);
            
            // Group by team since mission 4 can have multiple files per team
            const grouped = (data || []).reduce((acc: any, curr: any) => {
                const teamId = curr.team_id;
                if (!acc[teamId]) {
                    acc[teamId] = {
                        team_id: teamId,
                        team_name: curr.teams?.name,
                        class_name: curr.teams?.classes?.name,
                        files: []
                    };
                }
                acc[teamId].files.push(curr);
                return acc;
            }, {});
            submissionData = Object.values(grouped);
        }

        return NextResponse.json({ data: submissionData });
    } catch (err: any) {
        console.error("Error fetching all submissions for mission:", err);
        return NextResponse.json({ error: "Gagal mengambil data submission" }, { status: 500 });
    }
}
