import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { guruRegisterSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validasi input
        const parsed = guruRegisterSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { full_name, username, password, class_name } = parsed.data;
        const supabase = createAdminClient();

        // 1. Cek apakah username sudah ada
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: "Username sudah digunakan" },
                { status: 400 }
            );
        }

        // 2. Cek apakah nama kelas sudah ada
        const { data: existingClass } = await supabase
            .from("classes")
            .select("id")
            .eq("name", class_name)
            .single();

        if (existingClass) {
            return NextResponse.json(
                { error: "Kelas dengan nama tersebut sudah ada" },
                { status: 400 }
            );
        }

        // 3. Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // 4. Buat User (Guru)
        const { data: user, error: userError } = await supabase
            .from("users")
            .insert({
                full_name,
                username,
                password_hash,
                role: "guru"
            })
            .select()
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Gagal membuat akun guru" },
                { status: 500 }
            );
        }

        // 5. Buat Kelas dan hubungkan ke Guru
        const { error: classError } = await supabase
            .from("classes")
            .insert({
                name: class_name,
                teacher_id: user.id
            });

        if (classError) {
            // Rollback user if class creation fails (manual cleanup)
            await supabase.from("users").delete().eq("id", user.id);
            return NextResponse.json(
                { error: "Gagal membuat kelas" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Registrasi berhasil, silakan login",
            data: { username }
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
