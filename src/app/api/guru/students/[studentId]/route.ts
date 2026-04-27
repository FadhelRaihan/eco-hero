import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params;
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get("class_id");

        if (!classId) {
            return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Hapus dari class_members
        const { error: memberError } = await supabase
            .from("class_members")
            .delete()
            .eq("student_id", studentId)
            .eq("class_id", classId);

        if (memberError) throw memberError;

        // 2. Hapus progress misi di kelas tersebut
        await supabase
            .from("mission_progress")
            .delete()
            .eq("student_id", studentId)
            .eq("class_id", classId);

        // 3. Hapus dari team_members (jika ada tim di kelas tersebut)
        const { data: teams } = await supabase
            .from("teams")
            .select("id")
            .eq("class_id", classId);
        
        if (teams && teams.length > 0) {
            const teamIds = teams.map(t => t.id);
            await supabase
                .from("team_members")
                .delete()
                .eq("student_id", studentId)
                .in("team_id", teamIds);
        }

        return NextResponse.json({ message: "Siswa berhasil dihapus dari kelas" });
    } catch (err: any) {
        console.error("Error deleting student:", err);
        return NextResponse.json({ error: "Gagal menghapus siswa" }, { status: 500 });
    }
}
