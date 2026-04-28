"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DEMO_USER } from "@/lib/demo/mockData";

// ─── TYPES ────────────────────────────────────────────────────
interface DemoContextValue {
    isDemoMode: boolean;
    enableDemo: () => void;
    disableDemo: () => void;
}

// ─── CONTEXT ──────────────────────────────────────────────────
const DemoContext = createContext<DemoContextValue>({
    isDemoMode: false,
    enableDemo: () => {},
    disableDemo: () => {},
});

// ─── PROVIDER ─────────────────────────────────────────────────
export function DemoProvider({ children }: { children: ReactNode }) {
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Sinkronisasi dari localStorage saat mount
    useEffect(() => {
        const stored = localStorage.getItem("eco_demo_mode");
        if (stored === "true") setIsDemoMode(true);
    }, []);

    const enableDemo = () => {
        localStorage.setItem("eco_demo_mode", "true");
        setIsDemoMode(true);
    };

    const disableDemo = () => {
        localStorage.removeItem("eco_demo_mode");
        setIsDemoMode(false);
    };

    return (
        <DemoContext.Provider value={{ isDemoMode, enableDemo, disableDemo }}>
            {children}
        </DemoContext.Provider>
    );
}

// ─── HOOK ─────────────────────────────────────────────────────
export function useDemoMode() {
    return useContext(DemoContext);
}

// ─── HELPER: DEMO USER untuk useAuth ──────────────────────────
/**
 * Gunakan ini di useAuth.ts untuk mengembalikan demo user
 * saat isDemoMode === true, alih-alih membaca dari cookie.
 *
 * Contoh penggunaan:
 *   const isDemoMode = localStorage.getItem("eco_demo_mode") === "true";
 *   if (isDemoMode) { setUser(DEMO_AUTH_USER); return; }
 */
export const DEMO_AUTH_USER = DEMO_USER;
