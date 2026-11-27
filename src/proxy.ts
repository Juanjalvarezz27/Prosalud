import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/src/lib/auth/session";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/auth/logout"];

function isPublicAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$/i.test(pathname)
  );
}

// Protección optimista de rutas en Next.js 16 (la verificación real corre en servidor/DB)
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (!hasSessionCookie) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para continuar." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    const fullPath = `${pathname}${search}`;
    if (fullPath && fullPath !== "/") {
      loginUrl.searchParams.set("next", fullPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
