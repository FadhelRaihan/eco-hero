import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission4_reflections")
            .select("*")
            .eq("student_id", studentId)
            .single();

        if (error && error.code !== "PGRST116") throw error;

        return NextResponse.json({ data: data || null });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Gagal mengambil refleksi" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params;
        const body = await request.json();
        const { team_id, feeling, commitment } = body;
        
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission4_reflections")
            .upsert({
                student_id: studentId,
                team_id,
                feeling,
                commitment,
                submitted_at: new Date().toISOString()
            }, { onConflict: "student_id" })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Gagal menyimpan refleksi" },
            { status: 500 }
        );
    }
}
