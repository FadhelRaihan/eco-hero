import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ClassMemberRow {
    student_id: string;
    team_role: string;
    class_id: string;
    classes: { name: string } | null;
    users: { id: string, full_name: string } | null;
}

interface TeamRow {
    id: string;
    name: string;
    class_id: string;
    team_members: { student_id: string }[];
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get("teacher_id");

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Ambil semua kelas milik guru ini
        const { data: classes, error: classesError } = await supabase
            .from("classes")
            .select("id, name")
            .eq("teacher_id", teacherId);

        if (classesError) throw classesError;
        const classIds = classes.map(c => c.id);

        if (classIds.length === 0) {
            return NextResponse.json({ data: [] });
        }

        // 2. Ambil semua siswa di kelas-kelas tersebut
        const { data: members, error: membersError } = await supabase
            .from("class_members")
            .select(`
                student_id,
                team_role,
                class_id,
                classes (name),
                users (id, full_name)
            `)
            .in("class_id", classIds);

        if (membersError) throw membersError;

        // 3. Ambil semua tim di kelas-kelas tersebut
        const { data: teamsData } = await supabase
            .from("teams")
            .select("id, name, class_id, team_members(student_id)")
            .in("class_id", classIds) as { data: TeamRow[] | null };

        // 4. Ambil semua progress misi untuk siswa-siswa ini
        const { data: progressData } = await supabase
            .from("mission_progress")
            .select("*")
            .in("class_id", classIds);

        // 5. Gabungkan data
        const typedMembers = (members as unknown as ClassMemberRow[]) ?? [];
        const result = typedMembers.map((member) => {
            const team = teamsData?.find(t => 
                t.class_id === member.class_id &&
                t.team_members.some((tm) => tm.student_id === member.student_id)
            );
            
            return {
                student_id: member.student_id,
                full_name: member.users?.full_name,
                team_role: member.team_role,
                class_id: member.class_id,
                class_name: member.classes?.name,
                team_id: team?.id,
                team_name: team?.name ?? "-",
                missions: (progressData ?? [])
                    .filter((p) => p.student_id === member.student_id)
                    .sort((a, b) => a.mission_number - b.mission_number),
            };
        });

        return NextResponse.json({ data: result });
    } catch (err) {
        console.error("Error fetching all students:", err);
        return NextResponse.json({ error: "Gagal mengambil data siswa" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { full_name, teacher_id } = body;

        if (!full_name || !teacher_id) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Dapatkan Class ID dari teacher_id
        const { data: classData, error: classError } = await supabase
            .from("classes")
            .select("id")
            .eq("teacher_id", teacher_id)
            .single();

        if (classError || !classData) {
            return NextResponse.json({ error: "Guru tidak memiliki kelas" }, { status: 404 });
        }

        // 2. Buat Username otomatis (misal: siswa_timestamp)
        const autoUsername = `siswa_${new Date().getTime()}`;

        // 3. Buat User (Siswa) - Tanpa Password & Username Manual
        const { data: user, error: userError } = await supabase
            .from("users")
            .insert({
                full_name,
                username: autoUsername,
                password_hash: "", // Siswa tidak menggunakan password
                role: "siswa"
            })
            .select()
            .single();

        if (userError || !user) throw userError;

        // 4. Masukkan ke Class Members
        const { error: memberError } = await supabase
            .from("class_members")
            .insert({
                student_id: user.id,
                class_id: classData.id,
                team_role: "belum_pilih"
            });

        if (memberError) throw memberError;

        // 5. Inisialisasi Mission Progress
        const missions = [
            { student_id: user.id, class_id: classData.id, mission_number: 1, status: "locked", pretest_status: "in_progress", posttest_status: "locked", badge_earned: false, mission1_step: 1 },
            { student_id: user.id, class_id: classData.id, mission_number: 2, status: "locked", pretest_status: "locked", posttest_status: "locked", badge_earned: false },
            { student_id: user.id, class_id: classData.id, mission_number: 3, status: "locked", pretest_status: "locked", posttest_status: "locked", badge_earned: false },
            { student_id: user.id, class_id: classData.id, mission_number: 4, status: "locked", pretest_status: "locked", posttest_status: "locked", badge_earned: false }
        ];

        await supabase.from("mission_progress").insert(missions);

        return NextResponse.json({ message: "Siswa berhasil ditambahkan", data: user });
    } catch (err) {
        console.error("Error adding student:", err);
        return NextResponse.json({ error: "Gagal menambahkan siswa" }, { status: 500 });
    }
}
