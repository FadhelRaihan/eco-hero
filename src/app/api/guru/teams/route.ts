import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface TeamRow {
    id: string;
    name: string;
    selected_case: string;
    team_members: {
        users: {
            full_name: string;
            role: string;
        } | null;
    }[];
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacher_id");

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Dapatkan Class ID dari teacher_id
        const { data: classData, error: classError } = await supabase
            .from("classes")
            .select("id")
            .eq("teacher_id", teacherId)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ data: [] });
        }

        // 2. Ambil data tim di kelas tersebut beserta anggotanya
        const { data: teams, error: teamsError } = await supabase
            .from("teams")
            .select(`
                id,
                name,
                selected_case,
                team_members (
                    users (
                        full_name,
                        role
                    )
                )
            `)
            .eq("class_id", classData.id);

        if (teamsError) throw teamsError;

        // 3. Format data sesuai kebutuhan frontend
        const typedTeams = (teams as unknown as TeamRow[]) || [];
        const formattedTeams = typedTeams.map((team) => ({
            id: team.id,
            name: team.name,
            selected_case: team.selected_case,
            member_count: team.team_members?.length || 0,
            members: team.team_members?.map((tm) => ({
                full_name: tm.users?.full_name || "Tanpa Nama",
                role: tm.users?.role || "siswa"
            })) || []
        }));

        return NextResponse.json({ data: formattedTeams });
    } catch (err) {
        console.error("Error fetching guru teams:", err);
        return NextResponse.json({ error: "Gagal mengambil data tim" }, { status: 500 });
    }
}
