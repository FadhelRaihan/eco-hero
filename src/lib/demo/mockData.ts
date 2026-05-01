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
import { TestSubmission } from "@/types/database";

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
    submissions: [] as TestSubmission[],
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

// ─── DEMO GURU (TEACHER DASHBOARD) ────────────────────────────
export const DEMO_GURU_USER = {
    id: "demo-guru-001",
    full_name: "Bapak/Ibu Guru (Demo)",
    role: "guru" as const,
    email: "guru-demo@ecohero.id",
};

export const DEMO_GURU_CLASS = {
    id: "demo-class-001",
    name: "Kelas 5A (Demo)",
    teacher_id: "demo-guru-001",
    member_count: 32,
    team_count: 8,
};

export const DEMO_GURU_STATS = {
    completed_missions: 114,
};

export const DEMO_GURU_STUDENTS = [
    {
        student_id: "demo-student-001",
        full_name: "Andi Pratama",
        team_role: "Leader",
        class_id: "demo-class-001",
        class_name: "Kelas 5A (Demo)",
        team_id: "demo-team-001",
        team_name: "Penyelamat Bumi",
        missions: [
            { mission_number: 1, status: "completed", badge_earned: true },
            { mission_number: 2, status: "completed", badge_earned: true },
            { mission_number: 3, status: "in_progress", badge_earned: false },
            { mission_number: 4, status: "locked", badge_earned: false },
        ]
    },
    {
        student_id: "demo-student-002",
        full_name: "Budi Santoso",
        team_role: "Member",
        class_id: "demo-class-001",
        class_name: "Kelas 5A (Demo)",
        team_id: "demo-team-001",
        team_name: "Penyelamat Bumi",
        missions: [
            { mission_number: 1, status: "completed", badge_earned: true },
            { mission_number: 2, status: "completed", badge_earned: true },
            { mission_number: 3, status: "in_progress", badge_earned: false },
            { mission_number: 4, status: "locked", badge_earned: false },
        ]
    },
    {
        student_id: "demo-student-003",
        full_name: "Citra Dewi",
        team_role: "Member",
        class_id: "demo-class-001",
        class_name: "Kelas 5A (Demo)",
        team_id: "demo-team-002",
        team_name: "Pasukan Hijau",
        missions: [
            { mission_number: 1, status: "completed", badge_earned: true },
            { mission_number: 2, status: "in_progress", badge_earned: false },
            { mission_number: 3, status: "locked", badge_earned: false },
            { mission_number: 4, status: "locked", badge_earned: false },
        ]
    },
    {
        student_id: "demo-student-004",
        full_name: "Dian Pertiwi",
        team_role: "Leader",
        class_id: "demo-class-001",
        class_name: "Kelas 5A (Demo)",
        team_id: "demo-team-002",
        team_name: "Pasukan Hijau",
        missions: [
            { mission_number: 1, status: "completed", badge_earned: true },
            { mission_number: 2, status: "in_progress", badge_earned: false },
            { mission_number: 3, status: "locked", badge_earned: false },
            { mission_number: 4, status: "locked", badge_earned: false },
        ]
    }
];

export const DEMO_GURU_TEAMS = [
    {
        id: "demo-team-001",
        name: "Penyelamat Bumi",
        selected_case: "sampah",
        member_count: 2,
        members: [
            { full_name: "Andi Pratama", role: "Leader" },
            { full_name: "Budi Santoso", role: "Member" }
        ]
    },
    {
        id: "demo-team-002",
        name: "Pasukan Hijau",
        selected_case: "kendaraan",
        member_count: 2,
        members: [
            { full_name: "Dian Pertiwi", role: "Leader" },
            { full_name: "Citra Dewi", role: "Member" }
        ]
    }
];

export const DEMO_GURU_FORUM = [
    {
        id: "post-demo-1",
        student_id: "demo-student-002",
        case_topic: "sampah",
        perspective_env: "Sampah plastik yang menumpuk di sungai menyebabkan banjir dan mematikan ekosistem air.",
        perspective_soc: "Warga sekitar kesulitan mencari ikan karena sungai tercemar, pendapatan nelayan turun drastis.",
        users: { id: "demo-student-002", full_name: "Budi Santoso" },
        created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: "post-demo-2",
        student_id: "demo-student-003",
        case_topic: "kendaraan",
        perspective_env: "Polusi udara dari kendaraan berbahan bakar fosil meningkatkan suhu kota dan merusak lapisan ozon.",
        perspective_soc: "Biaya kesehatan warga meningkat akibat penyakit pernapasan yang disebabkan polusi kendaraan.",
        users: { id: "demo-student-003", full_name: "Citra Dewi" },
        created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: "post-demo-3",
        student_id: "demo-student-004",
        case_topic: "sampah",
        perspective_env: "Banyak sampah organik yang sebenarnya bisa dijadikan kompos alih-alih dibuang.",
        perspective_soc: "Masyarakat bisa menjual kompos tersebut untuk tambahan kas RT.",
        users: { id: "demo-student-004", full_name: "Dian Pertiwi" },
        created_at: new Date(Date.now() - 14400000).toISOString(),
    }
];

export const DEMO_GURU_GALLERY = [
    {
        id: "gallery-demo-1",
        team_id: "demo-team-001",
        team_name: "Tim Hijau Bersama",
        selected_case: "sampah",
        cloudinary_url: "/assets/komik_1/Sampah1.png",
        media_type: "foto",
        caption: "Aksi bersih-bersih sungai Cikapundung! Kami berhasil mengumpulkan 15 kantong besar sampah plastik.",
        uploaded_at: new Date(Date.now() - 86400000).toISOString(),
        like_count: 12,
        comment_count: 4,
        is_liked: false
    },
    {
        id: "gallery-demo-2",
        team_id: "demo-team-002",
        team_name: "Pasukan Langit Biru",
        selected_case: "kendaraan",
        cloudinary_url: "/assets/komik_2/kendaraan/Kendaraan1.jpeg",
        media_type: "foto",
        caption: "Sosialisasi ke warga sekitar tentang dampak emisi gas buang kendaraan pribadi.",
        uploaded_at: new Date(Date.now() - 172800000).toISOString(),
        like_count: 24,
        comment_count: 8,
        is_liked: false
    }
];

export const DEMO_GURU_TEST_RESULTS = [
    {
        id: "test-demo-1",
        student_name: "Andi Pratama",
        class_name: "Kelas 5A (Demo)",
        type: "pretest" as const,
        score: 60,
        date: new Date(Date.now() - 604800000).toISOString(),
        answers: { "q1": "A", "q2": "B", "q3": "A" },
        questions: [
            { id: "q1", question_text: "Apa itu daur ulang?", options: ["A. Mengolah kembali", "B. Membuang sampah"], correct_answer: "A" },
            { id: "q2", question_text: "Apa dampak polusi udara?", options: ["A. Sehat", "B. Sesak napas"], correct_answer: "B" },
            { id: "q3", question_text: "Mana yang termasuk sampah organik?", options: ["A. Sisa makanan", "B. Botol kaca"], correct_answer: "A" }
        ]
    },
    {
        id: "test-demo-2",
        student_name: "Andi Pratama",
        class_name: "Kelas 5A (Demo)",
        type: "posttest" as const,
        score: 100,
        date: new Date(Date.now() - 86400000).toISOString(),
        answers: { "q1": "A", "q2": "B", "q3": "A" },
        questions: [
            { id: "q1", question_text: "Apa itu daur ulang?", options: ["A. Mengolah kembali", "B. Membuang sampah"], correct_answer: "A" },
            { id: "q2", question_text: "Apa dampak polusi udara?", options: ["A. Sehat", "B. Sesak napas"], correct_answer: "B" },
            { id: "q3", question_text: "Mana yang termasuk sampah organik?", options: ["A. Sisa makanan", "B. Botol kaca"], correct_answer: "A" }
        ]
    },
    {
        id: "test-demo-3",
        student_name: "Budi Santoso",
        class_name: "Kelas 5A (Demo)",
        type: "pretest" as const,
        score: 80,
        date: new Date(Date.now() - 604800000).toISOString(),
        answers: { "q1": "A", "q2": "B", "q3": "B" },
        questions: [
            { id: "q1", question_text: "Apa itu daur ulang?", options: ["A. Mengolah kembali", "B. Membuang sampah"], correct_answer: "A" },
            { id: "q2", question_text: "Apa dampak polusi udara?", options: ["A. Sehat", "B. Sesak napas"], correct_answer: "B" },
            { id: "q3", question_text: "Mana yang termasuk sampah organik?", options: ["A. Sisa makanan", "B. Botol kaca"], correct_answer: "A" }
        ]
    }
];
