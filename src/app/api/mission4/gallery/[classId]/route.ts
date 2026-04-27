import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;
        const studentId = request.nextUrl.searchParams.get("studentId");
        const supabase = createAdminClient();

        // Fetch submissions joined with team info
        const { data, error } = await supabase
            .from("mission4_submissions")
            .select(`
                *,
                teams!inner (
                    id,
                    name,
                    selected_case,
                    class_id
                )
            `)
            .eq("teams.class_id", classId)
            .order("uploaded_at", { ascending: false });

        if (error) throw error;

        const submissionsWithStats = await Promise.all(data.map(async (sub) => {
            const [likesRes, commentsRes, myLikeRes] = await Promise.all([
                supabase.from("mission4_gallery_likes").select("id", { count: "exact", head: true }).eq("submission_id", sub.id),
                supabase.from("mission4_gallery_comments").select("id", { count: "exact", head: true }).eq("submission_id", sub.id),
                studentId 
                    ? supabase.from("mission4_gallery_likes").select("id").eq("submission_id", sub.id).eq("student_id", studentId).single()
                    : Promise.resolve({ data: null })
            ]);

            return {
                ...sub,
                team_name: sub.teams.name,
                selected_case: sub.teams.selected_case,
                like_count: likesRes.count || 0,
                comment_count: commentsRes.count || 0,
                is_liked: !!myLikeRes.data
            };
        }));

        return NextResponse.json({ data: submissionsWithStats });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Gagal mengambil data galeri" },
            { status: 500 }
        );
    }
}
