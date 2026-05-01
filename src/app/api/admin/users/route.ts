import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

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

        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");

        const supabase = createAdminClient();
        let query = supabase
            .from("users")
            .select(`
                id, 
                full_name, 
                username, 
                role, 
                created_at,
                classes!teacher_id (id, name)
            `)
            .order("created_at", { ascending: false });

        if (role) {
            query = query.eq("role", role);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
