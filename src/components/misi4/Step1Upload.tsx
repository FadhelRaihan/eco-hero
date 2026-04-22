"use client";

import { useState } from "react";
import { Upload, Loader2, Trash2, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
    url: string;
    type: "foto" | "video" | "pdf";
    caption?: string;
}

interface Step1UploadProps {
    onSave: (files: { cloudinary_url: string; media_type: "foto" | "video" | "pdf"; caption?: string }[]) => Promise<void>;
    loading: boolean;
}

export default function Step1Upload({ onSave, loading }: Step1UploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

            if (!cloudName) throw new Error("Cloud Name belum dikonfigurasi");

            const newFiles: UploadedFile[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 50 * 1024 * 1024) {
                    alert(`File ${file.name} terlalu besar (>50MB).`);
                    continue;
                }

                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", uploadPreset);
                formData.append("folder", "eco-hero/mission4");

                let resourceType = "image";
                if (file.type.includes("video")) resourceType = "video";
                if (file.type === "application/pdf") resourceType = "image";

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
                    { method: "POST", body: formData }
                );

                const result = await res.json();
                if (!res.ok) throw new Error(result.error?.message || "Gagal upload");

                let type: "foto" | "video" | "pdf" = "foto";
                if (file.type.includes("video")) type = "video";
                if (file.type === "application/pdf") type = "pdf";

                newFiles.push({
                    url: result.secure_url,
                    type: type,
                    caption: ""
                });
            }

            setUploadedFiles(prev => [...prev, ...newFiles]);
        } catch (err: any) {
            console.error("Upload error:", err);
            alert("Gagal upload: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const updateFileCaption = (index: number, caption: string) => {
        setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, caption } : f));
    };

    const handleSave = async () => {
        if (uploadedFiles.length === 0) return;
        
        const filesToUpload = uploadedFiles.map(f => ({
            cloudinary_url: f.url,
            media_type: f.type,
            caption: f.caption
        }));

        await onSave(filesToUpload);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFAFAF] flex items-center justify-center text-[#7A2A2A] font-extrabold text-lg">
                    1
                </div>
                <h2 className="text-md font-bold text-[#333333] uppercase tracking-wide">
                    UPLOAD DOKUMENTASI TIM
                </h2>
            </div>

            <div className="space-y-6">
                <div className="bg-white border-2 border-dashed border-[#FFAFAF] rounded-3xl p-8 text-center flex flex-col items-center gap-4 transition-all hover:bg-[#FFF5F5]">
                    <div className="w-12 h-12 bg-[#FFF0F0] rounded-2xl flex items-center justify-center text-[#7A2A2A]">
                        <Upload size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#333]">Tambah foto, video, atau PDF</h3>
                        <p className="text-xs text-gray-500">Maks. 50MB per file</p>
                    </div>
                    <label className="bg-[#FFAFAF] hover:bg-[#FF8A8A] text-white font-bold px-6 py-2 rounded-xl cursor-pointer transition-all">
                        {isUploading ? <Loader2 className="animate-spin" /> : "Pilih File"}
                        <input type="file" multiple className="hidden" accept="image/*,video/*,application/pdf" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                </div>

                {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                                <div className="relative aspect-video bg-black flex items-center justify-center">
                                    {file.type === "foto" && <img src={file.url} className="w-full h-full object-cover" />}
                                    {file.type === "video" && <video src={file.url} className="w-full h-full" />}
                                    {file.type === "pdf" && <FileText className="text-[#FFAFAF]" size={48} />}
                                    
                                    <button 
                                        onClick={() => removeFile(idx)}
                                        className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-red-500 hover:bg-white shadow-sm transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="p-3">
                                    <input 
                                        placeholder="Tambah keterangan..."
                                        value={file.caption}
                                        onChange={(e) => updateFileCaption(idx, e.target.value)}
                                        className="w-full text-xs font-medium border-none focus:ring-0 p-0 placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {uploadedFiles.length > 0 && (
                    <div className="flex justify-center">
                        <Button 
                            onClick={handleSave}
                            disabled={loading || isUploading}
                            className="bg-[#FFAFAF] hover:bg-[#FF8A8A] border border-[#7A2A2A]/20 text-[#7A2A2A] font-bold px-8 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Simpan & Lanjut"} <ChevronRight size={16} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
