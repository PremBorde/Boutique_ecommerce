import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Guard Admin API endpoints (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "zaria-super-secret-luxury-pret-key-2026",
    });

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please log in as an administrator." },
        { status: 401 }
      );
    }

    if (token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Administrative privileges are required." },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // 2. Guard Admin dashboard pages (/admin/*)
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "zaria-super-secret-luxury-pret-key-2026",
    });

    if (!token) {
      const loginUrl = new URL("/account", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("error", "AdminLoginRequired");
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "ADMIN") {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
