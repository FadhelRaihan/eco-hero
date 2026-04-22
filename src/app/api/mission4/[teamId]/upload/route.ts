import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const body = await request.json();
        const { files } = body; // Expecting { cloudinary_url, media_type, caption }[]
        
        const supabase = createAdminClient();

        // 1. Delete existing submissions for this team to "overwrite" the set
        await supabase
            .from("mission4_submissions")
            .delete()
            .eq("team_id", teamId);

        // 2. Bulk insert new submissions
        const toInsert = files.map((f: any) => ({
            team_id: teamId,
            cloudinary_url: f.cloudinary_url,
            media_type: f.media_type,
            caption: f.caption || ""
        }));

        const { data, error } = await supabase
            .from("mission4_submissions")
            .insert(toInsert)
            .select();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Gagal menggunggah dokumentasi" },
            { status: 500 }
        );
    }
}
