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
            .eq("class_id", member.class_id)
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
        questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                correctCount++;
            }
        });
        const score = (correctCount / questions.length) * 100;

        // 4. Save submission
        const { error: subError } = await supabase
            .from("test_submissions")
            .insert({
                test_id: test.id,
                student_id,
                answers,
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
    } catch (error: any) {
        console.error("POST /api/tests/submit error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
