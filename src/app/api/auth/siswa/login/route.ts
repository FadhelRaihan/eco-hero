import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siswaLoginSchema } from "@/lib/validations/auth";
import { generateToken, getTokenExpiry } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = siswaLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { full_name, class_id } = parsed.data;
    const supabase = createAdminClient();

    // ── Query 1 & 2 paralel: cek kelas + cari user sekaligus ──────────────
    const [kelasResult, userResult] = await Promise.all([
      supabase.from("classes").select("id, name").eq("id", class_id).single(),
      supabase.from("users").select("id").eq("full_name", full_name).eq("role", "siswa").single(),
    ]);

    if (kelasResult.error || !kelasResult.data) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const kelas = kelasResult.data;
    let studentId: string;

    if (userResult.data) {
      // User sudah ada — cek keanggotaan kelas
      studentId = userResult.data.id;

      const { data: existingMember } = await supabase
        .from("class_members")
        .select("student_id")
        .eq("class_id", class_id)
        .eq("student_id", studentId)
        .single();

      if (!existingMember) {
        // Daftarkan ke kelas baru + inisialisasi progress secara paralel
        await Promise.all([
          supabase.from("class_members").insert({
            class_id,
            student_id: studentId,
            team_role: "belum_pilih",
          }),
          supabase.from("mission_progress").insert([
            { student_id: studentId, class_id, mission_number: 1, status: "locked", pretest_status: "in_progress", posttest_status: "locked", mission1_step: 1 },
            { student_id: studentId, class_id, mission_number: 2, status: "locked", pretest_status: "locked", posttest_status: "locked" },
            { student_id: studentId, class_id, mission_number: 3, status: "locked", pretest_status: "locked", posttest_status: "locked" },
            { student_id: studentId, class_id, mission_number: 4, status: "locked", pretest_status: "locked", posttest_status: "locked" },
          ]),
        ]);
      }
    } else {
      // Siswa baru — buat akun
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({ full_name, role: "siswa" })
        .select("id")
        .single();

      if (userError || !newUser) {
        return NextResponse.json({ error: "Gagal membuat akun siswa" }, { status: 500 });
      }

      studentId = newUser.id;

      // class_members + mission_progress paralel
      await Promise.all([
        supabase.from("class_members").insert({
          class_id,
          student_id: studentId,
          team_role: "belum_pilih",
        }),
        supabase.from("mission_progress").insert([
          { student_id: studentId, class_id, mission_number: 1, status: "locked", pretest_status: "in_progress", posttest_status: "locked", mission1_step: 1 },
          { student_id: studentId, class_id, mission_number: 2, status: "locked", pretest_status: "locked", posttest_status: "locked" },
          { student_id: studentId, class_id, mission_number: 3, status: "locked", pretest_status: "locked", posttest_status: "locked" },
          { student_id: studentId, class_id, mission_number: 4, status: "locked", pretest_status: "locked", posttest_status: "locked" },
        ]),
      ]);
    }

    // ── Session: upsert (delete+insert menjadi 1 query) ───────────────────
    const token = generateToken();
    const expiredAt = getTokenExpiry(8);

    await supabase.from("student_sessions").upsert(
      { student_id: studentId, token, expired_at: expiredAt.toISOString() },
      { onConflict: "student_id" }
    );

    const sessionPayload = {
      id: studentId,
      full_name,
      role: "siswa",
      class_id,
      class_name: kelas.name,
    };

    const response = NextResponse.json({
      data: { user: sessionPayload },
      message: "Login berhasil",
    });

    const cookieOpts = {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      expires: expiredAt,
      path: "/",
    };

    response.cookies.set("siswa_token", token, { ...cookieOpts, httpOnly: true });
    response.cookies.set("siswa_session", JSON.stringify(sessionPayload), { ...cookieOpts, httpOnly: false });

    return response;
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}