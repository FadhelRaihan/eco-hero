import Navbar from "@/components/shared/Navbar";

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="guru" />
      <main className="pt-16">{children}</main>
    </div>
  );
}