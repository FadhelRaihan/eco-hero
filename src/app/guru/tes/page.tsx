"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    ClipboardCheck,
    School,
    ArrowRight,
    Loader2,
    Plus,
    Trash2,
    Edit2,
    CheckCircle2,
    Target,
    FileText,
    History,
    Search,
    Filter,
    ChevronDown,
    Download
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";

interface Kelas {
    id: string;
    name: string;
}

interface TestResult {
    id: string;
    student_name: string;
    class_name: string;
    type: "pretest" | "posttest";
    score: number;
    date: string;
    answers: Record<string, string>;
    questions: any[];
}

export default function ManageTestsPage() {
    const { user } = useAuth();
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("soal");

    // Results state
    const [filterClass, setFilterClass] = useState("all");
    const [selectedSubmission, setSelectedSubmission] = useState<TestResult | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user?.id]);

    async function fetchData() {
        setLoading(true);
        try {
            const [resKelas, resResults] = await Promise.all([
                fetch(`/api/classes?teacher_id=${user?.id}`),
                fetch(`/api/guru/test-results?teacher_id=${user?.id}`)
            ]);

            const [jsonKelas, jsonResults] = await Promise.all([
                resKelas.json(),
                resResults.json()
            ]);

            if (resKelas.ok) setKelasList(jsonKelas.data ?? []);
            if (resResults.ok) setTestResults(jsonResults.data ?? []);
        } finally {
            setLoading(false);
        }
    }

    const exportResultsToExcel = async () => {
        try {
            if (filteredResults.length === 0) {
                toast.error("Tidak ada data untuk diekspor");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Hasil Tes");

            // Find max questions to determine columns
            let maxQuestions = 0;
            filteredResults.forEach(r => {
                const qCount = r.questions?.length || 0;
                if (qCount > maxQuestions) maxQuestions = qCount;
            });

            // Define columns
            const columns: any[] = [
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

            const getOptionText = (q: any, key: string | number | undefined) => {
                if (key === undefined || key === null || key === "") return "-";
                
                const options = q.options;
                if (!options) return String(key);

                // If options is object {A: "...", B: "..."}
                if (typeof options === 'object' && !Array.isArray(options)) {
                    return (options as Record<string, string>)[String(key)] || String(key);
                }
                
                // If options is array ["...", "..."] and key is index
                if (Array.isArray(options)) {
                    const idx = typeof key === 'number' ? key : parseInt(String(key));
                    if (!isNaN(idx) && options[idx]) return options[idx];
                    return String(key);
                }

                return String(key);
            };

            filteredResults.forEach((r) => {
                const rowData: any = {
                    student_name: r.student_name,
                    class_name: r.class_name,
                    type: String(r.type).toUpperCase(),
                    score: Math.round(r.score || 0),
                    date: r.date ? new Date(r.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }) : "-",
                };

                const questions = r.questions || [];
                const answers = r.answers || {};

                questions.forEach((q, idx) => {
                    const i = idx + 1;
                    const studentAnsKey = answers[q.id];
                    const correctAnsKey = q.correct_answer;
                    const isCorrect = String(studentAnsKey) === String(correctAnsKey);

                    rowData[`q${i}_text`] = q.question_text || "";
                    rowData[`q${i}_ans`] = `${studentAnsKey || '-'}. ${getOptionText(q, studentAnsKey)}`;
                    rowData[`q${i}_correct`] = `${correctAnsKey || '-'}. ${getOptionText(q, correctAnsKey)}`;
                    rowData[`q${i}_status`] = isCorrect ? "BENAR" : "SALAH";
                });

                worksheet.addRow(rowData);
            });

            // Styling the header
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: "FF1A5C0A" } };
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFB4FF9F" },
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            // Add borders to all cells
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const className = filterClass === "all" ? "Semua_Kelas" : kelasList.find(c => c.id === filterClass)?.name || "Kelas";
            const fileName = `Laporan_Hasil_Tes_${className}_${new Date().getTime()}.xlsx`;
            
            saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
            toast.success(`Berhasil ekspor ${filteredResults.length} data hasil tes`);
        } catch (error) {
            console.error("Export Error:", error);
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
                        <AvatarFallback className="bg-[#B4FF9F] text-[#1A5C0A] text-[10px] font-bold">
                            {(row.getValue("student_name") as string).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-[#333333] text-sm">{row.getValue("student_name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "class_name",
            header: "Kelas",
            cell: ({ row }) => (
                <span className="text-xs font-bold text-[#333333]/60">{row.getValue("class_name")}</span>
            ),
        },
        {
            accessorKey: "type",
            header: "Jenis Tes",
            cell: ({ row }) => (
                <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                    row.getValue("type") === "pretest" ? "bg-[#B4FF9F] text-[#1A5C0A]" : "bg-[#F9FFA4] text-[#7A7200]"
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
                if (score >= 80) color = "text-[#1A5C0A] bg-[#B4FF9F]";
                else if (score >= 60) color = "text-[#7A7200] bg-[#F9FFA4]";

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
            id: "answers",
            header: () => <div className="text-center">Jawaban</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => setSelectedSubmission(row.original)}
                        className="px-4 py-2 bg-[#1A5C0A]/5 text-[#1A5C0A] text-[10px] font-black rounded-xl hover:bg-[#1A5C0A] hover:text-white transition-all uppercase tracking-widest cursor-pointer"
                    >
                        Lihat Detail
                    </button>
                </div>
            ),
        },
        {
            accessorKey: "date",
            header: "Tanggal",
            cell: ({ row }) => (
                <span className="text-xs text-[#333333]/40 font-medium">
                    {row.original.date
                        ? new Date(row.original.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })
                        : "-"
                    }
                </span>
            ),
        },
    ];

    const filteredResults = filterClass === "all"
        ? testResults
        : testResults.filter(r => kelasList.find(k => k.name === r.class_name)?.id === filterClass);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F7FFF4]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin w-12 h-12 text-[#1A5C0A]" />
                    <p className="text-[#1A5C0A]/40 font-black uppercase tracking-[0.2em] text-xs">Menyiapkan Lembar Evaluasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-8 py-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-[#333333] tracking-tight">Kelola Tes</h1>
                <p className="text-xs text-[#333333]/60 font-bold uppercase tracking-widest">Atur soal dan pantau hasil evaluasi siswa</p>
            </div>

            <Tabs defaultValue="soal" className="space-y-6" onValueChange={setActiveTab}>
                <TabsList className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1A5C0A]/10 w-fit flex h-auto">
                    <TabsTrigger
                        value="soal"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-[#1A5C0A] data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <FileText size={16} />
                        Kelola Soal
                    </TabsTrigger>
                    <TabsTrigger
                        value="jawaban"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-[#1A5C0A] data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <History size={16} />
                        Hasil Tes
                    </TabsTrigger>
                </TabsList>

                {/* TAB: KELOLA SOAL */}
                <TabsContent value="soal" className="space-y-4 outline-none">
                    {kelasList.length === 0 ? (
                        <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-[#1A5C0A]/10 p-20 text-center">
                            <ClipboardCheck size={64} className="text-[#1A5C0A]/10 mx-auto mb-6" />
                            <p className="text-[#333333]/40 font-bold uppercase tracking-widest text-sm">Belum ada kelas untuk dikelola</p>
                            <Link href="/guru/dashboard">
                                <Button className="mt-6 bg-[#1A5C0A] hover:bg-[#1A5C0A]/90 text-white font-black px-8 py-6 rounded-2xl shadow-xl transition-all active:scale-95">
                                    BUAT KELAS SEKARANG
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {kelasList.map((kelas) => (
                                <Link key={kelas.id} href={`/guru/tes/${kelas.id}`} className="group">
                                    <div className="bg-white rounded-2xl border border-[#1A5C0A]/10 p-7 hover:border-[#1A5C0A]/40 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#B4FF9F]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                                        <div className="flex items-center justify-between mb-6 relative z-10">
                                            <div className="w-14 h-14 bg-[#B4FF9F]/20 rounded-[1.25rem] flex items-center justify-center group-hover:bg-[#B4FF9F] transition-colors duration-500">
                                                <School size={28} className="text-[#1A5C0A]" />
                                            </div>
                                            <div className="flex -space-x-3">
                                                <div className="w-10 h-10 rounded-2xl bg-[#B4FF9F] border-4 border-white flex items-center justify-center text-[10px] font-black text-[#1A5C0A] shadow-sm" title="Pretest">PRE</div>
                                                <div className="w-10 h-10 rounded-2xl bg-[#F9FFA4] border-4 border-white flex items-center justify-center text-[10px] font-black text-[#7A7200] shadow-sm" title="Posttest">POST</div>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-[#333333] mb-2 group-hover:text-[#1A5C0A] transition-colors">{kelas.name}</h3>
                                        <p className="text-xs text-[#333333]/40 font-bold uppercase tracking-widest mb-6">Bank Soal Evaluasi</p>

                                        <div className="flex items-center justify-between pt-6 border-t border-[#1A5C0A]/5 relative z-10">
                                            <span className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">Atur Pertanyaan</span>
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#1A5C0A] group-hover:text-white transition-all">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB: HASIL TES */}
                <TabsContent value="jawaban" className="space-y-4 outline-none">
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-1 border border-[#1A5C0A]/10 shadow-xl shadow-[#1A5C0A]/5">
                        <DataTable
                            columns={columns}
                            data={filteredResults}
                            filterColumn="student_name"
                            searchPlaceholder="Cari nama siswa..."
                            extraActions={
                                <div className="flex flex-col md:flex-row gap-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="h-12 w-full md:w-auto px-5 border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:text-[#1A5C0A] hover:border-[#1A5C0A] transition-all bg-white cursor-pointer"
                                            >
                                                <Filter className="w-4 h-4 mr-2 text-[#1A5C0A]/40" />
                                                {filterClass === "all" ? "Semua Kelas" : kelasList.find(c => c.id === filterClass)?.name}
                                                <ChevronDown className="w-3 h-3 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl p-2">
                                            <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">Filter Kelas</p>
                                            <DropdownMenuRadioGroup value={filterClass} onValueChange={setFilterClass}>
                                                <DropdownMenuRadioItem value="all" className="rounded-xl font-bold text-xs py-2 mb-1">
                                                    Semua Kelas
                                                </DropdownMenuRadioItem>
                                                {kelasList.map((c) => (
                                                    <DropdownMenuRadioItem key={c.id} value={c.id} className="rounded-xl font-bold text-xs py-2 mb-1">
                                                        {c.name}
                                                    </DropdownMenuRadioItem>
                                                ))}
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button
                                        onClick={exportResultsToExcel}
                                        className="h-12 w-full md:w-auto px-6 bg-[#B4FF9F] hover:bg-[#B4FF9F]/80 text-[#1A5C0A] font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm border border-[#1A5C0A]/10 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Ekspor Excel
                                    </Button>
                                </div>
                            }
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <Drawer open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                <DrawerContent className="max-h-[85vh] rounded-t-[3rem] border-none shadow-2xl bg-[#F7FFF4] focus-visible:outline-none">
                    <div className="mx-auto w-12 h-1.5 bg-[#1A5C0A]/10 rounded-full my-4 shrink-0" />
                    
                    <DrawerHeader className="px-8 md:px-12 text-center md:text-left">
                        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                            <div className="p-2 bg-[#B4FF9F] rounded-xl">
                                <History className="w-5 h-5 text-[#1A5C0A]" />
                            </div>
                            <DrawerTitle className="text-xl font-black text-[#333333] tracking-tight uppercase">
                                Detail Jawaban: {selectedSubmission?.student_name}
                            </DrawerTitle>
                        </div>
                        <DrawerDescription className="font-bold text-[#1A5C0A]/60 uppercase tracking-widest text-[9px]">
                            {selectedSubmission?.type.toUpperCase()} - {selectedSubmission?.class_name} • Skor: {Math.round(selectedSubmission?.score || 0)}/100
                        </DrawerDescription>
                    </DrawerHeader>

                    {/* Virtualized List Container */}
                    <div className="flex-1 overflow-hidden px-8 md:px-12 pb-4">
                        <VirtualizedQuestionList submission={selectedSubmission} />
                    </div>

                    <DrawerFooter className="bg-white/80 backdrop-blur-md px-8 py-4 rounded-b-[3rem] border-t border-[#1A5C0A]/5">
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full h-10 rounded-xl border-[#1A5C0A]/10 font-black uppercase tracking-[0.2em] text-[9px] text-[#1A5C0A] hover:bg-[#1A5C0A] hover:text-white transition-all shadow-sm cursor-pointer">
                                Tutup Detail Jawaban
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

// Sub-component for virtualization
function VirtualizedQuestionList({ submission }: { submission: TestResult | null }) {
    const parentRef = useRef<HTMLDivElement>(null);
    const questions = submission?.questions || [];

    const rowVirtualizer = useVirtualizer({
        count: questions.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 140,
        overscan: 5,
    });

    const getOptionText = (q: any, key: string | undefined) => {
        if (!key) return "(Tidak dijawab)";
        if (typeof q.options === 'object' && q.options !== null) {
            return (q.options as Record<string, string>)[key] || key;
        }
        return key;
    };

    return (
        <div
            ref={parentRef}
            className="h-[500px] md:h-[600px] w-full overflow-y-auto pr-2 custom-scrollbar"
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const q = questions[virtualRow.index];
                    if (!q) return null;
                    
                    const studentAnswerKey = submission?.answers[q.id];
                    const isCorrect = studentAnswerKey === q.correct_answer;

                    return (
                        <div
                            key={virtualRow.index}
                            className="absolute top-0 left-0 w-full"
                            style={{
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                                paddingBottom: '12px'
                            }}
                        >
                            <div className="p-4 rounded-2xl bg-white border border-[#1A5C0A]/10 shadow-sm space-y-3 h-full overflow-hidden">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 rounded bg-[#1A5C0A]/5 flex items-center justify-center text-[9px] font-black text-[#1A5C0A] shrink-0 mt-0.5">
                                            {virtualRow.index + 1}
                                        </div>
                                        <p className="text-xs font-bold text-[#333333] line-clamp-2">{q.question_text}</p>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shrink-0",
                                        isCorrect ? "bg-[#B4FF9F] text-[#1A5C0A]" : "bg-red-50 text-red-500"
                                    )}>
                                        {isCorrect ? "Benar" : "Salah"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pl-7">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-black text-[#333333]/30 uppercase tracking-widest">Jawaban Siswa</p>
                                        <p className={cn("text-[10px] font-bold line-clamp-1", isCorrect ? "text-[#1A5C0A]" : "text-red-500")}>
                                            <span className="opacity-50 mr-1">{studentAnswerKey}.</span>
                                            {getOptionText(q, studentAnswerKey)}
                                        </p>
                                    </div>
                                    {!isCorrect && (
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-[#333333]/30 uppercase tracking-widest">Jawaban Benar</p>
                                            <p className="text-[10px] font-bold text-[#1A5C0A] line-clamp-1">
                                                <span className="opacity-50 mr-1">{q.correct_answer}.</span>
                                                {getOptionText(q, q.correct_answer)}
                                            </p>
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

