import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

interface SupabaseClassRow {
    id: string;
    name: string;
    created_at: string;
    users: {
        full_name: string;
    } | null;
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("guru_session");

        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        if (session.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const supabase = createAdminClient();
        
        // Ambil kelas beserta nama guru
        const { data, error } = await supabase
            .from("classes")
            .select(`
                id,
                name,
                created_at,
                users (
                    full_name
                )
            `)
            .order("name", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Ambil statistik siswa dan tim secara manual karena keterbatasan query relasi bersarang di Supabase JS tanpa view
        const rawData = (data as unknown) as SupabaseClassRow[];
        
        const enrichedData = await Promise.all((rawData || []).map(async (c) => {
            const { count: studentCount } = await supabase
                .from("class_members")
                .select("*", { count: "exact", head: true })
                .eq("class_id", c.id);

            const { count: teamCount } = await supabase
                .from("teams")
                .select("*", { count: "exact", head: true })
                .eq("class_id", c.id);

            return {
                id: c.id,
                name: c.name,
                teacher_name: c.users?.full_name || "N/A",
                member_count: studentCount || 0,
                team_count: teamCount || 0,
                created_at: c.created_at
            };
        }));

        return NextResponse.json({ data: enrichedData });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
