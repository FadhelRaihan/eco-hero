import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacher_id");

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Dapatkan Class ID dari teacher_id
        const { data: classData, error: classError } = await supabase
            .from("classes")
            .select("id")
            .eq("teacher_id", teacherId)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ data: [] });
        }
        
        const classId = classData.id;

        // 2. Query Submissions untuk kelas tersebut
        const { data: submissions, error: subError } = await supabase
            .from("mission4_submissions")
            .select(`
                id,
                team_id,
                cloudinary_url,
                media_type,
                caption,
                uploaded_at,
                teams!inner (
                    id,
                    name,
                    selected_case,
                    class_id
                )
            `)
            .eq("teams.class_id", classId)
            .order("uploaded_at", { ascending: false });

        if (subError) throw subError;
        if (!submissions || submissions.length === 0) {
            return NextResponse.json({ data: [], classId }, {
                headers: { "Cache-Control": "private, max-age=20, stale-while-revalidate=40" }
            });
        }

        const subIds = submissions.map((s) => s.id);

        // 3. Aggregate likes & comments
        const [likesRes, commentsRes] = await Promise.all([
            supabase
                .from("mission4_gallery_likes")
                .select("submission_id")
                .in("submission_id", subIds),

            supabase
                .from("mission4_gallery_comments")
                .select("submission_id")
                .in("submission_id", subIds)
        ]);

        const likeCountMap: Record<string, number> = {};
        const commentCountMap: Record<string, number> = {};

        for (const row of likesRes.data ?? []) {
            likeCountMap[row.submission_id] = (likeCountMap[row.submission_id] ?? 0) + 1;
        }
        for (const row of commentsRes.data ?? []) {
            commentCountMap[row.submission_id] = (commentCountMap[row.submission_id] ?? 0) + 1;
        }

        // 4. Mapping response
        const result = submissions.map((sub) => {
            // Tangani perbedaan tipe (array atau object) dari hasil join Supabase
            const team = Array.isArray(sub.teams) ? sub.teams[0] : (sub.teams as unknown as { name: string; selected_case: string; });
            return {
                id: sub.id,
                team_id: sub.team_id,
                team_name: team?.name || "Tanpa Nama",
                selected_case: team?.selected_case || "Belum ada",
                cloudinary_url: sub.cloudinary_url,
                media_type: sub.media_type,
                caption: sub.caption,
                uploaded_at: sub.uploaded_at,
                like_count: likeCountMap[sub.id] ?? 0,
                comment_count: commentCountMap[sub.id] ?? 0,
                is_liked: false, // Guru hanya melihat stat
            };
        });

        return NextResponse.json({ data: result, classId }, {
            headers: {
                "Cache-Control": "private, max-age=20, stale-while-revalidate=40",
            },
        });
    } catch (err) {
        return NextResponse.json(
            { error: (err as Error).message || "Gagal mengambil data galeri" },
            { status: 500 }
        );
    }
}
