import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  MIN_PASSWORD_LENGTH,
  verifyPassword,
} from "../src/lib/auth/password.ts";

describe("Hashing de contraseñas (1.1 / R18)", () => {
  it("genera hashes con salt único y verifica correctamente", () => {
    const hashA = hashPassword("ClaveSegura123");
    const hashB = hashPassword("ClaveSegura123");

    assert.notEqual(hashA, hashB);
    assert.equal(verifyPassword("ClaveSegura123", hashA), true);
    assert.equal(verifyPassword("OtraClave123", hashA), false);
    assert.equal(verifyPassword("ClaveSegura123", "formato-invalido"), false);
  });

  it(`rechaza contraseñas menores a ${MIN_PASSWORD_LENGTH} caracteres (R18)`, () => {
    assert.throws(() => hashPassword("1234567"));
  });
});
