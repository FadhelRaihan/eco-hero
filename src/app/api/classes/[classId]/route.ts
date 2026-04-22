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
            .from("classes")
            .select("id, name, teacher_id")
            .eq("id", classId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}