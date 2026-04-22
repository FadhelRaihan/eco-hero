import Navbar from "@/components/shared/Navbar";

export default function GaleriLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar role="siswa" />
            {children}
        </>
    );
}
