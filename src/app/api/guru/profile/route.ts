import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");
        if (!userId) {
            return NextResponse.json({ error: "Data pengguna tidak ditemukan" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("users")
            .select("full_name, username")
            .eq("id", userId)
            .single();

        if (error) throw error;
        return NextResponse.json({ data });
    } catch (err) {
        console.error("Profile Fetch Error:", err);
        return NextResponse.json({ error: "Gagal mengambil profil" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { full_name, username, user_id } = await request.json();

        if (!user_id || !full_name || !username) {
            return NextResponse.json({ error: "Data profil tidak lengkap" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Cek apakah username baru sudah digunakan oleh user lain
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .neq("id", user_id)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            throw checkError;
        }

        if (existingUser) {
            return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
        }

        // 2. Update di tabel users
        const { error: userError } = await supabase
            .from("users")
            .update({ full_name, username })
            .eq("id", user_id);

        if (userError) throw userError;

        return NextResponse.json({ message: "Profil berhasil diperbarui" });
    } catch (err) {
        console.error("Profile Update Error:", err);
        return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
    }
}
