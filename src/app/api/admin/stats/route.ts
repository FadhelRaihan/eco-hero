import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    try {
        // Ambil total user
        const { count: userCount, error: userError } = await createAdminClient()
            .from("users")
            .select("*", { count: "exact", head: true });

        if (userError) throw userError;

        // Ambil total kelas
        const { count: classCount, error: classError } = await createAdminClient()
            .from("classes")
            .select("*", { count: "exact", head: true });

        if (classError) throw classError;

        // Ambil total instrumen tes (pretest + posttest)
        const { count: testCount, error: testError } = await createAdminClient()
            .from("tests")
            .select("*", { count: "exact", head: true });

        if (testError) throw testError;

        return NextResponse.json({
            data: {
                totalUsers: userCount || 0,
                totalClasses: classCount || 0,
                totalTests: testCount || 0
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Gagal mengambil statistik admin" }, { status: 500 });
    }
}
