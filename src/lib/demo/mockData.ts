/**
 * ============================================================
 *  ECO-HERO DEMO MODE — MOCK DATA
 *  Semua data di file ini adalah data statis untuk keperluan demo.
 *  Tidak ada koneksi ke database sama sekali.
 *
 *  Prinsip Demo:
 *  - Semua misi terbuka dan bisa dijelajahi
 *  - Semua form sudah terisi → user tinggal klik "Lanjut"
 *  - Tidak ada data yang tersimpan ke database
 * ============================================================
 */

import type { BrainstormingData, TeamData } from "@/hooks/useMission2";
import type { CaseTopic } from "@/lib/mission-data";

// ─── DEMO USER ────────────────────────────────────────────────
export const DEMO_USER = {
    id: "demo-student-001",
    full_name: "Andi Pratama",
    role: "siswa" as const,
    class_id: "demo-class-001",
    class_name: "Kelas 5A (Demo)",
    email: "demo@ecohero.id",
};

// ─── DEMO DASHBOARD ───────────────────────────────────────────
// Semua misi completed agar flow terlihat utuh; posttestStatus completed → card Sertifikat muncul
export const DEMO_DASHBOARD = {
    student: DEMO_USER,
    missions: [
        { mission_number: 1, status: "completed", badge_earned: true, pretest_status: "completed" },
        { mission_number: 2, status: "completed", badge_earned: true },
        { mission_number: 3, status: "completed", badge_earned: true },
        { mission_number: 4, status: "completed", badge_earned: true, posttest_status: "completed" },
    ],
    pretest_status: "completed",
    posttest_status: "completed",
    badges: [],
};


// ─── DEMO MISSION 1 ───────────────────────────────────────────
// Semua step sudah terisi → user tinggal klik "Lanjut"
export const DEMO_MISSION1 = {
    currentStep: 1 as 1 | 2 | 3 | 4,
    selectedLocation: "sampah" as CaseTopic,       // lokasi sudah terpilih
    videoWatched: true,                              // video sudah ditonton
    questionAnswered: true,                          // pertanyaan sudah dijawab
    questionAnswer: "Sampah plastik yang menumpuk di sungai dan selokan menyebabkan banjir, merusak ekosistem air, dan mematikan habitat ikan. Selain itu, mikroplastik masuk ke rantai makanan dan membahayakan kesehatan manusia.",
    hasPosted: false,                                // bisa coba kirim post
    posts: [
        {
            id: "post-demo-1",
            student_id: "demo-student-002",
            case_topic: "sampah" as CaseTopic,
            perspective_env: "Sampah plastik yang menumpuk di sungai menyebabkan banjir dan mematikan ekosistem air.",
            perspective_soc: "Warga sekitar kesulitan mencari ikan karena sungai tercemar, pendapatan nelayan turun drastis.",
            users: { id: "demo-student-002", full_name: "Budi Santoso" },
            mission1_forum_comments: [{ count: 3 }],
            created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: "post-demo-2",
            student_id: "demo-student-003",
            case_topic: "kendaraan" as CaseTopic,
            perspective_env: "Polusi udara dari kendaraan berbahan bakar fosil meningkatkan suhu kota dan merusak lapisan ozon.",
            perspective_soc: "Biaya kesehatan warga meningkat akibat penyakit pernapasan yang disebabkan polusi kendaraan.",
            users: { id: "demo-student-003", full_name: "Citra Dewi" },
            mission1_forum_comments: [{ count: 1 }],
            created_at: new Date(Date.now() - 7200000).toISOString(),
        },
    ],
    submitting: false,
    loadingPosts: false,
};

// ─── DEMO MISSION 2 ───────────────────────────────────────────
export const DEMO_TEAM: TeamData = {
    id: "demo-team-001",
    name: "Tim Hijau Bersama",
    selected_case: "sampah" as CaseTopic,
    leader_id: "demo-student-001",
    users: { id: "demo-student-001", full_name: "Andi Pratama" },
    team_members: [
        { student_id: "demo-student-001", users: { id: "demo-student-001", full_name: "Andi Pratama" } },
        { student_id: "demo-student-002", users: { id: "demo-student-002", full_name: "Budi Santoso" } },
        { student_id: "demo-student-003", users: { id: "demo-student-003", full_name: "Citra Dewi" } },
    ],
};

export const DEMO_BRAINSTORMING: BrainstormingData = {
    env_problem: "Sampah plastik mencemari selokan dan sungai, susah terurai, merusak ekosistem air.",
    social_problem: "Pedagang kecil sulit mengganti wadah karena biaya pengganti lebih mahal.",
    solution: "Subsidi kantong ramah lingkungan bagi pedagang kecil dan edukasi warga tentang daur ulang.",
    solution_reason: "Solusi ini menguntungkan lingkungan sekaligus tidak membebani ekonomi pedagang kecil.",
    action_type: "Kampanye Edukasi & Subsidi",
    action_name: "Gerakan Plastik Nol — GPN",
    materials: "Kantong daur ulang, brosur edukasi, spanduk sosialisasi",
    target_audience: "Pedagang pasar tradisional dan warga sekitar",
};

export const DEMO_MISSION2 = {
    // Step 2 = halaman "Kelola Tim", tim sudah terbentuk, user tinggal klik Lanjut
    currentStep: 2 as 1 | 2 | 3,
    teamRole: "ketua" as "ketua" | "anggota" | "belum_pilih",
    myTeam: DEMO_TEAM,
    myTeamMembers: DEMO_TEAM.team_members,
    availableStudents: [
        {
            student_id: "demo-student-004",
            team_role: "belum_pilih" as "ketua" | "anggota" | "belum_pilih",
            users: { id: "demo-student-004", full_name: "Dian Pertiwi" },
        },
        {
            student_id: "demo-student-005",
            team_role: "belum_pilih" as "ketua" | "anggota" | "belum_pilih",
            users: { id: "demo-student-005", full_name: "Eko Saputra" },
        },
    ],
    allTeams: [DEMO_TEAM],
    // Brainstorming sudah pre-filled → form langsung terisi
    brainstorming: DEMO_BRAINSTORMING,
    loading: false,
};

// ─── DEMO MISSION 3 ───────────────────────────────────────────
export const DEMO_MISSION3 = {
    teamRole: "ketua" as "ketua" | "anggota" | "belum_pilih",
    myTeam: DEMO_TEAM,
    schedule: {
        id: "demo-schedule-001",
        team_id: "demo-team-001",
        submitted: false,
        created_at: new Date().toISOString(),
    },
    tasks: [
        {
            id: "task-001",
            team_id: "demo-team-001",
            title: "Buat desain brosur edukasi",
            scheduled_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
            assigned_to: "demo-student-002",
            status: "selesai" as "selesai" | "berjalan" | "tunda",
            user: { id: "demo-student-002", full_name: "Budi Santoso" },
        },
        {
            id: "task-002",
            team_id: "demo-team-001",
            title: "Survei pedagang pasar",
            scheduled_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
            assigned_to: "demo-student-003",
            status: "berjalan" as "selesai" | "berjalan" | "tunda",
            user: { id: "demo-student-003", full_name: "Citra Dewi" },
        },
        {
            id: "task-003",
            team_id: "demo-team-001",
            title: "Presentasi solusi ke warga",
            scheduled_date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
            assigned_to: "demo-student-001",
            status: "berjalan" as "selesai" | "berjalan" | "tunda",
            user: { id: "demo-student-001", full_name: "Andi Pratama" },
        },
    ],
    loading: false,
};

// ─── DEMO MISSION 4 ───────────────────────────────────────────
export const DEMO_MISSION4 = {
    teamRole: "ketua" as "ketua" | "anggota" | "belum_pilih",
    myTeam: DEMO_TEAM,
    // Kosong: user harus upload file sendiri (upload ke Cloudinary, tidak ke DB)
    submissions: [] as any[],
    // Reflection kosong: user harus isi sendiri
    reflection: null,
    loading: false,
};

// ─── DEMO TEST ────────────────────────────────────────────────
export const DEMO_TEST_QUESTIONS = [
    {
        id: "q-demo-001",
        question_text: "Apa dampak utama sampah plastik terhadap ekosistem sungai?",
        options: [
            "Meningkatkan kadar oksigen dalam air",
            "Merusak habitat ikan dan makhluk air lainnya",
            "Membuat air sungai lebih jernih",
            "Tidak berpengaruh apapun terhadap ekosistem",
        ],
        correct_answer: 1,
    },
    {
        id: "q-demo-002",
        question_text: "Apa yang dimaksud dengan solusi 'jalan tengah' dalam penyelesaian masalah lingkungan?",
        options: [
            "Solusi yang hanya menguntungkan lingkungan",
            "Solusi yang hanya menguntungkan ekonomi",
            "Solusi yang mempertimbangkan kepentingan semua pihak secara adil",
            "Solusi yang paling murah biayanya",
        ],
        correct_answer: 2,
    },
    {
        id: "q-demo-003",
        question_text: "Manakah contoh aksi nyata yang paling efektif untuk mengurangi polusi plastik?",
        options: [
            "Membuang sampah di sungai yang jauh dari pemukiman",
            "Mengganti plastik sekali pakai dengan tas daur ulang dan melakukan edukasi warga",
            "Menumpuk sampah di tempat pembuangan liar",
            "Membakar sampah plastik di lahan kosong",
        ],
        correct_answer: 1,
    },
];
