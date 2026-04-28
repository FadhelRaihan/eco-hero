import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacher_id");

        let query = supabase
            .from("classes")
            .select(`
                id,
                name,
                teacher_id,
                class_members(count),
                teams(count)
            `)
            .order("name");

        if (teacherId) {
            query = query.eq("teacher_id", teacherId);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Normalisasi count dari array [{count: N}] → N
        const normalized = (data ?? []).map((kelas: any) => ({
            id: kelas.id,
            name: kelas.name,
            teacher_id: kelas.teacher_id,
            member_count: kelas.class_members?.[0]?.count ?? 0,
            team_count: kelas.teams?.[0]?.count ?? 0,
        }));

        return NextResponse.json({ data: normalized }, {
            headers: {
                "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
            },
        });
    } catch {
        return NextResponse.json({ error: "Gagal mengambil daftar kelas" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, teacher_id } = body;

        if (!name || !teacher_id) {
            return NextResponse.json({ error: "Nama kelas dan teacher_id wajib diisi" }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("classes")
            .insert({ name, teacher_id })
            .select("id, name")
            .single();

        if (error) throw error;

        return NextResponse.json({ data, message: "Kelas berhasil dibuat" }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Gagal membuat kelas" }, { status: 500 });
    }
}