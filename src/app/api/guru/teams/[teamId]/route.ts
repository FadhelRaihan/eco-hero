import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const supabase = createAdminClient();

        // Ambil data tim dan anggotanya
        const { data: team, error } = await supabase
            .from("teams")
            .select(`
                id,
                name,
                selected_case,
                team_members (
                    student_id,
                    users (id, full_name)
                )
            `)
            .eq("id", teamId)
            .single();

        if (error) throw error;

        return NextResponse.json({ data: team });
    } catch (err: any) {
        console.error("Error fetching team details:", err);
        return NextResponse.json({ error: "Gagal mengambil data tim" }, { status: 500 });
    }
}
