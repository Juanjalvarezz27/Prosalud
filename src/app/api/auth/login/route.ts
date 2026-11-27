import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { MIN_PASSWORD_LENGTH, verifyPassword } from "@/src/lib/auth/password";
import { setSessionCookie } from "@/src/lib/auth/cookies";
import { sanitizeNextPath, signSessionToken } from "@/src/lib/auth/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: unknown;
      password?: unknown;
      next?: unknown;
    } | null;

    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const nextPath = sanitizeNextPath(
      typeof body?.next === "string" ? body.next : null
    );

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          error: "Correo electrónico inválido. Ingresa un correo con formato válido.",
          field: "email",
        },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Contraseña inválida. Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
          field: "password",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        tokenVersion: true,
      },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Credenciales inválidas. Verifica tu correo y contraseña." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          error: "Tu acceso está desactivado. Comunícate con la administración.",
        },
        { status: 403 }
      );
    }

    const token = signSessionToken({
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      redirectTo: nextPath,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No pudimos iniciar sesión en este momento. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
