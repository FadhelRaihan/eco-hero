export const dynamic = "force-dynamic";

import TeacherSidebar from "@/components/guru/Sidebar";


export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7FFF4] flex">
      {/* Sidebar */}
      <div className="hidden lg:block shrink-0">
        <TeacherSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <main className="w-full h-full">{children}</main>
      </div>
    </div>
  );
}