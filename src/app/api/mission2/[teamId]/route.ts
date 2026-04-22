import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission2_submissions")
            .select("*")
            .eq("team_id", teamId)
            .single();

        if (error && error.code !== "PGRST116") throw error;

        return NextResponse.json({ data: data ?? null });
    } catch {
        return NextResponse.json(
            { error: "Gagal mengambil data brainstorming" },
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
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission2_submissions")
            .upsert(
                {
                    team_id: teamId,
                    ...body,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "team_id" }
            )
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Gagal menyimpan brainstorming" },
            { status: 500 }
        );
    }
}