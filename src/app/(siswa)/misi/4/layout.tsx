import Navbar from "@/components/shared/Navbar";

export default function Misi4Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar
                role="siswa"
                variant="misi"
                backUrl="/dashboard"
                title="Misi 4 - Pahlawan Bumi"
                bgBtn="bg-[#FFA1A1]"
                textColor="text-[#8A1A1A]"
            />
            {children}
        </>
    );
}
