import Navbar from "@/components/shared/Navbar";

export default function GaleriLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar 
                role="siswa" 
                backUrl="/dashboard" 
                title="Galeri Karya Pahlawan" 
                bgBtn="bg-[#B4FF9F]" 
                textColor="text-[#1A5C0A]" 
            />
            {children}
        </>
    );
}
