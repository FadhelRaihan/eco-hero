/**
 * useAuth — backward-compatible re-export dari AuthContext.
 *
 * Semua komponen yang import { useAuth } dari "@/hooks/useAuth"
 * tetap berjalan tanpa perubahan apapun, namun sekarang
 * membaca dari satu shared AuthContext (bukan membuat
 * state sendiri-sendiri per komponen).
 */
export { useAuth } from "@/contexts/AuthContext";
export type { AuthUser } from "@/contexts/AuthContext";
