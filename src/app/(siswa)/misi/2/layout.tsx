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
            title="Misi 2 - Arsitek Solusi"
            bgBtn="bg-[#F9FFA4]"
            textColor="text-[#7A6200]"
        />
        {children}
    </>;
}
