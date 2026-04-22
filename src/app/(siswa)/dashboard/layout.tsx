import Navbar from "@/components/shared/Navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar role="siswa" />
            <div className="min-h-screen bg-[#F7FFF4] px-3 md:px-20 mx-auto">
                <main className="pb-20 pt-24 md:pb-0">{children}</main>
            </div>
        </>
    );
}
