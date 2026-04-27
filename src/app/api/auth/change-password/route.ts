import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { new_password } = await request.json();

        if (!new_password || new_password.length < 6) {
            return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
        }

        const supabase = await createClient();
        
        const { error } = await supabase.auth.updateUser({
            password: new_password
        });

        if (error) throw error;

        return NextResponse.json({ message: "Password berhasil diubah" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
