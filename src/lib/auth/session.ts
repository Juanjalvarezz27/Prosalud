import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "prosalud_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

export type SessionRole = "ADMIN" | "TRABAJADOR";

export interface SessionPayload {
  userId: string;
  role: SessionRole;
  tokenVersion: number;
  exp: number; // Unix timestamp en segundos
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET no está configurada o es demasiado corta.");
  }
  return secret;
}

function encodeBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decodeBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signData(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

// Firma un token de sesión con HMAC-SHA256
export function signSessionToken(
  data: Omit<SessionPayload, "exp">,
  ttlSeconds = SESSION_TTL_SECONDS
): string {
  const payload: SessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signData(encodedPayload, getAuthSecret());
  return `${encodedPayload}.${signature}`;
}

// Verifica firma y expiración del token de sesión en tiempo constante
export function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) return null;

  try {
    const expectedSignature = signData(encodedPayload, getAuthSecret());
    const providedBuf = Buffer.from(providedSignature, "utf8");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");

    if (
      providedBuf.length !== expectedBuf.length ||
      !timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return null;
    }

    const parsed = JSON.parse(decodeBase64Url(encodedPayload)) as Partial<SessionPayload>;
    if (
      typeof parsed.userId !== "string" ||
      (parsed.role !== "ADMIN" && parsed.role !== "TRABAJADOR") ||
      typeof parsed.tokenVersion !== "number" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    if (parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

// Evita redirecciones abiertas validando que el destino sea una ruta interna segura
export function sanitizeNextPath(nextPath?: string | null): string {
  if (!nextPath) return "/";
  const trimmed = nextPath.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return "/";
  }
  if (trimmed.startsWith("/login")) return "/";
  return trimmed;
}
