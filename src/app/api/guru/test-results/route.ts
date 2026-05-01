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

        // 2. Ambil semua siswa yang ada di kelas-kelas tersebut
        const { data: members } = await supabase
            .from("class_members")
            .select("student_id")
            .in("class_id", classIds);

        const studentIds = members?.map(m => m.student_id) || [];
        if (studentIds.length === 0) return NextResponse.json({ data: [] });

        // 3. Ambil semua test submissions untuk siswa-siswa tersebut
        const { data: submissions, error: subError } = await supabase
            .from("test_submissions")
            .select(`
                *,
                users:student_id (full_name),
                tests:test_id (
                    id,
                    type,
                    test_questions (*)
                )
            `)
            .in("student_id", studentIds);

        if (subError) {
            console.error("Submissions Error:", subError);
            throw subError;
        }

        // 4. Buat mapping student_id ke nama kelas
        const classMap: Record<string, string> = {};
        (members as { student_id: string; class_id: string }[] | null)?.forEach((m) => {
            const className = classes?.find(c => c.id === m.class_id)?.name;
            if (className) classMap[m.student_id] = className;
        });

        // 5. Transform data untuk tampilan tabel
        interface TestSubmission {
            id: string;
            student_id: string;
            score: number;
            submitted_at: string;
            answers: Record<string, string>;
            users: { full_name: string } | null;
            tests: {
                type: string;
                test_questions: {
                    id: string;
                    question_text: string;
                    options: string[] | Record<string, string>;
                    correct_answer: number;
                }[];
            } | null;
        }

        const result = (submissions as unknown as TestSubmission[] ?? []).map((s) => {
            const mappedQuestions = (s.tests?.test_questions || []).map(q => ({
                ...q,
                correct_answer: q.correct_answer === 0 ? "A" : q.correct_answer === 1 ? "B" : q.correct_answer === 2 ? "C" : "D"
            }));

            return {
                id: s.id,
                student_name: s.users?.full_name || "Siswa Tidak Diketahui",
                class_name: classMap[s.student_id] || "Kelas Tidak Diketahui",
                type: s.tests?.type || "unknown",
                score: s.score,
                date: s.submitted_at,
                answers: s.answers,
                questions: mappedQuestions
            };
        });

        return NextResponse.json({ data: result });
    } catch (err) {
        console.error("Error fetching test results:", err);
        return NextResponse.json({ error: "Gagal mengambil data hasil tes: " + (err as Error).message }, { status: 500 });
    }
}
