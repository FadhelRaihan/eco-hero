"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGallery, GalleryItem, Comment } from "@/hooks/useGallery";
import { 
    Heart, MessageCircle, Send, Loader2, 
    Image as ImageIcon, Video, FileText, 
    ArrowLeft, X, SendHorizonal, 
    Search, Filter, PartyPopper, ChevronRight, Download,
    GalleryHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function GaleriPage() {
    const { user } = useAuth();
    const { items, loading, toggleLike, fetchComments, addComment, registerOpenDialog } = useGallery(user?.class_id, user?.id);
    
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const openDetail = async (item: GalleryItem) => {
        setSelectedItem(item);
        setLoadingComments(true);
        const data = await fetchComments(item.id);
        setComments(data);
        setLoadingComments(false);
        // Daftarkan dialog ini ke Realtime agar komentar dari user lain masuk
        registerOpenDialog(item.id, setComments);
    };

    const closeDetail = () => {
        setSelectedItem(null);
        registerOpenDialog(null, null);
    };

    const formatTime = (dateStr: string) => {
        try {
            if (!dateStr) return "";
            const cleanDateStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
            const finalDateStr = cleanDateStr.endsWith('Z') || cleanDateStr.includes('+') 
                ? cleanDateStr 
                : cleanDateStr + 'Z';
            return formatDistanceToNow(new Date(finalDateStr), { addSuffix: true, locale: id });
        } catch (err) {
            return "Baru saja";
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !newComment.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        const added = await addComment(selectedItem.id, newComment);
        if (added) {
            setComments(prev => [...prev, added]);
            setNewComment("");
        }
        setIsSubmittingComment(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF1]">
            {/* Header */}
            <div className="px-4 md:px-8 lg:px-26 pt-20 lg:pt-24 pb-12 bg-[#B4FF9F]">
                <p className="text-[10px] font-bold text-[#1A5C0A] uppercase tracking-widest mb-3">
                    Inspirasi · Aksi Nyata
                </p>
                <h1 className="text-xl lg:text-3xl font-extrabold text-[#1A5C0A] flex items-center gap-3 mb-3">
                    <span className="text-3xl"><PartyPopper className="w-6 h-6 lg:w-8 lg:h-8" /></span> Galeri Karya Pahlawan
                </h1>
                <p className="text-xs lg:text-sm text-[#1A5C0A]/70 leading-relaxed mb-6 max-w-lg font-medium">
                    Lihat bagaimana teman-temanmu membuat perubahan nyata untuk lingkungan kita. Berikan apresiasi dan inspirasi!
                </p>
                
                <div className="flex gap-3 flex-wrap">
                    <div className="bg-white/50 backdrop-blur-sm border border-[#1A5C0A]/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <GalleryHorizontal className="w-4 h-4 text-[#1A5C0A]" />
                        <span className="text-xs font-bold text-[#1A5C0A]">{items.length} Karya</span>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 px-4 md:px-8 lg:px-26 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 text-[#1A5C0A] animate-spin" />
                        <p className="text-sm font-bold text-[#1A5C0A]/50">Menyiapkan pameran karya...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 opacity-50">
                            <ImageIcon size={32} className="text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-500">Belum ada karya yang dipajang</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs">Ayo selesaikan Misi 4 dan jadilah yang pertama muncul di galeri!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div 
                                key={item.id}
                                className="group bg-white rounded-2xl overflow-hidden border border-[#1A5C0A]/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                {/* Media Preview */}
                                <div 
                                    className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
                                    onClick={() => openDetail(item)}
                                >
                                    {item.media_type === "foto" && (
                                        <img src={item.cloudinary_url} alt={item.team_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    )}
                                    {item.media_type === "video" && (
                                        <div className="w-full h-full relative">
                                            <video src={item.cloudinary_url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 text-white">
                                                    <Video size={24} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {item.media_type === "pdf" && (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#f8fff4] group-hover:bg-[#f0ffec] transition-colors gap-3">
                                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm text-[#1A5C0A]">
                                                <FileText size={32} />
                                            </div>
                                            <span className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-widest">Document</span>
                                        </div>
                                    )}

                                    {/* Overlay Info (Top) */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-white/90 backdrop-blur-md text-[#1A5C0A] text-[9px] font-black px-2.5 py-1 rounded-full uppercase border border-[#1A5C0A]/5">
                                            {item.selected_case.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-extrabold text-[#333] text-sm line-clamp-1">{item.team_name}</h3>
                                        <span className="text-[9px] font-bold text-gray-400">
                                            {formatTime(item.uploaded_at)}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-500 line-clamp-2 mb-5 font-medium leading-relaxed italic">
                                        "{item.caption || "Aksi nyata tim kami untuk lingkungan yang lebih baik"}"
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }}
                                                className={`flex items-center gap-1.5 transition-all active:scale-90 ${item.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                            >
                                                <Heart size={18} fill={item.is_liked ? "currentColor" : "none"} className={item.is_liked ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" : ""} />
                                                <span className="text-xs font-black">{item.like_count}</span>
                                            </button>
                                            <button 
                                                onClick={() => openDetail(item)}
                                                className="flex items-center gap-1.5 text-gray-400 hover:text-[#1A5C0A] transition-all"
                                            >
                                                <MessageCircle size={18} />
                                                <span className="text-xs font-black">{item.comment_count}</span>
                                            </button>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="w-8 h-8 rounded-full text-[#1A5C0A] hover:bg-[#B4FF9F]/20 cursor-pointer"
                                            onClick={() => openDetail(item)}
                                        >
                                            <ChevronRight size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && closeDetail()}>
                <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[92vh] w-[95vw] md:w-full">
                    {selectedItem && (
                        <>
                            {/* Top: Media */}
                            <div className="w-full h-[40vh] md:h-[25vh] bg-[#0a0a0a] flex items-center justify-center relative group/media flex-shrink-0">
                                {selectedItem.media_type === "foto" && (
                                    <img src={selectedItem.cloudinary_url} alt={selectedItem.team_name} className="max-w-full max-h-full object-contain" />
                                )}
                                {selectedItem.media_type === "video" && (
                                    <video src={selectedItem.cloudinary_url} controls className="w-full max-h-full" />
                                )}
                                {selectedItem.media_type === "pdf" && (
                                    <div className="flex flex-col items-center gap-6 text-white text-center p-8">
                                        <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl text-[#B4FF9F]">
                                            <FileText size={48} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-2">Dokumentasi PDF</h4>
                                            <p className="text-sm text-white/50 mb-6">Klik tombol di bawah untuk melihat dokumen lengkap</p>
                                            <a 
                                                href={selectedItem.cloudinary_url} 
                                                target="_blank" 
                                                className="flex items-center gap-2 bg-[#B4FF9F] text-[#1A5C0A] px-8 py-3 rounded-2xl font-black hover:bg-[#9ded88] transition-all active:scale-95"
                                            >
                                                <Download size={20} /> Lihat Dokumen
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom: Info & Comments */}
                            <div className="w-full flex flex-col bg-white flex-1 min-h-0">
                                <div className="p-4 md:p-6 border-b border-gray-50 bg-[#FFFDF1]/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-[#1A5C0A] uppercase tracking-widest mb-1">Tim Beraksi</span>
                                            <DialogTitle className="text-xl font-black text-[#333] leading-tight">{selectedItem.team_name}</DialogTitle>
                                            <DialogDescription className="sr-only">
                                                Detail dokumentasi aksi nyata dari {selectedItem.team_name}
                                            </DialogDescription>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#B4FF9F]/20 rounded-xl p-3 md:p-4 border border-[#B4FF9F]/30">
                                        <p className="text-xs text-[#1A5C0A] leading-relaxed font-medium italic">
                                            "{selectedItem.caption || "Aksi nyata tim kami untuk lingkungan yang lebih baik"}"
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-6 mt-4 md:mt-5">
                                        <button 
                                            onClick={() => toggleLike(selectedItem.id)}
                                            className={`flex items-center gap-2 transition-all ${selectedItem.is_liked ? 'text-red-500' : 'text-gray-400'}`}
                                        >
                                            <Heart size={20} fill={selectedItem.is_liked ? "currentColor" : "none"} />
                                            <span className="text-sm font-black">{selectedItem.like_count}</span>
                                        </button>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MessageCircle size={20} />
                                            <span className="text-sm font-black">{selectedItem.comment_count}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments List */}
                                <div className="flex-1 overflow-y-auto px-5 md:px-8 py-4 md:py-6 space-y-6 scrollbar-hide bg-white">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Apresiasi & Komentar</h3>
                                    {loadingComments ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="animate-spin text-gray-200" />
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="py-10 text-center flex flex-col items-center gap-2 opacity-30">
                                            <MessageCircle size={32} />
                                            <p className="text-xs font-bold">Belum ada komentar</p>
                                        </div>
                                    ) : (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="w-9 h-9 rounded-full bg-[#B4FF9F] flex items-center justify-center text-[10px] font-black text-[#1A5C0A] flex-shrink-0 shadow-sm">
                                                    {comment.users.full_name[0]}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-black text-[#333]">{comment.users.full_name}</span>
                                                        <span className="text-[9px] text-gray-400">
                                                            {formatTime(comment.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] text-gray-700 bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 leading-relaxed font-medium">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Comment Input */}
                                <form onSubmit={handleAddComment} className="p-4 md:p-6 border-t border-gray-50 bg-white">
                                    <div className="relative group">
                                        <Input 
                                            placeholder="Tulis apresiasi..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="pr-12 py-5 md:py-6 rounded-xl border-gray-100 focus:border-[#B4FF9F] focus:ring-0 transition-all bg-gray-50 group-focus-within:bg-white text-xs font-medium"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!newComment.trim() || isSubmittingComment}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#B4FF9F] text-[#1A5C0A] rounded-xl flex items-center justify-center hover:bg-[#9ded88] transition-all disabled:opacity-30 disabled:grayscale cursor-pointer"
                                        >
                                            {isSubmittingComment ? <Loader2 size={16} className="animate-spin" /> : <SendHorizonal size={16} />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
