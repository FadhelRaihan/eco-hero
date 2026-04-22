import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const supabase = createAdminClient();

        // Cari schedule id
        const { data: schedule } = await supabase
            .from("mission3_schedules")
            .select("id")
            .eq("team_id", teamId)
            .single();

        if (!schedule) {
            return NextResponse.json({ data: [] });
        }

        const { data, error } = await supabase
            .from("mission3_tasks")
            .select(`
                *,
                user:assigned_to ( id, full_name )
            `)
            .eq("schedule_id", schedule.id)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Gagal mengambil tugas" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const body = await request.json();
        const { title, assigned_to, scheduled_date } = body;
        
        const supabase = createAdminClient();

        const { data: schedule } = await supabase
            .from("mission3_schedules")
            .select("id")
            .eq("team_id", teamId)
            .single();

        if (!schedule) throw new Error("Jadwal tidak ditemukan");

        const { data, error } = await supabase
            .from("mission3_tasks")
            .insert({
                schedule_id: schedule.id,
                title,
                assigned_to,
                scheduled_date,
                status: "belum"
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Gagal menambah tugas" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> } // unused teamId but required by next convention
) {
    try {
        const body = await request.json();
        const { task_id, status } = body;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission3_tasks")
            .update({ status })
            .eq("id", task_id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Gagal mengupdate tugas" },
            { status: 500 }
        );
    }
}
