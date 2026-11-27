import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  type SessionRole,
  verifySessionToken,
} from "./session";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: SessionRole;
}

// Obtiene el usuario autenticado validando firma HMAC, estado activo y tokenVersion en DB
export async function getCurrentUser(): Promise<CurrentUser | null> {
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      tokenVersion: true,
    },
  });

  if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Exige sesión válida en Server Components y redirige a /login conservando destino
export async function requireUser(currentPath = "/"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const loginUrl =
      currentPath && currentPath !== "/"
        ? `/login?next=${encodeURIComponent(currentPath)}`
        : "/login";
    redirect(loginUrl);
  }
  return user;
}

// Exige sesión válida en Route Handlers (/api/*)
export async function requireApiUser(): Promise<
  | { user: CurrentUser; errorResponse?: never }
  | { user?: never; errorResponse: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Sesión no válida o expirada. Inicia sesión nuevamente." },
        { status: 401 }
      ),
    };
  }
  return { user };
}
