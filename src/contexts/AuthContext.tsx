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
    username: string;
    email?: string;
    role: "guru" | "siswa" | "admin";
    class_id?: string;
    class_name?: string;
    user_metadata?: Record<string, unknown>;
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
        const initializeAuth = () => {
            const demo = localStorage.getItem("eco_demo_mode") === "true";
            const siswaSession = getCookie("siswa_session");
            const guruSession = getCookie("guru_session");

            let initialUser: AuthUser | null = null;

            if (demo) {
                initialUser = DEMO_AUTH_USER as AuthUser;
            } else if (siswaSession) {
                try {
                    initialUser = JSON.parse(siswaSession);
                } catch (e) {
                    console.error("Failed to parse siswa session", e);
                }
            } else if (guruSession) {
                try {
                    initialUser = JSON.parse(guruSession);
                } catch (e) {
                    console.error("Failed to parse guru session", e);
                }
            }

            setIsDemoMode(demo);
            setUser(initialUser);
            setLoading(false);
        };

        const timer = setTimeout(initializeAuth, 0);
        return () => clearTimeout(timer);
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
