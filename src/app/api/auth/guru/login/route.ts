import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin"
import { guruLoginSchema } from "@/lib/validations/auth";
import { generateToken, getTokenExpiry } from "@/lib/utils";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validasi input
        const parsed = guruLoginSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            )
        }

        const { username, password } = parsed.data;
        const supabase = createAdminClient();

        // Cari guru atau admin berdasarkan username
        const { data: user, error } = await supabase
            .from("users")
            .select("id, full_name, username, role, password_hash")
            .eq("username", username)
            .in("role", ["guru", "admin"])
            .single();

        if (error || !user) {
            return NextResponse.json(
                { error: "Username atau password salah" },
                { status: 401 }
            );
        }

        // Verifikasi password
        const isValid = await bcrypt.compare(password, user.password_hash!);
        if (!isValid) {
            return NextResponse.json(
                { error: "password salah" },
                { status: 401 }
            );
        }

        // Generate token guru, simpan di cookie httpOnly
        const token = generateToken();
        const expiredAt = getTokenExpiry(8);

        const response = NextResponse.json({
            data: {
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    role: user.role,
                },
            },
            message: "Login berhasil",
        });

        // Set cookie httpOnly
        response.cookies.set("guru_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: expiredAt,
            path: "/",
        });

        // Simpan token & data session di cookie terpisah untuk middleware
        response.cookies.set(
            "guru_session",
            JSON.stringify({ id: user.id, full_name: user.full_name, username: user.username, role: user.role }),
            {
                httpOnly: false, 
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                expires: expiredAt,
                path: "/",
            }
        );

        return response;
    } catch {
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}