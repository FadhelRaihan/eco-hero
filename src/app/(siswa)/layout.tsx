export const dynamic = "force-dynamic";

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <main className="">{children}</main>
    </div>
  );
}
