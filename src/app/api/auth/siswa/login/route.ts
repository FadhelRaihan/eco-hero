import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siswaLoginSchema } from "@/lib/validations/auth";
import { generateToken, getTokenExpiry } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasi input
    const parsed = siswaLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { full_name, class_id } = parsed.data;
    const supabase = createAdminClient();

    // Validasi kelas
    const { data: kelas, error: kelasError } = await supabase
      .from("classes")
      .select("id, name")
      .eq("id", class_id)
      .single();

    if (kelasError || !kelas) {
      return NextResponse.json(
        { error: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cari user berdasarkan nama terlebih dahulu
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("full_name", full_name)
      .eq("role", "siswa")
      .single();

    let studentId: string;

    if (existingUser) {
      // User ditemukan — cek apakah sudah terdaftar di kelas ini
      const { data: existingMember } = await supabase
        .from("class_members")
        .select("student_id")
        .eq("class_id", class_id)
        .eq("student_id", existingUser.id)
        .single();

      if (existingMember) {
        // Sudah terdaftar di kelas ini — login langsung
        studentId = existingUser.id;
      } else {
        // User ada tapi belum di kelas ini — daftarkan ke kelas
        studentId = existingUser.id;
        await supabase.from("class_members").insert({
          class_id,
          student_id: studentId,
          team_role: "belum_pilih",
        });
        // Inisialisasi mission_progress untuk kelas baru ini
        await supabase.from("mission_progress").insert([
          { student_id: studentId, class_id, mission_number: 1, status: "locked", pretest_status: "in_progress", posttest_status: "locked", mission1_step: 1 },
          { student_id: studentId, class_id, mission_number: 2, status: "locked", pretest_status: "locked", posttest_status: "locked" },
          { student_id: studentId, class_id, mission_number: 3, status: "locked", pretest_status: "locked", posttest_status: "locked" },
          { student_id: studentId, class_id, mission_number: 4, status: "locked", pretest_status: "locked", posttest_status: "locked" },
        ]);
      }
    } else {
      // Siswa baru — buat akun baru
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({ full_name, role: "siswa" })
        .select("id")
        .single();

      if (userError || !newUser) {
        return NextResponse.json(
          { error: "Gagal membuat akun siswa" },
          { status: 500 }
        );
      }

      studentId = newUser.id;

      await supabase.from("class_members").insert({
        class_id,
        student_id: studentId,
        team_role: "belum_pilih",
      });

      // Inisialisasi mission_progress untuk semua 4 misi
      // Misi 1 locked sampai Pre-test selesai
      await supabase.from("mission_progress").insert([
        { student_id: studentId, class_id, mission_number: 1, status: "locked", pretest_status: "in_progress", posttest_status: "locked", mission1_step: 1 },
        { student_id: studentId, class_id, mission_number: 2, status: "locked", pretest_status: "locked", posttest_status: "locked" },
        { student_id: studentId, class_id, mission_number: 3, status: "locked", pretest_status: "locked", posttest_status: "locked" },
        { student_id: studentId, class_id, mission_number: 4, status: "locked", pretest_status: "locked", posttest_status: "locked" },
      ]);
    }

    // Hapus token lama jika ada
    await supabase
      .from("student_sessions")
      .delete()
      .eq("student_id", studentId);

    // Buat token baru
    const token = generateToken();
    const expiredAt = getTokenExpiry(8);

    await supabase.from("student_sessions").insert({
      student_id: studentId,
      token,
      expired_at: expiredAt.toISOString(),
    });

    const response = NextResponse.json({
      data: {
        user: {
          id: studentId,
          full_name,
          role: "siswa",
          class_id,
          class_name: kelas.name,
        },
      },
      message: "Login berhasil",
    });

    response.cookies.set("siswa_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiredAt,
      path: "/",
    });

    response.cookies.set(
      "siswa_session",
      JSON.stringify({
        id: studentId,
        full_name,
        role: "siswa",
        class_id,
        class_name: kelas.name,
      }),
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