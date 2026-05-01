import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") as "pretest" | "posttest";

        if (!type) {
            return NextResponse.json({ error: "Missing type parameter" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Fetch the active test for this type (GLOBAL TEST -> class_id is null)
        const { data: test, error: testError } = await supabase
            .from("tests")
            .select("*")
            .is("class_id", null)
            .eq("type", type)
            .eq("is_active", true)
            .single();

        if (testError) {
            // If not found, it might just mean no active test
            return NextResponse.json({ data: null }, {
                headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
            });
        }

        // 2. Fetch the questions for this test
        const { data: questions, error: qError } = await supabase
            .from("test_questions")
            .select("id, question_text, options, correct_answer")
            .eq("test_id", test.id)
            .order("order_index", { ascending: true });

        if (qError) throw qError;

        return NextResponse.json(
            { data: { ...test, questions } },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
                },
            }
        );
    } catch (error) {
        console.error("GET /api/tests error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { class_id, type, title, questions } = body;

        if (!class_id || !type || !questions) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Upsert the test record
        const { data: test, error: testError } = await supabase
            .from("tests")
            .upsert({
                class_id,
                type,
                title,
                is_active: true
            }, { onConflict: "class_id, type" }) // Assuming unique index on class_id + type
            .select()
            .single();

        if (testError) throw testError;

        // 2. Sync questions: Delete existing and insert new
        // Note: In a real app, you might want to use a transaction or more sophisticated sync
        await supabase
            .from("test_questions")
            .delete()
            .eq("test_id", test.id);

        const questionsToInsert = questions.map((q: { question_text: string; options: string[]; correct_answer: number }, index: number) => ({
            test_id: test.id,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            order_index: index
        }));

        if (questionsToInsert.length > 0) {
            const { error: qError } = await supabase
                .from("test_questions")
                .insert(questionsToInsert);
            
            if (qError) throw qError;
        }

        return NextResponse.json({ success: true, test_id: test.id });
    } catch (error) {
        const err = error as Error;
        console.error("POST /api/tests error:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
