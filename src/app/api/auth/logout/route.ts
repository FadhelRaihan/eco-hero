import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Hapus token siswa dari DB jika ada
    const siswaToken = request.cookies.get("siswa_token")?.value;
    if (siswaToken) {
      await supabase
        .from("student_sessions")
        .delete()
        .eq("token", siswaToken);
    }

    const response = NextResponse.json({ message: "Logout berhasil" });

    // Hapus semua cookies
    response.cookies.delete("siswa_token");
    response.cookies.delete("siswa_session");
    response.cookies.delete("guru_token");
    response.cookies.delete("guru_session");

    return response;
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}