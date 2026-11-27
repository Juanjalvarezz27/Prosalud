import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getPermissionDeniedMessage,
  getRoleLabel,
  hasPermission,
  type Permission,
} from "../src/lib/auth/permissions.ts";

describe("Autorización por rol R12 (1.5)", () => {
  const adminOnlyActions: Permission[] = [
    "products:manage",
    "products:import",
    "clients:manage",
    "notes:void",
    "users:manage",
    "audit:read",
    "bcv:set_manual",
  ];

  const sharedActions: Permission[] = [
    "products:read",
    "clients:read",
    "clients:create",
    "quotes:create_edit",
    "quotes:convert",
    "payments:create",
    "discounts:apply",
    "stats:read",
  ];

  it("permite al ADMIN todas las acciones de R12", () => {
    for (const perm of [...adminOnlyActions, ...sharedActions]) {
      assert.equal(hasPermission("ADMIN", perm), true, `ADMIN debe poder ${perm}`);
    }
  });

  it("bloquea al TRABAJADOR en todas las acciones exclusivas de ADMIN", () => {
    for (const perm of adminOnlyActions) {
      assert.equal(
        hasPermission("TRABAJADOR", perm),
        false,
        `TRABAJADOR no debe poder ${perm}`
      );
      assert.ok(getPermissionDeniedMessage(perm).length > 10);
    }
  });

  it("permite al TRABAJADOR sus acciones operativas (incluyendo S7 y S8)", () => {
    for (const perm of sharedActions) {
      assert.equal(
        hasPermission("TRABAJADOR", perm),
        true,
        `TRABAJADOR debe poder ${perm}`
      );
    }
  });

  it("devuelve etiquetas legibles por rol en español", () => {
    assert.equal(getRoleLabel("ADMIN"), "Administrador");
    assert.equal(getRoleLabel("TRABAJADOR"), "Trabajador");
  });
});
