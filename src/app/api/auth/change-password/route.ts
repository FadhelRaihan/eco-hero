import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { new_password, user_id } = await request.json();

        if (!new_password || new_password.length < 6) {
            return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
        }
        if (!user_id) {
            return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
        }

        const supabase = createAdminClient();
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(new_password, salt);
        
        const { error } = await supabase
            .from("users")
            .update({ password_hash })
            .eq("id", user_id);

        if (error) throw error;

        return NextResponse.json({ message: "Password berhasil diubah" });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
