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
            .from("mission_progress")
            .select("*")
            .eq("student_id", studentId)
            .order("mission_number", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json({ error: "Gagal mengambil progress" }, { status: 500 });
    }
}