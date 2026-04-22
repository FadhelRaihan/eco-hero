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
            .from("mission4_submissions")
            .select("*")
            .eq("team_id", teamId)
            .order("uploaded_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data: data || [] });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Gagal mengambil dokumentasi" },
            { status: 500 }
        );
    }
}
