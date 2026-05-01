import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FFF5] flex flex-col items-center justify-center p-4 relative">
      {/* Back to Landing Page */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-[#1A5C0A] font-extrabold hover:opacity-70 transition-all cursor-pointer z-50"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Beranda</span>
      </Link>

      <div className="w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}