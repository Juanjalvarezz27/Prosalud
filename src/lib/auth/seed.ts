import { prisma } from "@/src/lib/prisma";
import { hashPassword, MIN_PASSWORD_LENGTH } from "./password";

// Crea el primer administrador si no existe ningún usuario ADMIN en la base de datos
export async function ensureInitialAdmin(): Promise<{
  created: boolean;
  email?: string;
}> {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });

  if (existingAdmin) {
    return { created: false, email: existingAdmin.email };
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = (process.env.ADMIN_NAME ?? "Administrador ProSalud").trim();

  if (!email || !password) {
    throw new Error(
      "Faltan ADMIN_EMAIL o ADMIN_PASSWORD en las variables de entorno para crear el primer administrador."
    );
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    );
  }

  const created = await prisma.user.create({
    data: {
      name: name.slice(0, 100),
      email,
      passwordHash: hashPassword(password),
      role: "ADMIN",
      isActive: true,
    },
    select: { email: true },
  });

  return { created: true, email: created.email };
}
