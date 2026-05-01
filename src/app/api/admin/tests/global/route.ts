import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        if (!type) {
            return NextResponse.json({ error: "Type is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Cari atau buat entri tes global (class_id IS NULL)
        const { data: test, error: testError } = await supabase
            .from("tests")
            .select("id")
            .eq("type", type)
            .is("class_id", null)
            .single();

        let finalTestId = test?.id;

        if (testError && testError.code === "PGRST116") {
            // Belum ada tes global, buat baru
            const { data: newTest, error: createError } = await supabase
                .from("tests")
                .insert({ 
                    type, 
                    class_id: null,
                    title: type === "pretest" ? "Pre-test Global" : "Post-test Global"
                })
                .select("id")
                .single();
            
            if (createError) throw createError;
            finalTestId = newTest?.id;
        } else if (testError) {
            throw testError;
        }

        if (!finalTestId) throw new Error("Gagal mengidentifikasi tes global");

        // 2. Ambil semua soal untuk tes ini
        const { data: questions, error: qError } = await supabase
            .from("test_questions")
            .select("*")
            .eq("test_id", finalTestId);

        if (qError) throw qError;

        // 3. Map correct_answer back to A, B, C, D for UI
        const mappedQuestions = (questions || []).map(q => ({
            ...q,
            correct_answer: q.correct_answer === 0 ? "A" : q.correct_answer === 1 ? "B" : q.correct_answer === 2 ? "C" : "D"
        }));

        return NextResponse.json({ 
            testId: finalTestId, 
            questions: mappedQuestions
        });

    } catch (err) {
        const error = err as { message?: string; details?: string; hint?: string };
        console.error("Global test GET error:", error);
        return NextResponse.json({ 
            error: error.message || "Internal Server Error",
            details: error.details || error.hint || null
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { type, questions } = await request.json();
        const supabase = createAdminClient();

        // 1. Pastikan tes global ada
        const { data: test } = await supabase
            .from("tests")
            .select("id")
            .eq("type", type)
            .is("class_id", null)
            .single();

        let finalTestId = test?.id;

        if (!finalTestId) {
            const { data: newTest } = await supabase
                .from("tests")
                .insert({ 
                    type, 
                    class_id: null,
                    title: type === "pretest" ? "Pre-test Global" : "Post-test Global"
                })
                .select("id")
                .single();
            finalTestId = newTest?.id;
        }

        if (!finalTestId) throw new Error("Gagal mengidentifikasi tes global");

        // 2. Hapus soal lama (untuk sinkronisasi set baru)
        const { error: deleteError } = await supabase
            .from("test_questions")
            .delete()
            .eq("test_id", finalTestId);

        if (deleteError) throw deleteError;

        // 3. Insert soal baru
        if (questions && questions.length > 0) {
            const questionsToInsert = questions.map((q: { question_text: string; options: string[]; correct_answer: string }, idx: number) => ({
                test_id: finalTestId,
                question_text: q.question_text,
                options: q.options,
                correct_answer: q.correct_answer === "A" ? 0 : q.correct_answer === "B" ? 1 : q.correct_answer === "C" ? 2 : 3,
                order_index: idx
            }));

            const { error: insertError } = await supabase
                .from("test_questions")
                .insert(questionsToInsert);

            if (insertError) throw insertError;
        }

        return NextResponse.json({ message: "Berhasil memperbarui soal global" });

    } catch (err) {
        console.error("Global test POST error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
