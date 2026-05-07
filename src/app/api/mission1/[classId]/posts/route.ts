import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { forumPostSchema } from "@/lib/validations/mission1";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;
        const { searchParams } = new URL(request.url);
        const topic = searchParams.get("topic");
        const supabase = createAdminClient();

        let query = supabase
            .from("mission1_forum_posts")
            .select(`
        id,
        case_topic,
        perspective_env,
        perspective_soc,
        created_at,
        student_id,
        users (id, full_name),
        mission1_forum_comments (count)
      `)
            .eq("class_id", classId)
            .order("created_at", { ascending: false });

        if (topic) {
            query = query.eq("case_topic", topic);
        }

        const { data, error } = await query;
        if (error) throw error;

        const { data: progressData } = await supabase
            .from("mission_progress")
            .select("student_id, mission1_question_answer")
            .eq("class_id", classId)
            .eq("mission_number", 1);

        const progressMap = new Map<string, string | null>();
        if (progressData) {
            (progressData as { student_id: string; mission1_question_answer: string | null }[]).forEach((p) => {
                progressMap.set(p.student_id, p.mission1_question_answer);
            });
        }

        interface ForumPostWithComments {
            id: string;
            case_topic: string;
            perspective_env: string;
            perspective_soc: string;
            created_at: string;
            student_id: string;
            users: { id: string; full_name: string } | null;
            mission1_forum_comments: { count: number }[];
        }

        const postsWithAnswers = (data as unknown as ForumPostWithComments[] ?? []).map((post) => ({
            ...post,
            mission1_question_answer: progressMap.get(post.student_id) || null,
        }));

        return NextResponse.json({ data: postsWithAnswers });
    } catch (error) {
        console.error("GET /api/mission1/posts error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Gagal mengambil data forum" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;
        const body = await request.json();

        const parsed = forumPostSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();


        const { data, error } = await supabase
            .from("mission1_forum_posts")
            .insert({
                class_id: classId,
                student_id: body.student_id,
                ...parsed.data,
            })
            .select(`
        id,
        case_topic,
        perspective_env,
        perspective_soc,
        created_at,
        student_id,
        users (id, full_name)
      `)
            .single();

        if (error) throw error;

        const { data: progress } = await supabase
            .from("mission_progress")
            .select("mission1_question_answer")
            .eq("student_id", body.student_id)
            .eq("mission_number", 1)
            .single();

        const dataWithAnswer = {
            ...data,
            mission1_question_answer: progress?.mission1_question_answer || null,
        };

        return NextResponse.json({ data: dataWithAnswer }, { status: 201 });
    } catch (error) {
        console.error("POST /api/mission1/posts error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Gagal membuat post" },
            { status: 500 }
        );
    }
}