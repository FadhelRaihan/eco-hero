"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { DEMO_AUTH_USER } from "@/contexts/DemoContext";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
    id: string;
    full_name: string;
    email?: string;
    role: "guru" | "siswa";
    class_id?: string;
    class_name?: string;
    user_metadata?: any;
}

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    isDemoMode: boolean;
    logout: () => Promise<void>;
    loginUser: (user: AuthUser) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
    user: null,
    loading: true,
    isDemoMode: false,
    logout: async () => {},
    loginUser: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const demo = localStorage.getItem("eco_demo_mode") === "true";
        setIsDemoMode(demo);

        if (demo) {
            setUser(DEMO_AUTH_USER as AuthUser);
            setLoading(false);
            return;
        }

        const siswaSession = getCookie("siswa_session");
        const guruSession = getCookie("guru_session");

        if (siswaSession) {
            try { setUser(JSON.parse(siswaSession)); } catch {}
        } else if (guruSession) {
            try { setUser(JSON.parse(guruSession)); } catch {}
        }

        setLoading(false);
    }, []);

    const logout = useCallback(async () => {
        const demo = localStorage.getItem("eco_demo_mode") === "true";

        if (demo) {
            localStorage.removeItem("eco_demo_mode");
            document.cookie = "eco_demo_mode=; path=/; max-age=0";
            setUser(null);
            setIsDemoMode(false);
            router.push("/login/siswa");
            return;
        }

        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        router.push("/login/siswa");
        router.refresh();
    }, [router]);

    // Dipanggil dari halaman login setelah API berhasil
    // agar AuthContext langsung tau user tanpa perlu reload
    const loginUser = useCallback((newUser: AuthUser) => {
        setUser(newUser);
        setLoading(false);
        // Sync isDemoMode dari localStorage (sudah di-set sebelum loginUser dipanggil)
        const demo = typeof window !== "undefined"
            ? localStorage.getItem("eco_demo_mode") === "true"
            : false;
        setIsDemoMode(demo);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, isDemoMode, logout, loginUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
    return useContext(AuthContext);
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
}
