import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("teams")
            .select(`
        id,
        name,
        selected_case,
        leader_id,
        users!teams_leader_id_fkey (id, full_name),
        team_members (
          student_id,
          users (id, full_name)
        )
      `)
            .eq("class_id", classId);

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Gagal mengambil data tim" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;
        const body = await request.json();
        const { name, selected_case, leader_id } = body;

        if (!name || !selected_case || !leader_id) {
            return NextResponse.json(
                { error: "Nama tim, kasus, dan leader_id wajib diisi" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data: existingTeam } = await supabase
            .from("teams")
            .select("id")
            .eq("class_id", classId)
            .eq("leader_id", leader_id)
            .single();

        if (existingTeam) {
            return NextResponse.json(
                { error: "Kamu sudah membuat tim" },
                { status: 409 }
            );
        }

        const { data: team, error: teamError } = await supabase
            .from("teams")
            .insert({ class_id: classId, name, selected_case, leader_id })
            .select("id, name, selected_case, leader_id")
            .single();

        if (teamError || !team) throw teamError;

        await supabase.from("team_members").insert({
            team_id: team.id,
            student_id: leader_id,
        });

        await supabase
            .from("class_members")
            .update({ team_role: "ketua" })
            .eq("class_id", classId)
            .eq("student_id", leader_id);

        return NextResponse.json({ data: team }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Gagal membuat tim" },
            { status: 500 }
        );
    }
}