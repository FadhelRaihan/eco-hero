import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format tanggal ke Bahasa Indonesia
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Generate Token untuk Siswa
export function generateToken(): string {
  return crypto.randomUUID();
}

// Hitung expired_at Token (default 8 jam)
export function getTokenExpiry(hours: number = 8): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

// Validasi Token
export function isTokenExpired(expiredAt: string | Date): boolean {
  return new Date() > new Date(expiredAt);
}
