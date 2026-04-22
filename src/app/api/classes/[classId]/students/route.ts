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
            .from("class_members")
            .select(`
        student_id,
        team_role,
        users (id, full_name)
      `)
            .eq("class_id", classId);

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Gagal mengambil data siswa" },
            { status: 500 }
        );
    }
}