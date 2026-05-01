"use client";

import { useState } from "react";
import TeacherSidebar from "@/components/guru/Sidebar";
import GuruNavbar from "@/components/guru/Navbar";

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7FFF4]">
      {/* Mobile Navbar */}
      <GuruNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex">
        {/* Sidebar */}
        <TeacherSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)] lg:min-h-screen min-w-0 max-w-full overflow-x-hidden">
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