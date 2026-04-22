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
            title="Misi 1 - Sang Penyelidik"
            bgBtn="bg-[#B4FF9F]"
            textColor="text-[#1A5C0A]"
        />
        {children}
    </>;
}
