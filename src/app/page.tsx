import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  const cookieStore = await cookies();
  const siswaToken = cookieStore.get("siswa_token");
  const guruToken = cookieStore.get("guru_token");

  if (siswaToken) redirect("/dashboard");
  if (guruToken) redirect("/guru/dashboard");

  redirect("/login/siswa");
}