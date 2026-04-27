import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Get the team the student belongs to
        const { data: membership, error: memberError } = await supabase
            .from("team_members")
            .select("team_id")
            .eq("student_id", studentId)
            .single();

        if (memberError || !membership) {
            return NextResponse.json({ data: null }); // Not in a team
        }

        const teamId = membership.team_id;

        // 2. Get team details
        const { data: team, error: teamError } = await supabase
            .from("teams")
            .select("*")
            .eq("id", teamId)
            .single();

        if (teamError) throw teamError;

        // 3. Get all members with their names
        const { data: members, error: membersError } = await supabase
            .from("team_members")
            .select(`
                student_id,
                users (
                    full_name
                )
            `)
            .eq("team_id", teamId);

        if (membersError) throw membersError;

        return NextResponse.json({
            data: {
                ...team,
                members: members.map((m: any) => ({
                    id: m.student_id,
                    full_name: m.users.full_name,
                    is_leader: m.student_id === team.leader_id
                }))
            }
        });
    } catch (error: any) {
        console.error("GET /api/teams/my-team error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
