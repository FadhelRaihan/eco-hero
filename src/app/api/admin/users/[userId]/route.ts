import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// UPDATE USER
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { full_name, username, role } = await req.json();
        const { userId } = await params;

        const { error } = await createAdminClient()
            .from("users")
            .update({
                full_name,
                username,
                role
            })
            .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ message: "User berhasil diperbarui" });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: (error as Error).message || "Gagal memperbarui user" }, { status: 500 });
    }
}

// DELETE USER
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        const { error } = await createAdminClient()
            .from("users")
            .delete()
            .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ message: "User berhasil dihapus" });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: (error as Error).message || "Gagal menghapus user" }, { status: 500 });
    }
}
