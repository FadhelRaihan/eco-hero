import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTokenExpired } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Cek siswa token
    const siswaToken = request.cookies.get("siswa_token")?.value;
    if (siswaToken) {
      const { data: session } = await supabase
        .from("student_sessions")
        .select("student_id, expired_at, users(id, full_name, role)")
        .eq("token", siswaToken)
        .single();

      if (session && !isTokenExpired(session.expired_at)) {
        return NextResponse.json({ data: session.users });
      }
    }

    // Cek guru token, cek di cookie
    const guruSession = request.cookies.get("guru_session")?.value;
    const guruToken = request.cookies.get("guru_token")?.value;
    if (guruSession && guruToken) {
      return NextResponse.json({ data: JSON.parse(guruSession) });
    }

    return NextResponse.json(
      { error: "Tidak terautentikasi" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}