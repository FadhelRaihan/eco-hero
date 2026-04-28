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

        // ── Query 1: Submissions + team info ─────────────────────────────────
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
            return NextResponse.json({ data: [] }, {
                headers: { "Cache-Control": "private, max-age=20, stale-while-revalidate=40" },
            });
        }

        const subIds = submissions.map((s) => s.id);

        // ── Query 2 & 3: Aggregate likes + comments in bulk ──────────────────
        // Ambil semua likes sekaligus, bukan per submission
        const [likesRes, commentsRes, myLikesRes] = await Promise.all([
            supabase
                .from("mission4_gallery_likes")
                .select("submission_id")
                .in("submission_id", subIds),

            supabase
                .from("mission4_gallery_comments")
                .select("submission_id")
                .in("submission_id", subIds),

            studentId
                ? supabase
                      .from("mission4_gallery_likes")
                      .select("submission_id")
                      .in("submission_id", subIds)
                      .eq("student_id", studentId)
                : Promise.resolve({ data: [] as { submission_id: string }[] }),
        ]);

        // ── Hitung count di memory (O(n), jauh lebih murah dari N round-trips) ─
        const likeCountMap: Record<string, number> = {};
        const commentCountMap: Record<string, number> = {};
        const myLikedSet = new Set<string>();

        for (const row of likesRes.data ?? []) {
            likeCountMap[row.submission_id] = (likeCountMap[row.submission_id] ?? 0) + 1;
        }
        for (const row of commentsRes.data ?? []) {
            commentCountMap[row.submission_id] = (commentCountMap[row.submission_id] ?? 0) + 1;
        }
        for (const row of (myLikesRes as any).data ?? []) {
            myLikedSet.add(row.submission_id);
        }

        // ── Gabungkan ─────────────────────────────────────────────────────────
        const result = submissions.map((sub: any) => ({
            id: sub.id,
            team_id: sub.team_id,
            team_name: sub.teams.name,
            selected_case: sub.teams.selected_case,
            cloudinary_url: sub.cloudinary_url,
            media_type: sub.media_type,
            caption: sub.caption,
            uploaded_at: sub.uploaded_at,
            like_count: likeCountMap[sub.id] ?? 0,
            comment_count: commentCountMap[sub.id] ?? 0,
            is_liked: myLikedSet.has(sub.id),
        }));

        return NextResponse.json({ data: result }, {
            headers: {
                // is_liked bersifat user-specific → private (tidak di-cache edge)
                // 20s cache di browser cukup untuk mengurangi refetch saat navigasi
                "Cache-Control": "private, max-age=20, stale-while-revalidate=40",
            },
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Gagal mengambil data galeri" },
            { status: 500 }
        );
    }
}
