import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { forumCommentSchema } from "@/lib/validations/mission1";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string; postId: string }> }
) {
    try {
        const { postId } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission1_forum_comments")
            .select(`
        id,
        content,
        created_at,
        student_id,
        users (id, full_name)
      `)
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Gagal mengambil komentar" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string; postId: string }> }
) {
    try {
        const { postId } = await params;
        const body = await request.json();

        const parsed = forumCommentSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission1_forum_comments")
            .insert({
                post_id: postId,
                student_id: body.student_id,
                content: parsed.data.content,
            })
            .select(`
        id,
        content,
        created_at,
        student_id,
        users (id, full_name)
      `)
            .single();

        if (error) throw error;

        return NextResponse.json({ data }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Gagal menambahkan komentar" },
            { status: 500 }
        );
    }
}