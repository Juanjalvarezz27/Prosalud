import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  type SessionRole,
  verifySessionToken,
} from "./session";
import {
  getPermissionDeniedMessage,
  hasPermission,
  type Permission,
} from "./permissions";

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

// Exige sesión y permiso específico R12 en Route Handlers (/api/*), devolviendo 403 si falla
export async function requireApiPermission(
  permission: Permission
): Promise<
  | { user: CurrentUser; errorResponse?: never }
  | { user?: never; errorResponse: NextResponse }
> {
  const auth = await requireApiUser();
  if (auth.errorResponse) {
    return auth;
  }

  if (!hasPermission(auth.user.role, permission)) {
    return {
      errorResponse: NextResponse.json(
        {
          error: getPermissionDeniedMessage(permission),
          code: "FORBIDDEN",
        },
        { status: 403 }
      ),
    };
  }

  return { user: auth.user };
}

// Verifica sesión y permiso en Server Components sin lanzar redirect; permite mostrar rechazo claro
export async function checkPagePermission(
  currentPath: string,
  permission: Permission
): Promise<{ user: CurrentUser; allowed: boolean; deniedMessage: string }> {
  const user = await requireUser(currentPath);
  const allowed = hasPermission(user.role, permission);
  return {
    user,
    allowed,
    deniedMessage: getPermissionDeniedMessage(permission),
  };
}
