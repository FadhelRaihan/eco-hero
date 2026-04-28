"use client";

import { useRef, useEffect, useState } from "react";
import { X, ImageIcon, FileText, Loader2 } from "lucide-react";

interface CertificateModalProps {
    studentName: string;
    onClose: () => void;
}

const W = 1600;
const H = 1132;

function drawCertificate(ctx: CanvasRenderingContext2D, studentName: string) {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#f0fff4");
    grad.addColorStop(0.4, "#e6f9e6");
    grad.addColorStop(1, "#fffde7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Outer border
    ctx.strokeStyle = "#1A5C0A";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(32, 32, W - 64, H - 64, 32);
    ctx.stroke();

    // Inner border
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = "#1A5C0A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(48, 48, W - 96, H - 96, 24);
    ctx.stroke();
    ctx.restore();

    const cx = W / 2;

    // Green circle icon
    ctx.fillStyle = "#B4FF9F";
    ctx.beginPath();
    ctx.arc(cx, 195, 64, 0, Math.PI * 2);
    ctx.fill();

    // Checkmark inside circle
    ctx.strokeStyle = "#1A5C0A";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 26, 192);
    ctx.lineTo(cx - 6, 218);
    ctx.lineTo(cx + 30, 168);
    ctx.stroke();

    // Top label
    ctx.fillStyle = "#1A5C0A";
    ctx.font = "600 22px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Platform Eco-Hero  ·  Sertifikat Penghargaan", cx, 310);

    // Title
    ctx.fillStyle = "#1A3A0A";
    ctx.font = "bold 80px Georgia, serif";
    ctx.fillText("Sertifikat Penyelesaian", cx, 415);

    // Divider lines
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = "#1A5C0A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 170, 455);
    ctx.lineTo(cx - 32, 455);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 32, 455);
    ctx.lineTo(cx + 170, 455);
    ctx.stroke();
    ctx.restore();

    // Diamond
    ctx.fillStyle = "#1A5C0A";
    ctx.font = "32px serif";
    ctx.fillText("✦", cx, 463);

    // Subtitle
    ctx.fillStyle = "#555555";
    ctx.font = "italic 28px Arial, sans-serif";
    ctx.fillText("Dengan bangga diberikan kepada", cx, 525);

    // Student name
    ctx.fillStyle = "#1A5C0A";
    ctx.font = "bold 68px Georgia, serif";
    ctx.fillText(studentName, cx, 625);

    // Underline
    const nameWidth = ctx.measureText(studentName).width;
    ctx.strokeStyle = "#1A5C0A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - nameWidth / 2, 645);
    ctx.lineTo(cx + nameWidth / 2, 645);
    ctx.stroke();

    // Body text
    ctx.fillStyle = "#333333";
    ctx.font = "30px Arial, sans-serif";
    ctx.fillText("telah berhasil menyelesaikan", cx, 710);

    ctx.fillStyle = "#1A5C0A";
    ctx.font = "bold 34px Arial, sans-serif";
    ctx.fillText("Misi Penyelamatan Lingkungan", cx, 760);

    ctx.fillStyle = "#333333";
    ctx.font = "28px Arial, sans-serif";
    ctx.fillText("dan menjadi bagian dari generasi Pahlawan Lingkungan.", cx, 808);

    // Footer
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#1A5C0A";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText("ECO-HERO  ·  PLATFORM PENDIDIKAN LINGKUNGAN", cx, 1068);
    ctx.restore();

    // Corner decorations
    [
        [60, 60, 0],
        [W - 60, 60, 90],
        [60, H - 60, -90],
        [W - 60, H - 60, 180],
    ].forEach(([x, y, rot]) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.strokeStyle = "#1A5C0A";
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(22, 0, 40, 22);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(0, 22, 22, 40);
        ctx.stroke();
        ctx.fillStyle = "#1A5C0A";
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function buildCanvas(studentName: string): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    drawCertificate(ctx, studentName);
    return canvas;
}

export default function CertificateModal({ studentName, onClose }: CertificateModalProps) {
    const previewRef = useRef<HTMLCanvasElement>(null);
    const [downloading, setDownloading] = useState<"png" | "pdf" | null>(null);

    useEffect(() => {
        const canvas = previewRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawCertificate(ctx, studentName);
    }, [studentName]);

    const downloadPNG = async () => {
        setDownloading("png");
        try {
            const canvas = buildCanvas(studentName);
            const link = document.createElement("a");
            link.download = `Sertifikat_EcoHero_${studentName.replace(/\s+/g, "_")}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } finally {
            setDownloading(null);
        }
    };

    const downloadPDF = async () => {
        setDownloading("pdf");
        try {
            const canvas = buildCanvas(studentName);
            const { jsPDF } = await import("jspdf");
            const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
            const imgData = canvas.toDataURL("image/png");
            const pageW = 297, pageH = 210, margin = 10;
            const ratio = Math.min((pageW - margin * 2) / W, (pageH - margin * 2) / H);
            const imgW = W * ratio, imgH = H * ratio;
            pdf.addImage(imgData, "PNG", (pageW - imgW) / 2, (pageH - imgH) / 2, imgW, imgH);
            pdf.save(`Sertifikat_EcoHero_${studentName.replace(/\s+/g, "_")}.pdf`);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col items-center gap-5 max-w-3xl w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
                >
                    <X size={18} />
                </button>

                {/* Preview langsung dari Canvas — tidak pakai html2canvas */}
                <div className="overflow-hidden rounded-2xl shadow-2xl border-2 border-[#1A5C0A]/20 w-full">
                    <canvas
                        ref={previewRef}
                        width={W}
                        height={H}
                        style={{ width: "100%", height: "auto", display: "block" }}
                    />
                </div>

                <div className="flex gap-3 w-full justify-center">
                    <button
                        onClick={downloadPNG}
                        disabled={!!downloading}
                        className="flex items-center gap-2 bg-white border-2 border-[#1A5C0A] text-[#1A5C0A] font-bold px-6 py-3 rounded-2xl hover:bg-[#B4FF9F]/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                        {downloading === "png" ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                        Unduh PNG
                    </button>
                    <button
                        onClick={downloadPDF}
                        disabled={!!downloading}
                        className="flex items-center gap-2 bg-[#1A5C0A] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#134407] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                        {downloading === "pdf" ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                        Unduh PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
