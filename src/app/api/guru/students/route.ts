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

        // 1. Ambil semua kelas milik guru ini
        const { data: classes, error: classesError } = await supabase
            .from("classes")
            .select("id, name")
            .eq("teacher_id", teacherId);

        if (classesError) throw classesError;
        const classIds = classes.map(c => c.id);

        if (classIds.length === 0) {
            return NextResponse.json({ data: [] });
        }

        // 2. Ambil semua siswa di kelas-kelas tersebut
        const { data: members, error: membersError } = await supabase
            .from("class_members")
            .select(`
                student_id,
                team_role,
                class_id,
                classes (name),
                users (id, full_name)
            `)
            .in("class_id", classIds);

        if (membersError) throw membersError;

        // 3. Ambil semua tim di kelas-kelas tersebut
        const { data: teamsData } = await supabase
            .from("teams")
            .select("id, name, class_id, team_members(student_id)")
            .in("class_id", classIds);

        // 4. Ambil semua progress misi untuk siswa-siswa ini
        const { data: progressData } = await supabase
            .from("mission_progress")
            .select("*")
            .in("class_id", classIds);

        // 5. Gabungkan data
        const result = (members ?? []).map((member: any) => {
            const team = teamsData?.find(t => 
                t.class_id === member.class_id &&
                t.team_members.some((tm: any) => tm.student_id === member.student_id)
            );
            
            return {
                student_id: member.student_id,
                full_name: member.users?.full_name,
                team_role: member.team_role,
                class_id: member.class_id,
                class_name: member.classes?.name,
                team_id: team?.id,
                team_name: team?.name ?? "-",
                missions: (progressData ?? [])
                    .filter((p) => p.student_id === member.student_id)
                    .sort((a, b) => a.mission_number - b.mission_number),
            };
        });

        return NextResponse.json({ data: result });
    } catch (err: any) {
        console.error("Error fetching all students:", err);
        return NextResponse.json({ error: "Gagal mengambil data siswa" }, { status: 500 });
    }
}
