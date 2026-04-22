"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { useMission3, TaskWithUser } from "@/hooks/useMission3";
import { clsx } from 'clsx';
import {
    ArrowLeft, Crown, Calendar, CalendarDays,
    CheckCircle2, Clock, Upload, Loader2, ChevronLeft, ChevronRight, Plus,
    BookmarkCheck, X
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Misi3Page() {
    const { user, loading: authLoading } = useAuth();

    const mission = useMission3(
        user?.id ?? "",
        user?.class_id ?? "",
        "belum_pilih"
    );

    useRealtime({
        table: "mission3_tasks",
        onInsert: () => {
            if (mission.myTeam) mission.fetchScheduleAndTasks(mission.myTeam.id);
        },
        onUpdate: () => {
            if (mission.myTeam) mission.fetchScheduleAndTasks(mission.myTeam.id);
        },
    });

    const showLoading = authLoading || (!!user && !mission.initialized) || mission.loading;

    // State untuk form task modal
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDate, setNewTaskDate] = useState("");
    const [newTaskAssignee, setNewTaskAssignee] = useState("");

    // State untuk Modal konfirmasi selesai
    const [taskToComplete, setTaskToComplete] = useState<string | null>(null);

    // State untuk Modal submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddTask = async () => {
        if (!newTaskTitle || !newTaskDate || !newTaskAssignee) return;
        await mission.addTask(newTaskTitle, newTaskDate, newTaskAssignee);
        setIsAddingTask(false);
        setNewTaskTitle("");
        setNewTaskDate("");
        setNewTaskAssignee("");
    };

    const isKetua = mission.teamRole === "ketua";
    const isApproved = mission.schedule?.teacher_approved;
    const isSubmitted = !!mission.schedule?.submitted_at;

    // Filter status tasks
    const tasksBelum = mission.tasks.filter(t => t.status === "belum");
    const tasksSedang = mission.tasks.filter(t => t.status === "sedang");
    const tasksSelesai = mission.tasks.filter(t => t.status === "selesai");

    // helper Date
    const today = new Date();
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [viewYear, setViewYear] = useState(today.getFullYear());

    const currentMonthName = new Date(viewYear, viewMonth, 1).toLocaleString("id-ID", { month: "long" });
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const offsetDays = Array.from({ length: firstDayOfMonth }, (_, i) => prevMonthDays - firstDayOfMonth + i + 1);

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const getDayColor = (day: number) => {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const hasTaskSelesai = mission.tasks.some(t => t.scheduled_date.startsWith(dateStr) && t.status === "selesai");
        const hasTaskSedang = mission.tasks.some(t => t.scheduled_date.startsWith(dateStr) && t.status === "sedang");
        const hasTaskBelum = mission.tasks.some(t => t.scheduled_date.startsWith(dateStr) && t.status === "belum");

        if (hasTaskSelesai) return "bg-[#A3FFA1] text-[#1A5C0A]";
        if (hasTaskSedang) return "bg-[#FEFF9E] text-[#7A7200]";
        if (hasTaskBelum) return "bg-[#FF9100] text-white";
        return "text-[#333] hover:bg-white/40 transition";
    };

    const handleDateClick = (day: number) => {
        if (isKetua && !isApproved) {
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            setNewTaskDate(dateStr);
            setIsAddingTask(true);
        }
    };

    // Card Tugas
    const TaskCard = ({ task }: { task: TaskWithUser }) => {
        const canEditStatus = !isApproved && (task.assigned_to === user?.id || isKetua);

        return (
            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm mb-3 relative flex flex-col gap-2">
                <p className="text-xs sm:text-sm font-bold text-[#333]">{task.title}</p>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#999] font-medium">
                        <Calendar size={12} />
                        {new Date(task.scheduled_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="bg-[#E9FF70] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded text-[#333]">
                        {task.user?.full_name?.split(" ")[0] || "Anonim"}
                    </div>
                </div>

                {/* Tombol aksi khusus untuk assignee yang belum selesai */}
                {canEditStatus && task.status !== "selesai" && (
                    <div className="flex justify-between mt-8 gap-2">
                        {task.status === "belum" && (
                            <button
                                onClick={() => mission.updateTaskStatus(task.id, "sedang")}
                                className="w-full text-[10px] sm:text-xs text-[#6B3A00] font-bold bg-[#FFD59E]/30 px-2 py-2 rounded-lg hover:bg-[#FFD59E]/50 cursor-pointer"
                            >
                                Kerjakan
                            </button>
                        )}
                        <button
                            onClick={() => setTaskToComplete(task.id)}
                            className="w-full text-[10px] sm:text-xs text-[#1A5C0A] font-bold bg-[#A3FFA1]/30 px-2 py-2 rounded-lg hover:bg-[#A3FFA1]/50 cursor-pointer"
                        >
                            Selesai
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const headerClass = `flex items-center gap-3 ${isKetua ? "mb-5 md:mb-0" : ""}`;

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <div className="px-4 md:px-8 lg:px-26 pt-20 lg:pt-24 pb-6 bg-[#FFD59E]">
                <p className="text-[10px] font-bold text-[#6B3A00] uppercase tracking-widest mb-3">
                    MISI 3 · PARTISIPASI & KEBERLANJUTAN
                </p>
                <h1 className="text-xl lg:text-2xl font-extrabold text-[#6B3A00] flex items-center gap-2 mb-3">
                    <span className="text-2xl"><CalendarDays className="w-5 h-5 lg:w-[22px] lg:h-[22px] text-[#6B3A00]" strokeWidth={3} /></span> Sang Pengatur Waktu
                </h1>
                <p className="text-xs lg:text-sm text-[#6B3A00] leading-relaxed mb-5 max-w-lg">
                    Susun jadwal proyek timmu dan bagi tugas ke setiap anggota. Ajukan ke guru untuk di-approve!
                </p>
                <div className="flex gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 bg-[#FFFDF1] text-[#6B3A00] text-xs font-semibold px-3 py-1.5 rounded-full">
                        <Calendar size={14} className="text-[#FFA1A1]" /> Kalender
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#FFFDF1] text-[#6B3A00] text-xs font-semibold px-3 py-1.5 rounded-full">
                        <BookmarkCheck size={14} className="text-[#333333]" /> Kanban
                    </span>
                    {isApproved ? (
                        <span className="flex items-center gap-1.5 bg-[#A3FFA1] text-[#1A5C0A] text-xs font-semibold px-3 py-1.5 rounded-full">
                            <CheckCircle2 size={14} /> Disetujui
                        </span>
                    ) : isSubmitted ? (
                        <span className="flex items-center gap-1.5 bg-[#FFE1A6] text-[#A66205] text-xs font-semibold px-3 py-1.5 rounded-full">
                            <Clock size={14} /> Belum Disetujui
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 bg-[#FFA1A1] text-[#7A0000] text-xs font-semibold px-3 py-1.5 rounded-full">
                            <Clock size={14} /> Belum Diajukan
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-4 md:px-8 lg:px-26 pb-8 py-6">
                {showLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                        <Loader2 className="animate-spin w-8 h-8 text-[#7A6200]" />
                        <p className="text-sm text-[#333333]/50 font-medium">Memuat misi...</p>
                    </div>
                ) : !user ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-[#333333]/50">Sesi tidak ditemukan</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
                            <div className={headerClass}>
                                <div className="w-8 h-8 rounded-full bg-[#FFD59E] flex items-center justify-center text-[#6B3A00] font-extrabold text-lg">
                                    1
                                </div>
                                <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                                    KALENDER PROYEK
                                </h2>
                            </div>

                            {/* Button Ajukan */}
                            {isKetua && !isApproved && (
                                <div className="flex justify-center md:justify-end">
                                    <button
                                        onClick={() => setIsSubmitting(true)}
                                        disabled={mission.tasks.length === 0}
                                        className="w-full md:w-auto bg-[#FFDEAD] text-sm  hover:bg-[#FFD5A1] border border-[#FF9100] text-[#905D17] font-bold px-8 py-2 rounded-xl flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Ajukan Jadwal Ke Guru <Upload size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}

                            {isApproved && (
                                <div className={clsx(
                                    "text-center p-6 bg-green-50 text-green-700 font-bold border-2 border-green-200 rounded-3xl",
                                    !isKetua && "mt-5"
                                )}>
                                    Hore! Jadwal disetujui Guru. Misi 4 sekarang bisa terbuka!
                                </div>
                            )}
                        </div>

                        <div className="gap-8 items-start">
                            {/* Calendar Kiri */}
                            <div className="lg:col-span-5 bg-[#FFD59E] p-6 rounded-2xl border-2 border-[#FF9100] mb-5">
                                <div className="flex items-center justify-between mb-6">
                                    <button onClick={handlePrevMonth} className="w-8 h-8 bg-[#FFFDF1] rounded-lg flex items-center justify-center text-[#6B3A00] hover:bg-white/60 transition cursor-pointer">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <h3 className="font-extrabold text-[#6B3A00] text-sm">{currentMonthName} {viewYear}</h3>
                                    <button onClick={handleNextMonth} className="w-8 h-8 bg-[#FFFDF1] rounded-lg flex items-center justify-center text-[#6B3A00] hover:bg-white/60 transition cursor-pointer">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-y-6 gap-x-4 text-center text-xs font-bold text-[#6B3A00]">
                                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>

                                    {/* Obsolete prev month dates */}
                                    {offsetDays.map((day, i) => (
                                        <div key={'off' + i} className="text-[#6B3A00]/40 flex items-center justify-center h-8">{day}</div>
                                    ))}

                                    {/* Current month dates */}
                                    {calendarDays.map(day => (
                                        <div key={day} className="flex justify-center">
                                            <button
                                                onClick={() => handleDateClick(day)}
                                                disabled={!isKetua || isApproved}
                                                className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${getDayColor(day)} ${isKetua && !isApproved ? 'cursor-pointer hover:shadow hover:scale-105' : 'cursor-default'}`}
                                            >
                                                {day}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Kanban Board Kanan */}
                            <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 items-start">
                                {/* Kolom Belum */}
                                <div className="flex-1 w-full bg-[#FFF3DF] border border-orange-200 rounded-[1.5rem] p-4 flex flex-col">
                                    <div className="bg-[#FFE4B5] text-[#A66205] text-xs font-bold text-center py-2 rounded-xl mb-4 flex items-center justify-center gap-1.5">
                                        <Clock size={14} /> Belum Dikerjakan
                                    </div>

                                    <div className="flex flex-col flex-1 min-h-[150px]">
                                        {tasksBelum.map(task => <TaskCard key={task.id} task={task} />)}

                                        {/* Tool Ketua Tambah */}
                                        {isKetua && !isApproved && (
                                            <button onClick={() => setIsAddingTask(true)} className="mt-2 border border-dashed border-gray-300 text-gray-400 font-bold text-[10px] sm:text-xs py-2 rounded-xl w-full flex items-center justify-center gap-1 hover:bg-white transition cursor-pointer">
                                                + Tambah tugas
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Kolom Sedang */}
                                <div className="flex-1 w-full bg-[#FCFCE0] border border-yellow-200 rounded-[1.5rem] p-4 flex flex-col">
                                    <div className="bg-[#FFF9A6] text-[#7A7200] text-xs font-bold text-center py-2 rounded-xl mb-4 flex items-center justify-center gap-1.5">
                                        <Loader2 size={14} /> Sedang Dikerjakan
                                    </div>
                                    <div className="flex flex-col flex-1 min-h-[150px]">
                                        {tasksSedang.map(task => <TaskCard key={task.id} task={task} />)}
                                        {tasksSedang.length === 0 && <p className="text-center text-xs text-gray-400 mt-4 italic opacity-50">Kosong</p>}
                                    </div>
                                </div>

                                {/* Kolom Selesai */}
                                <div className="flex-1 w-full bg-[#E5FFEA] border border-green-200 rounded-[1.5rem] p-4 flex flex-col">
                                    <div className="bg-[#A3FFA1] text-[#1A5C0A] text-xs font-bold text-center py-2 rounded-xl mb-4 flex items-center justify-center gap-1.5">
                                        <CheckCircle2 size={14} /> Selesai
                                    </div>
                                    <div className="flex flex-col flex-1 min-h-[150px]">
                                        {tasksSelesai.map(task => <TaskCard key={task.id} task={task} />)}
                                        {tasksSelesai.length === 0 && <p className="text-center text-xs text-gray-400 mt-4 italic opacity-50">Kosong</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modals Overlay */}

                        {/* Modal Tambah Tugas (Rincian Tugas) */}
                        {isAddingTask && (
                            <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                                <DialogContent className="max-w-md rounded-xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-[#6B3A00] font-extrabold text-lg">
                                            Rincian Tugas
                                        </DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-4 py-2">
                                        {/* Input Judul */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold text-[#6B3A00]">Judul Tugas</Label>
                                            <Input
                                                placeholder="Contoh: Membuat purwarupa"
                                                value={newTaskTitle}
                                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                                className="focus-visible:ring-[#FF9100]"
                                            />
                                        </div>

                                        {/* Select Anggota */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold text-[#6B3A00]">Tugaskan Ke Siapa</Label>
                                            <Select
                                                onValueChange={setNewTaskAssignee}
                                                value={newTaskAssignee}
                                            >
                                                <SelectTrigger className="focus:ring-[#FF9100] w-full">
                                                    <SelectValue placeholder="Pilih anggota" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mission.myTeam?.team_members?.map((m) => (
                                                        <SelectItem key={m.student_id} value={m.student_id}>
                                                            {m.users?.full_name || m.student_id}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Input Tanggal */}
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold text-[#6B3A00]">Tanggal</Label>
                                            <Input
                                                type="date"
                                                value={newTaskDate}
                                                onChange={(e) => setNewTaskDate(e.target.value)}
                                                className="focus-visible:ring-[#FF9100] text-gray-600"
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter className="flex flex-row justify-end gap-3 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsAddingTask(false)}
                                            className="p-4 border-gray-200 text-[#6B3A00] font-bold cursor-pointer"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            onClick={handleAddTask}
                                            className="p-4 bg-[#FF9100] hover:bg-[#E68200] text-white font-bold cursor-pointer"
                                        >
                                            Tambah Tugas
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Modal Konfirmasi Selesai */}
                        {taskToComplete && (
                            <AlertDialog
                                open={!!taskToComplete}
                                onOpenChange={(open) => !open && setTaskToComplete(null)}
                            >
                                <AlertDialogContent className="max-w-sm rounded-xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-[#905D17] font-extrabold text-xl text-left">
                                            Apakah sudah selesai?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-500 text-sm text-left">
                                            Tandai jika sudah selesai
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter className="flex flex-row justify-end gap-3 mt-4">
                                        <AlertDialogCancel asChild>
                                            <Button
                                                variant="outline"
                                                className="p-4 border-gray-200 text-[#6B3A00] font-bold cursor-pointer"
                                            >
                                                Batal
                                            </Button>
                                        </AlertDialogCancel>

                                        <AlertDialogAction asChild>
                                            <Button
                                                onClick={() => {
                                                    mission.updateTaskStatus(taskToComplete, "selesai");
                                                    setTaskToComplete(null);
                                                }}
                                                className="p-4 bg-[#FF9100] hover:bg-[#E68200] text-white font-bold cursor-pointer"
                                            >
                                                Tandai Selesai
                                            </Button>
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {/* Modal Ajukan Jadwal */}
                        {isSubmitting && (
                            <AlertDialog open={isSubmitting} onOpenChange={setIsSubmitting}>
                                <AlertDialogContent className="max-w-md rounded-xl">
                                    <AlertDialogHeader className="flex flex-col items-center">
                                        <AlertDialogTitle className="text-[#905D17] font-extrabold text-xl mb-2">
                                            Ajukan jadwal ke guru
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-500 text-sm">
                                            Setelah diajukan, guru akan mereview jadwalmu.
                                            <br />
                                            Misi 4 akan terbuka otomatis setelah guru menyetujui.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter className="flex flex-row justify-center gap-3 mt-8">
                                        <AlertDialogCancel asChild>
                                            <Button
                                                variant="outline"
                                                className="p-4 border-gray-200 text-[#6B3A00] font-bold cursor-pointer"
                                            >
                                                Batal
                                            </Button>
                                        </AlertDialogCancel>

                                        <AlertDialogAction asChild>
                                            <Button
                                                onClick={async () => {
                                                    await mission.submitSchedule();
                                                    setIsSubmitting(false);
                                                }}
                                                className="p-4 bg-[#FF9100] hover:bg-[#E68200] text-white font-bold cursor-pointer"
                                            >
                                                Ajukan
                                            </Button>
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
