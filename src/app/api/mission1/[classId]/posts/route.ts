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

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Gagal mengambil data forum" },
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

        // Cek apakah siswa sudah pernah posting di kelas ini
        const { data: existing } = await supabase
            .from("mission1_forum_posts")
            .select("id")
            .eq("class_id", classId)
            .eq("student_id", body.student_id)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: "Kamu sudah membuat post sebelumnya" },
                { status: 409 }
            );
        }

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

        return NextResponse.json({ data }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Gagal membuat post" },
            { status: 500 }
        );
    }
}