import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const { Client } = pg;

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `${salt}:${derived.toString("hex")}`;
}

function generateId() {
  return `adm_${randomBytes(12).toString("hex")}`;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está definida en .env");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = (process.env.ADMIN_NAME ?? "Administrador ProSalud").trim().slice(0, 100);

  if (!email || !password) {
    throw new Error(
      "Define ADMIN_EMAIL y ADMIN_PASSWORD en .env antes de ejecutar db:seed."
    );
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres (R18).");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const existing = await client.query(
      `SELECT id, email, role, "isActive" FROM "User" WHERE role = 'ADMIN' LIMIT 1`
    );

    if (existing.rowCount && existing.rowCount > 0) {
      console.log(
        JSON.stringify({
          ok: true,
          created: false,
          adminEmail: existing.rows[0].email,
        })
      );
      return;
    }

    const passwordHash = hashPassword(password);
    const id = generateId();

    const inserted = await client.query(
      `INSERT INTO "User" (id, name, email, "passwordHash", role, "isActive", "tokenVersion", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'ADMIN', true, 0, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, role`,
      [id, name, email, passwordHash]
    );

    console.log(
      JSON.stringify({
        ok: true,
        created: inserted.rowCount === 1,
        adminEmail: inserted.rows[0]?.email ?? email,
      })
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Error en seed-admin:", err.message);
  process.exit(1);
});
