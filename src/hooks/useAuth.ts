"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  id: string;
  full_name: string;
  role: "guru" | "siswa";
  class_id?: string;
  class_name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Baca dari cookie session 
    const siswaSession = getCookie("siswa_session");
    const guruSession = getCookie("guru_session");

    if (siswaSession) {
      setUser(JSON.parse(siswaSession));
    } else if (guruSession) {
      setUser(JSON.parse(guruSession));
    }

    setLoading(false);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login/siswa");
    router.refresh();
  }

  return { user, loading, logout };
}

// Helper baca cookie di client
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}