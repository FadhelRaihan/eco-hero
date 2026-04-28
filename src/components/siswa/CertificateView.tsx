"use client";

import { forwardRef } from "react";
import { Leaf, Award } from "lucide-react";

interface CertificateViewProps {
    studentName: string;
}

/**
 * Komponen visual sertifikat — dirender di DOM (tersembunyi) untuk di-capture html2canvas.
 * Gunakan forwardRef agar parent bisa mengakses ref DOM-nya.
 */
const CertificateView = forwardRef<HTMLDivElement, CertificateViewProps>(
    ({ studentName }, ref) => {
        return (
            <div
                ref={ref}
                style={{
                    width: "800px",
                    height: "566px",
                    background: "linear-gradient(135deg, #f0fff4 0%, #e6f9e6 40%, #fffde7 100%)",
                    position: "relative",
                    overflow: "hidden",
                    fontFamily: "'Georgia', serif",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px 64px",
                    boxSizing: "border-box",
                }}
            >
                {/* Border ornamen luar */}
                <div style={{
                    position: "absolute",
                    inset: "16px",
                    border: "3px solid #1A5C0A",
                    borderRadius: "16px",
                    pointerEvents: "none",
                }} />
                {/* Border ornamen dalam */}
                <div style={{
                    position: "absolute",
                    inset: "24px",
                    border: "1px solid #1A5C0A",
                    borderRadius: "12px",
                    opacity: 0.4,
                    pointerEvents: "none",
                }} />

                {/* Dekorasi sudut — kiri atas */}
                <LeafCorner style={{ top: 28, left: 28, transform: "rotate(0deg)" }} />
                {/* kanan atas */}
                <LeafCorner style={{ top: 28, right: 28, transform: "rotate(90deg)" }} />
                {/* kiri bawah */}
                <LeafCorner style={{ bottom: 28, left: 28, transform: "rotate(-90deg)" }} />
                {/* kanan bawah */}
                <LeafCorner style={{ bottom: 28, right: 28, transform: "rotate(180deg)" }} />

                {/* Konten utama */}
                <div style={{ textAlign: "center", zIndex: 1, position: "relative" }}>
                    {/* Icon */}
                    <div style={{
                        width: 64,
                        height: 64,
                        background: "linear-gradient(135deg, #B4FF9F, #7FD96A)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 4px 16px rgba(26,92,10,0.2)",
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A5C0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c-4.97 0-9-4.03-9-9V5l9-3 9 3v8c0 4.97-4.03 9-9 9z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>

                    {/* Label atas */}
                    <p style={{
                        fontSize: "11px",
                        fontFamily: "'Arial', sans-serif",
                        fontWeight: 700,
                        letterSpacing: "4px",
                        color: "#1A5C0A",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                    }}>
                        Platform Eco-Hero · Sertifikat Penghargaan
                    </p>

                    {/* Judul */}
                    <h1 style={{
                        fontSize: "36px",
                        fontWeight: 800,
                        color: "#1A3A0A",
                        lineHeight: 1.2,
                        margin: "0 0 24px",
                        letterSpacing: "-0.5px",
                    }}>
                        Sertifikat Penyelesaian
                    </h1>

                    {/* Divider ornamen */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", marginBottom: "20px" }}>
                        <div style={{ height: "1px", width: "80px", background: "#1A5C0A", opacity: 0.4 }} />
                        <span style={{ color: "#1A5C0A", fontSize: "18px" }}>✦</span>
                        <div style={{ height: "1px", width: "80px", background: "#1A5C0A", opacity: 0.4 }} />
                    </div>

                    {/* Teks utama */}
                    <p style={{
                        fontSize: "14px",
                        fontFamily: "'Arial', sans-serif",
                        color: "#333",
                        marginBottom: "10px",
                        fontStyle: "italic",
                    }}>
                        Dengan bangga diberikan kepada
                    </p>

                    {/* Nama siswa */}
                    <div style={{
                        fontSize: "32px",
                        fontWeight: 900,
                        color: "#1A5C0A",
                        marginBottom: "16px",
                        padding: "4px 24px",
                        borderBottom: "2px solid #1A5C0A",
                        display: "inline-block",
                        letterSpacing: "0.5px",
                    }}>
                        {studentName}
                    </div>

                    {/* Pesan */}
                    <p style={{
                        fontSize: "15px",
                        fontFamily: "'Arial', sans-serif",
                        color: "#333",
                        lineHeight: 1.6,
                        maxWidth: "520px",
                        margin: "16px auto 0",
                    }}>
                        telah berhasil menyelesaikan{" "}
                        <strong style={{ color: "#1A5C0A" }}>Misi Penyelamatan Lingkungan</strong>
                        {" "}dan menjadi bagian dari generasi{" "}
                        <strong style={{ color: "#1A5C0A" }}>Pahlawan Lingkungan</strong>.
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    position: "absolute",
                    bottom: "40px",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zIndex: 1,
                }}>
                    <p style={{
                        fontSize: "10px",
                        fontFamily: "'Arial', sans-serif",
                        color: "#1A5C0A",
                        opacity: 0.6,
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                    }}>
                        Eco-Hero · Platform Pendidikan Lingkungan
                    </p>
                </div>

                {/* Watermark daun dekoratif belakang */}
                <div style={{
                    position: "absolute",
                    right: "-40px",
                    top: "-40px",
                    width: "220px",
                    height: "220px",
                    background: "radial-gradient(circle, rgba(180,255,159,0.25) 0%, transparent 70%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute",
                    left: "-40px",
                    bottom: "-40px",
                    width: "200px",
                    height: "200px",
                    background: "radial-gradient(circle, rgba(180,255,159,0.2) 0%, transparent 70%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                }} />
            </div>
        );
    }
);

CertificateView.displayName = "CertificateView";
export default CertificateView;

// ─── Dekorasi pojok ──────────────────────────────────────────────────────────
function LeafCorner({ style }: { style: React.CSSProperties }) {
    return (
        <div style={{ position: "absolute", ...style, width: 28, height: 28 }}>
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                <path d="M4 4 C4 4 14 4 24 14" stroke="#1A5C0A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                <path d="M4 4 C12 6 18 12 20 22" stroke="#1A5C0A" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
                <circle cx="4" cy="4" r="3" fill="#1A5C0A" opacity="0.5" />
            </svg>
        </div>
    );
}
