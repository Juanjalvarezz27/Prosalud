import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeNextPath,
  signSessionToken,
  verifySessionToken,
} from "../src/lib/auth/session.ts";

process.env.AUTH_SECRET = "test_secret_prosalud_al_menos_32_caracteres";

describe("Tokens de sesión HMAC (1.2)", () => {
  it("firma y verifica un token válido", () => {
    const token = signSessionToken({
      userId: "usr_123",
      role: "ADMIN",
      tokenVersion: 0,
    });

    const payload = verifySessionToken(token);
    assert.ok(payload);
    assert.equal(payload.userId, "usr_123");
    assert.equal(payload.role, "ADMIN");
    assert.equal(payload.tokenVersion, 0);
  });

  it("rechaza tokens alterados o expirados", () => {
    const token = signSessionToken({
      userId: "usr_123",
      role: "TRABAJADOR",
      tokenVersion: 1,
    });
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    assert.equal(verifySessionToken(tampered), null);

    const expired = signSessionToken(
      { userId: "usr_123", role: "ADMIN", tokenVersion: 0 },
      -10
    );
    assert.equal(verifySessionToken(expired), null);
  });

  it("sanitiza rutas de redirección post-login", () => {
    assert.equal(sanitizeNextPath("/productos"), "/productos");
    assert.equal(sanitizeNextPath("//evil.com"), "/");
    assert.equal(sanitizeNextPath("https://evil.com"), "/");
    assert.equal(sanitizeNextPath("/login"), "/");
  });
});
