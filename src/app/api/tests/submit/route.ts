import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { student_id, type, answers } = body;

        if (!student_id || !type || !answers) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data: member } = await supabase
            .from("class_members")
            .select("class_id")
            .eq("student_id", student_id)
            .single();

        if (!member) throw new Error("Student not in a class");

        const { data: test } = await supabase
            .from("tests")
            .select("id")
            .is("class_id", null)
            .eq("type", type)
            .eq("is_active", true)
            .single();

        if (!test) throw new Error("No active test found");

        const { data: questions } = await supabase
            .from("test_questions")
            .select("id, correct_answer")
            .eq("test_id", test.id);

        if (!questions) throw new Error("No questions found for this test");

        let correctCount = 0;
        const mappedAnswers: Record<string, string> = {};

        questions.forEach(q => {
            // Evaluasi jawaban (bandingkan index integer)
            if (String(answers[q.id]) === String(q.correct_answer)) {
                correctCount++;
            }
            // Konversi ke format huruf (A, B, C, D) untuk disimpan ke database
            const ansIndex = parseInt(answers[q.id]);
            mappedAnswers[q.id] = ansIndex === 0 ? "A" : ansIndex === 1 ? "B" : ansIndex === 2 ? "C" : "D";
        });
        const score = (correctCount / questions.length) * 100;

        // 4. Save submission
        const { error: subError } = await supabase
            .from("test_submissions")
            .insert({
                test_id: test.id,
                student_id,
                answers: mappedAnswers,
                score
            });

        if (subError) throw subError;

        const statusField = type === "pretest" ? "pretest_status" : "posttest_status";
        const missionNumber = type === "pretest" ? 1 : 4;

        await supabase
            .from("mission_progress")
            .update({ [statusField]: "completed" })
            .eq("student_id", student_id)
            .eq("mission_number", missionNumber);

        // Jika pretest selesai, buka kunci Misi 1
        if (type === "pretest") {
            await supabase
                .from("mission_progress")
                .update({ status: "in_progress" })
                .eq("student_id", student_id)
                .eq("mission_number", 1)
                .eq("status", "locked");
        }

        return NextResponse.json({ success: true, score });
    } catch (error) {
        const err = error as Error;
        console.error("POST /api/tests/submit error:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
