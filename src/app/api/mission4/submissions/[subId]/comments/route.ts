import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subId: string }> }
) {
    try {
        const { subId } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission4_gallery_comments")
            .select(`
                *,
                users (
                    full_name
                )
            `)
            .eq("submission_id", subId)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ subId: string }> }
) {
    try {
        const { subId } = await params;
        const { studentId, content } = await request.json();

        if (!studentId || !content) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("mission4_gallery_comments")
            .insert({
                submission_id: subId,
                student_id: studentId,
                content
            })
            .select(`
                *,
                users (
                    full_name
                )
            `)
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
