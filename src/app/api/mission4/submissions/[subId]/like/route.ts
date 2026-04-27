import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ subId: string }> }
) {
    try {
        const { subId } = await params;
        const { studentId } = await request.json();

        if (!studentId) {
            return NextResponse.json({ error: "Student ID required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Check if already liked
        const { data: existingLike } = await supabase
            .from("mission4_gallery_likes")
            .select("id")
            .eq("submission_id", subId)
            .eq("student_id", studentId)
            .single();

        if (existingLike) {
            // Unlike
            await supabase
                .from("mission4_gallery_likes")
                .delete()
                .eq("id", existingLike.id);
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await supabase
                .from("mission4_gallery_likes")
                .insert({
                    submission_id: subId,
                    student_id: studentId
                });
            return NextResponse.json({ liked: true });
        }
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Gagal memproses like" },
            { status: 500 }
        );
    }
}
