"use client";

import { useState, useSyncExternalStore } from "react";
import { FlaskConical } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TeacherSidebar from "@/components/guru/Sidebar";
import GuruNavbar from "@/components/guru/Navbar";

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const isDemoMode = useSyncExternalStore(
    () => () => {}, // Tidak butuh subscribe karena demo mode biasanya tetap selama sesi
    () => typeof window !== "undefined" ? localStorage.getItem("eco_guru_demo_mode") === "true" : false,
    () => false // Nilai default di Server (SSR)
  );

  return (
    <div className="min-h-screen bg-[#F7FFF4]">
      {/* ── DEMO MODE BANNER ───────────────────────────── */}
      {isDemoMode && (
          <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 bg-[#F9FFA4] border-b border-[#DECC18]/50 py-1.5 px-4 h-8">
              <FlaskConical size={13} className="text-[#7A6200]" />
              <p className="text-[10px] font-black text-[#7A6200] uppercase tracking-widest">
                  Mode Demo Guru Aktif — Data tidak tersimpan
              </p>
              <button
                  onClick={logout}
                  className="text-[9px] font-black text-[#7A6200] underline underline-offset-2 hover:opacity-70 transition-opacity cursor-pointer ml-1"
              >
                  Keluar Demo
              </button>
          </div>
      )}

      {/* Mobile Navbar */}
      <div className={isDemoMode ? "pt-8" : ""}>
        <GuruNavbar onMenuClick={() => setIsSidebarOpen(true)} />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={isDemoMode ? "lg:pt-8" : ""}>
            <TeacherSidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
        </div>

        {/* Main Content */}
        <div className={`flex-1 lg:ml-64 min-h-[calc(100vh-4rem)] lg:min-h-screen min-w-0 max-w-full overflow-x-hidden ${isDemoMode ? "pt-8" : ""}`}>
          <main className="w-full h-full p-2 md:p-8">
            <div className="max-w-full overflow-x-auto md:overflow-x-visible">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}