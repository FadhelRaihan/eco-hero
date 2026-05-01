import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// UPDATE CLASS
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { name, teacher_id } = await req.json();
        const { classId } = await params;
        const supabase = createAdminClient();

        // Cek apakah guru ini sudah mengampu kelas LAIN
        if (teacher_id) {
            const { data: existingClass } = await supabase
                .from("classes")
                .select("id, name")
                .eq("teacher_id", teacher_id)
                .neq("id", classId) // Kecuali kelas yang sedang diedit ini
                .single();

            if (existingClass) {
                return NextResponse.json({ 
                    error: `Guru ini sudah mengampu kelas "${existingClass.name}". Satu guru hanya boleh mengampu satu kelas.` 
                }, { status: 400 });
            }
        }

        const { error } = await supabase
            .from("classes")
            .update({
                name,
                teacher_id: teacher_id || null
            })
            .eq("id", classId);

        if (error) throw error;

        return NextResponse.json({ message: "Kelas berhasil diperbarui" });
    } catch (error) {
        console.error("Update class error:", error);
        return NextResponse.json({ error: (error as Error).message || "Gagal memperbarui kelas" }, { status: 500 });
    }
}

// DELETE CLASS
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const { classId } = await params;

        const { error } = await createAdminClient()
            .from("classes")
            .delete()
            .eq("id", classId);

        if (error) throw error;

        return NextResponse.json({ message: "Kelas berhasil dihapus" });
    } catch (error) {
        console.error("Delete class error:", error);
        return NextResponse.json({ error: (error as Error).message || "Gagal menghapus kelas" }, { status: 500 });
    }
}
