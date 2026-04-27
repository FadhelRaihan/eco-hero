export type MaterialType = "text" | "video" | "comic";

export interface MaterialBlock {
    id: string;
    type: MaterialType;
    title?: string;
    content?: string; // Untuk teks
    videoUrl?: string; // URL YouTube
    images?: string[]; // Array URL gambar untuk komik
}

export type CaseTopic = "sampah" | "kendaraan";

export interface CaseData {
    title: string;
    description: string;
    materials: MaterialBlock[];
    question: {
        id: string;
        text: string;
        options: { label: string; value: string }[];
    };
}

export const MISSION_1_DATA: Record<CaseTopic, CaseData> = {
    sampah: {
        title: "Tumpukan Sampah TPA Sarimukti dan Kontroversi PLTSa (Pembangkit Listrik Tenaga Sampah)",
        description: "Menggali isu sampah yang belum selesai di TPA Sarimukti, yang menjadi simbol problema sampah Jawa Barat. Kita akan melihat bagaimana persoalan ini memengaruhi lingkungan sekitar dan potensi solusi lewat teknologi Pembangkit Listrik Tenaga Sampah (PLTSa).",
        materials: [
            {
                id: "pk-1",
                type: "text",
                title: "Problem Tumpukan Sampah",
                content: "Kapasitas TPA Sarimukti di Kabupaten Bandung Barat mengalami kelebihan beban, sehingga pemerintah daerah mulai membatasi kuota pembuangan sampah dari Kota Bandung dan sekitarnya. Sebagai solusi, pemerintah berencana dan mulai membangun PLTSa (seperti di Legok Nangka) untuk membakar sampah dan mengubahnya menjadi energi listrik. ",
            },
            {
                id: "pk-2",
                type: "video",
                title: "PLTSa: Solusi atau Masalah Baru?",
                videoUrl: "https://www.youtube.com/shorts/uBV2lv4sDb4",
            },
            {
                id: "pk-3",
                type: "comic",
                title: "Bagaimana Sampah Menjadi Listrik?",
                images: [
                    "/assets/komik_1/Sampah1.png",
                    "/assets/komik_1/Sampah2.png",
                    "/assets/komik_1/Sampah3.png",
                ],
            },
        ],
        question: {
            id: "q-pk",
            text: "Pembangunan PLTSa ini dikritik oleh aktivis lingkungan karena teknologi pembakaran ini dinilai sebagai 'solusi palsu' yang menghasilkan polusi udara beracun dan limbah abu, apakah kamu setuju dengan pernyataan ini?",
            options: [
                { label: "Setuju", value: "setuju" },
                { label: "Tidak Setuju", value: "tidak_setuju" },
            ],
        },
    },
    kendaraan: {
        title: "Masa Depan Transportasi: Beralih ke Kendaraan Listrik",
        description: "Peralihan dari kendaraan berbasis bahan bakar fosil ke kendaraan listrik menjadi sorotan utama dalam upaya global mengurangi emisi karbon. Industri otomotif berubah drastis, produsen besar berlomba-lomba meluncurkan model terbaru, dan stasiun pengisian daya mulai menjamur menggantikan SPBU.",
        materials: [
            {
                id: "af-1",
                type: "text",
                title: "Baterai Lithium-ion: Teknologi Inti Kendaraan Listrik",
                content: "Di tahun 2025-2026, penggunaan kendaraan listrik di Indonesia termasuk di Kota Bandung meningkat tajam karena dianggap ramah lingkungan, tapi akan benar ramah lingkungan?",
            },
            {
                id: "af-2",
                type: "video",
                title: "Dilema Listrik Langit Biru",
                videoUrl: "https://youtu.be/h6UwsJUZ9nE?si=4C2uq3i9VBvimIPZ",
            },
            {
                id: "af-3",
                type: "comic",
                title: "Dilema Listrik Langit Biru",
                images: [
                    "/assets/komik_2/kendaraan/Kendaraan1.jpeg",
                    "/assets/komik_2/kendaraan/Kendaraan2.jpeg",
                    "/assets/komik_2/kendaraan/Kendaraan3.jpeg",
                    "/assets/komik_2/kendaraan/Kendaraan4.jpeg",
                    "/assets/komik_2/kendaraan/Kendaraan5.jpeg",
                    "/assets/komik_2/kendaraan/Kendaraan6.jpeg",
                ],
            },
            {
                id: "af-4",
                type: "text",
                title: "Dampak Tak Terlihat",
                content: "Di saat bersamaan, pemerintah sedang menggalakkan Bus Rapid Transit (BRT) Bandung Raya untuk mengurangi kemacetan ekstrem serta menghemat pengunaan BBM.",
            },
            {
                id: "af-5",
                type: "video",
                title: "BRT Bandung Raya",
                videoUrl: "https://youtu.be/YF9IB3_IQqQ?si=NhCXQvKBXNVUHa-W",
            },
            {
                id: "af-6",
                type: "text",
                title: "Kewajiban Bersama",
                content: "Selain menjaga kondisi lingkungan bumi serta menghemat energi kita sebagai manusia harus menyadari hak warga lain untuk mendapatkan jalanan yang lancar, serta kewajiban warga untuk mendahulukan kepentingan umum seeprti naik kendaraan pribadi dibanding kenyamanan pribadi seperti menggunakan kendaraan pribadi.",
            },
            {
                id: "af-7",
                type: "comic",
                title: "Banjir di Kota Kita",
                images: [
                    "/assets/komik_2/bus/Bus1.jpeg",
                    "/assets/komik_2/bus/Bus2.jpeg",
                    "/assets/komik_2/bus/Bus3.jpeg",
                    "/assets/komik_2/bus/Bus4.jpeg",
                    "/assets/komik_2/bus/Bus5.jpeg",
                    "/assets/komik_2/bus/Bus6.jpeg",
                ],
            },
        ],
        question: {
            id: "q-af",
            text: "Jadi menurutmu dengan kondisi sekarang, kondisi lingkungan yang semakin memburuk akibat polusi, bbm mengalami kelangkaan sehingga harganya melambung tinggi, dijalan macet karena banyak kendaraan pribadi, apa yang akan kamu pilih? Sesuaikan dengan kondisimu saat ini!",
            options: [
                { label: "Kendaraan Listrik (Pribadi)", value: "kendaraan_listrik" },
                { label: "Kendaraan BBM (Pribadi)", value: "kendaraan_bbm" },
            ],
        },
    },
};
