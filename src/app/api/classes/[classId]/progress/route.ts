import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;
        const supabase = createAdminClient();

        // Ambil semua siswa di kelas beserta data user
        const { data: members, error } = await supabase
            .from("class_members")
            .select(`
                student_id,
                team_role,
                users (id, full_name)
            `)
            .eq("class_id", classId);

        if (error) throw error;

        // Ambil semua tim dan anggotanya di kelas ini
        const { data: teamsData } = await supabase
            .from("teams")
            .select("id, name, team_members(student_id)")
            .eq("class_id", classId);

        // Ambil semua mission_progress untuk kelas ini
        const { data: progressData } = await supabase
            .from("mission_progress")
            .select("*")
            .eq("class_id", classId);

        // Gabungkan data
        const result = (members ?? []).map((member: any) => {
            const team = teamsData?.find(t => 
                t.team_members.some((tm: any) => tm.student_id === member.student_id)
            );
            return {
                student_id: member.student_id,
                full_name: member.users?.full_name,
                team_role: member.team_role,
                team_id: team?.id,
                team_name: team?.name ?? "-",
                missions: (progressData ?? [])
                    .filter((p) => p.student_id === member.student_id)
                    .sort((a, b) => a.mission_number - b.mission_number),
            };
        });

        return NextResponse.json({ data: result });
    } catch (err) {
        return NextResponse.json({ error: "Gagal mengambil progress kelas" }, { status: 500 });


    }
}