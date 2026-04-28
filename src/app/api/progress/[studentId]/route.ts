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

        return NextResponse.json({ data }, {
            headers: {
                // Browser-only cache (private): data spesifik per siswa
                // 30s cache → maks 30s stale, lalu revalidate di background
                "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
            },
        });
    } catch {
        return NextResponse.json({ error: "Gagal mengambil progress" }, { status: 500 });
    }
}