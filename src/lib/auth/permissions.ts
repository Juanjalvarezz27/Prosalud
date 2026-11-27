import type { SessionRole } from "./session";

// Acciones de la tabla de permisos R12 (fuente de verdad)
export type Permission =
  | "products:read"
  | "products:manage"
  | "products:import"
  | "clients:read"
  | "clients:create"
  | "clients:manage"
  | "quotes:create_edit"
  | "quotes:convert"
  | "payments:create"
  | "discounts:apply"
  | "notes:void"
  | "users:manage"
  | "audit:read"
  | "bcv:set_manual"
  | "stats:read";

const PERMISSION_MATRIX: Record<Permission, readonly SessionRole[]> = {
  "products:read": ["ADMIN", "TRABAJADOR"],
  "products:manage": ["ADMIN"],
  "products:import": ["ADMIN"],
  "clients:read": ["ADMIN", "TRABAJADOR"],
  "clients:create": ["ADMIN", "TRABAJADOR"], // S7
  "clients:manage": ["ADMIN"], // S7: trabajador no edita ni elimina
  "quotes:create_edit": ["ADMIN", "TRABAJADOR"],
  "quotes:convert": ["ADMIN", "TRABAJADOR"],
  "payments:create": ["ADMIN", "TRABAJADOR"], // S7
  "discounts:apply": ["ADMIN", "TRABAJADOR"],
  "notes:void": ["ADMIN"],
  "users:manage": ["ADMIN"],
  "audit:read": ["ADMIN"],
  "bcv:set_manual": ["ADMIN"],
  "stats:read": ["ADMIN", "TRABAJADOR"], // S8: solo lectura para trabajador
};

const PERMISSION_DENIED_MESSAGES: Partial<Record<Permission, string>> = {
  "products:manage": "Solo el administrador puede crear, editar o desactivar productos y categorías.",
  "products:import": "Solo el administrador puede importar o actualizar precios por Excel.",
  "clients:manage": "Solo el administrador puede editar o desactivar clientes.",
  "notes:void": "No tienes permiso para anular notas de entrega.",
  "users:manage": "Solo el administrador puede gestionar usuarios.",
  "audit:read": "Solo el administrador puede consultar el registro de auditoría.",
  "bcv:set_manual": "Solo el administrador puede fijar la tasa BCV manualmente.",
};

export function hasPermission(role: SessionRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[permission].includes(role);
}

export function isAdminRole(role: SessionRole): boolean {
  return role === "ADMIN";
}

export function getRoleLabel(role: SessionRole): string {
  return role === "ADMIN" ? "Administrador" : "Trabajador";
}

export function getPermissionDeniedMessage(permission?: Permission): string {
  if (permission && PERMISSION_DENIED_MESSAGES[permission]) {
    return PERMISSION_DENIED_MESSAGES[permission]!;
  }
  return "No tienes permiso para realizar esta acción.";
}
