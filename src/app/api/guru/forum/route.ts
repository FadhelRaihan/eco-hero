import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacher_id");
        const topic = searchParams.get("topic");

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

        // 2. Query Forum Posts untuk kelas tersebut
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

        return NextResponse.json({ data, classId });
    } catch (error) {
        console.error("GET /api/guru/forum error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Gagal mengambil data forum" },
            { status: 500 }
        );
    }
}
