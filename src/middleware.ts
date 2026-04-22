import { NextRequest, NextResponse } from "next/server";

const SISWA_ROUTES = ["/dashboard", "/misi", "/galeri"];
const GURU_ROUTES = ["/guru"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const siswaToken = request.cookies.get("siswa_token")?.value;
    const guruToken = request.cookies.get("guru_token")?.value;

    // Proteksi route Siswa
    const isSiswaRoute = SISWA_ROUTES.some((route) =>
        pathname.startsWith(route)
    );
    if (isSiswaRoute && !siswaToken) {
        return NextResponse.redirect(new URL("/login/siswa", request.url));
    }

    // Proteksi route Guru
    const isGuruRoute = GURU_ROUTES.some((route) =>
        pathname.startsWith(route)
    );
    if (isGuruRoute && !guruToken) {
        return NextResponse.redirect(new URL("/login/guru", request.url));
    }

    // Redirect ke halaman dashboard jika sudah login
    if (pathname === "/login/siswa" && siswaToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/login/guru" && guruToken) {
        return NextResponse.redirect(new URL("/guru/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api).*)",
    ],
};