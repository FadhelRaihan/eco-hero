import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
    try {
        const { full_name, user_id } = await request.json();

        if (!user_id || !full_name) {
            return NextResponse.json({ error: "User ID dan Nama Lengkap diperlukan" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Update di tabel users (jika ada)
        const { error: userError } = await supabase
            .from("users")
            .update({ full_name })
            .eq("id", user_id);

        if (userError) throw userError;

        // Update di Auth Metadata
        const { error: authError } = await supabase.auth.admin.updateUserById(
            user_id,
            { user_metadata: { full_name } }
        );

        if (authError) throw authError;

        return NextResponse.json({ message: "Profil berhasil diperbarui" });
    } catch (err: any) {
        console.error("Profile Update Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
