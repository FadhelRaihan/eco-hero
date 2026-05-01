"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_GURU_TEST_RESULTS } from "@/lib/demo/mockData";
import {
    Loader2,
    History,
    Download,
    Eye
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";

interface Question {
    id: string;
    question_text: string;
    options: string[] | Record<string, string>;
    correct_answer: string;
}

interface TestResult {
    id: string;
    student_name: string;
    class_name: string;
    type: "pretest" | "posttest";
    score: number;
    date: string;
    answers: Record<string, string>;
    questions: Question[];
}

export default function GuruManageTestsPage() {
    const { user } = useAuth();
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<TestResult | null>(null);

    const isDemoMode = typeof window !== "undefined"
        ? localStorage.getItem("eco_guru_demo_mode") === "true"
        : false;

    useEffect(() => {
        async function fetchData() {
            if (isDemoMode) {
                setTestResults(DEMO_GURU_TEST_RESULTS as TestResult[]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/guru/test-results?teacher_id=${user?.id}`);
                const result = await res.json();
                if (res.ok) {
                    setTestResults(result.data ?? []);
                }
            } finally {
                setLoading(false);
            }
        }

        if (user?.id || isDemoMode) fetchData();
    }, [user?.id, isDemoMode]);

    const exportResultsToExcel = async () => {
        try {
            if (testResults.length === 0) {
                toast.error("Tidak ada data untuk diekspor");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Hasil Tes Siswa");

            let maxQuestions = 0;
            testResults.forEach(r => {
                const qCount = r.questions?.length || 0;
                if (qCount > maxQuestions) maxQuestions = qCount;
            });

            const columns = [
                { header: "Nama Siswa", key: "student_name", width: 25 },
                { header: "Kelas", key: "class_name", width: 15 },
                { header: "Jenis Tes", key: "type", width: 15 },
                { header: "Skor", key: "score", width: 10 },
                { header: "Tanggal", key: "date", width: 20 },
            ];

            for (let i = 1; i <= maxQuestions; i++) {
                columns.push({ header: `Pertanyaan ${i}`, key: `q${i}_text`, width: 45 });
                columns.push({ header: `Jawaban Siswa ${i}`, key: `q${i}_ans`, width: 30 });
                columns.push({ header: `Kunci Jawaban ${i}`, key: `q${i}_correct`, width: 30 });
                columns.push({ header: `Status ${i}`, key: `q${i}_status`, width: 12 });
            }

            worksheet.columns = columns;

            testResults.forEach((r) => {
                const rowData: Record<string, string | number> = {
                    student_name: r.student_name,
                    class_name: r.class_name,
                    type: r.type.toUpperCase(),
                    score: Math.round(r.score || 0),
                    date: r.date ? new Date(r.date).toLocaleDateString('id-ID') : "-",
                };

                const questions = r.questions || [];
                const answers = r.answers || {};

                questions.forEach((q, idx) => {
                    const i = idx + 1;
                    const studentAnsKey = answers[q.id];
                    const correctAnsKey = q.correct_answer;
                    const isCorrect = String(studentAnsKey) === String(correctAnsKey);

                    rowData[`q${i}_text`] = q.question_text || "";
                    rowData[`q${i}_ans`] = studentAnsKey || "-";
                    rowData[`q${i}_correct`] = correctAnsKey || "-";
                    rowData[`q${i}_status`] = isCorrect ? "BENAR" : "SALAH";
                });

                worksheet.addRow(rowData);
            });

            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF1A5C0A" }, // Green for Guru
                };
            });

            const fileName = `Hasil_Tes_Kelas_${testResults[0]?.class_name || 'Guru'}_${new Date().getTime()}.xlsx`;
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), fileName);
            toast.success("Berhasil mengekspor data");
        } catch {
            toast.error("Gagal mengekspor data");
        }
    };

    const columns: ColumnDef<TestResult>[] = [
        {
            accessorKey: "student_name",
            header: "Nama Siswa",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-[#1A5C0A]/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.getValue("student_name")}`} />
                        <AvatarFallback className="bg-[#1A5C0A]/10 text-[#1A5C0A] text-[10px] font-bold">
                            {(row.getValue("student_name") as string).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-[#333333] text-sm">{row.getValue("student_name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Jenis Tes",
            cell: ({ row }) => (
                <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                    row.getValue("type") === "pretest" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                )}>
                    {row.getValue("type")}
                </span>
            ),
        },
        {
            accessorKey: "score",
            header: () => <div className="text-center">Skor</div>,
            cell: ({ row }) => {
                const score = row.getValue("score") as number;
                let color = "text-red-500 bg-red-50";
                if (score >= 80) color = "text-green-700 bg-green-100";
                else if (score >= 60) color = "text-yellow-700 bg-yellow-100";

                return (
                    <div className="flex justify-center">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm", color)}>
                            {Math.round(score)}
                        </div>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">Detail</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button
                        onClick={() => setSelectedSubmission(row.original)}
                        variant="ghost"
                        className="h-9 px-3 text-[#1A5C0A] hover:bg-[#1A5C0A]/5 font-bold text-xs rounded-xl flex items-center gap-2"
                    >
                        <Eye size={16} /> Lihat
                    </Button>
                </div>
            ),
        },
        {
            accessorKey: "date",
            header: "Tanggal",
            cell: ({ row }) => (
                <span className="text-xs text-gray-400 font-medium">
                    {row.original.date ? new Date(row.original.date).toLocaleDateString('id-ID') : "-"}
                </span>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin w-10 h-10 text-[#1A5C0A]" />
            </div>
        );
    }

    return (
        <div className="mx-auto px-8 py-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <History size={16} className="text-[#1A5C0A]" />
                        <span className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-widest">Evaluasi Pembelajaran</span>
                    </div>
                    <h1 className="text-3xl font-black text-[#333333] tracking-tight">Hasil Tes Siswa</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Pantau nilai pre-test dan post-test siswa di kelas Anda</p>
                </div>
                
                <Button 
                    onClick={exportResultsToExcel}
                    className="bg-[#1A5C0A] hover:bg-[#154608] text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1A5C0A]/20 transition-all active:scale-95 flex items-center gap-3"
                >
                    <Download size={18} /> Ekspor Excel
                </Button>
            </div>

            <div className="bg-white rounded-2xl border border-[#1A5C0A]/10 p-2 shadow-2xl shadow-[#1A5C0A]/5 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={testResults}
                    filterColumn="student_name"
                    searchPlaceholder="Cari nama siswa..."
                />
            </div>

            <Drawer open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                <DrawerContent className="max-h-[85vh] rounded-t-[3rem]">
                    <DrawerHeader className="px-8 text-left">
                        <DrawerTitle className="text-xl font-black text-[#333333]">Detail Jawaban: {selectedSubmission?.student_name}</DrawerTitle>
                        <DrawerDescription className="text-[#1A5C0A] font-bold text-[10px] uppercase">
                            {selectedSubmission?.type.toUpperCase()} • Skor: {selectedSubmission?.score}
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-hidden px-8 pb-8">
                        <VirtualizedQuestionList submission={selectedSubmission} />
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

function VirtualizedQuestionList({ submission }: { submission: TestResult | null }) {
    const parentRef = useRef<HTMLDivElement>(null);
    const questions = submission?.questions || [];

    const rowVirtualizer = useVirtualizer({
        count: questions.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 140,
        overscan: 5,
    });

    const getOptionText = (q: Question, key: string | undefined) => {
        if (!key) return "(Tidak dijawab)";
        if (typeof q.options === 'object' && q.options !== null) {
            return (q.options as Record<string, string>)[key] || key;
        }
        return key;
    };

    return (
        <div ref={parentRef} className="h-[500px] w-full overflow-y-auto pr-2">
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const q = questions[virtualRow.index];
                    if (!q) return null;
                    const studentAnswerKey = submission?.answers[q.id];
                    const isCorrect = studentAnswerKey === q.correct_answer;

                    return (
                        <div key={virtualRow.index} className="absolute top-0 left-0 w-full p-2" style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}>
                            <div className="p-5 rounded-[24px] bg-gray-50 border border-gray-100 space-y-3">
                                <div className="flex justify-between items-start gap-4">
                                    <p className="text-xs font-bold text-[#333333] leading-relaxed">
                                        <span className="text-[#1A5C0A] mr-1">{virtualRow.index + 1}.</span> {q.question_text}
                                    </p>
                                    <span className={cn("shrink-0 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest", isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                                        {isCorrect ? "Benar" : "Salah"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] pt-2">
                                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                                        <p className="text-gray-400 font-bold uppercase text-[7px] mb-1">Jawaban Siswa</p>
                                        <p className={cn("font-bold", isCorrect ? "text-green-700" : "text-red-600")}>
                                            {studentAnswerKey}. {getOptionText(q, studentAnswerKey)}
                                        </p>
                                    </div>
                                    {!isCorrect && (
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                            <p className="text-green-700/50 font-bold uppercase text-[7px] mb-1">Kunci Jawaban</p>
                                            <p className="text-[#1A5C0A] font-bold">{q.correct_answer}. {getOptionText(q, q.correct_answer)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
