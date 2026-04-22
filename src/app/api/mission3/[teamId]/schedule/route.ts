import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const supabase = createAdminClient();

        let { data, error } = await supabase
            .from("mission3_schedules")
            .select("*")
            .eq("team_id", teamId)
            .single();

        if (error && error.code === "PGRST116") {
            // Not found, create an initial one
            const { data: newData, error: insertError } = await supabase
                .from("mission3_schedules")
                .insert({
                    team_id: teamId,
                    teacher_approved: false,
                })
                .select()
                .single();
            
            if (insertError) throw insertError;
            data = newData;
        } else if (error) {
            throw error;
        }

        return NextResponse.json({ data: data ?? null });
    } catch {
        return NextResponse.json(
            { error: "Gagal mengambil data jadwal" },
            { status: 500 }
        );
    }
}
