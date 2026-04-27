import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacher_id");

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Ambil semua kelas milik guru ini
        const { data: classes } = await supabase
            .from("classes")
            .select("id, name")
            .eq("teacher_id", teacherId);
        
        const classIds = classes?.map(c => c.id) || [];
        if (classIds.length === 0) return NextResponse.json({ data: [] });

        // 2. Ambil semua test submissions untuk kelas-kelas tersebut
        // Kita ambil * untuk memastikan kolom apa saja yang ada (terutama untuk tanggal)
        const { data: submissions, error: subError } = await supabase
            .from("test_submissions")
            .select(`
                *,
                users:student_id (full_name),
                tests:test_id (
                    id,
                    type,
                    class_id,
                    classes:class_id (name),
                    test_questions (*)
                )
            `)
            .in("tests.class_id", classIds);

        if (subError) {
            console.error("Submissions Error:", subError);
            throw subError;
        }

        // 3. Transform data untuk tampilan tabel
        const result = (submissions ?? []).map((s: any) => {
            return {
                id: s.id,
                student_name: s.users?.full_name,
                class_name: s.tests?.classes?.name,
                type: s.tests?.type,
                score: s.score,
                date: s.submitted_at,
                answers: s.answers,
                questions: s.tests?.test_questions || []
            };
        });

        return NextResponse.json({ data: result });
    } catch (err: any) {
        console.error("Error fetching test results:", err);
        return NextResponse.json({ error: "Gagal mengambil data hasil tes: " + err.message }, { status: 500 });
    }
}
