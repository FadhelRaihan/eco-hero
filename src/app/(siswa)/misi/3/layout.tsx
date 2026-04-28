import Navbar from "@/components/shared/Navbar";

export default function Misi1Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>
        <Navbar
            role="siswa"
            variant="misi"
            backUrl="/dashboard"
            title="Misi 3 - Pengatur Waktu"
            bgBtn="bg-[#FFD59E]"
            textColor="text-[#6B3A00]"
        />
        {children}
    </>;
}
