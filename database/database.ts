/**
 * Capa de acceso a datos usando Turso/LibSQL.
 * Comparte la misma base de datos que la app web finance-tracker.
 *
 * Conversión de montos: Turso guarda en CENTAVOS (INTEGER).
 * Al leer  → dividir entre 100
 * Al guardar → multiplicar por 100 y redondear
 */

import type { Card } from '@/types/card';
import type { Category, Transaction } from '@/types/transaction';
import { turso } from './turso';

// ─── INIT ─────────────────────────────────────────────────────────────────────
// No necesitamos crear tablas — ya existen en Turso (gestionadas por la web app).
export async function initDatabase(): Promise<void> {
  // Verifica conexión con una query simple
  await turso.execute('SELECT 1');

  // Asegurar que la columna initialBalance exista en Account
  try {
    await turso.execute(`ALTER TABLE "Account" ADD COLUMN "initialBalance" INTEGER NOT NULL DEFAULT 0`);
  } catch (err: any) {
    const msg = String(err?.message ?? '').toLowerCase();
    if (!msg.includes('duplicate column') && !msg.includes('already exists')) {
      throw err;
    }
  }

  // Asegurar que la columna deletedAt exista en Transaction
  try {
    await turso.execute(`ALTER TABLE "Transaction" ADD COLUMN "deletedAt" TEXT`);
  } catch (err: any) {
    const msg = String(err?.message ?? '').toLowerCase();
    if (!msg.includes('duplicate column') && !msg.includes('already exists')) {
      throw err;
    }
  }
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

const SYSTEM_CATEGORIES = [
  { id: 'cat_sys_alimentacion',    name: 'Alimentación',    icon: 'restaurant-outline',        color: '#FF6B6B' },
  { id: 'cat_sys_transporte',      name: 'Transporte',      icon: 'car-outline',               color: '#4ECDC4' },
  { id: 'cat_sys_vivienda',        name: 'Vivienda',        icon: 'home-outline',              color: '#45B7D1' },
  { id: 'cat_sys_salud',           name: 'Salud',           icon: 'medical-outline',           color: '#96CEB4' },
  { id: 'cat_sys_entretenimiento', name: 'Entretenimiento', icon: 'game-controller-outline',   color: '#FFEAA7' },
  { id: 'cat_sys_educacion',       name: 'Educación',       icon: 'school-outline',            color: '#DDA0DD' },
  { id: 'cat_sys_ropa',            name: 'Ropa',            icon: 'shirt-outline',             color: '#F0A500' },
  { id: 'cat_sys_tecnologia',      name: 'Tecnología',      icon: 'laptop-outline',            color: '#6C5CE7' },
  { id: 'cat_sys_servicios',       name: 'Servicios',       icon: 'construct-outline',         color: '#A29BFE' },
  { id: 'cat_sys_otros',           name: 'Otros',           icon: 'ellipse-outline',           color: '#B2BEC3' },
  { id: 'cat_sys_prestamo',        name: 'Préstamo',        icon: 'cash-outline',              color: '#00B894' },
  { id: 'cat_sys_deuda',           name: 'Deuda',           icon: 'trending-down-outline',     color: '#E17055' },
];

async function seedSystemCategories(): Promise<void> {
  const result = await turso.execute(
    `SELECT COUNT(*) AS count FROM "Category" WHERE "isSystem" = 1`
  );
  const count = Number(result.rows[0]?.count ?? 0);
  if (count > 0) return;

  for (const cat of SYSTEM_CATEGORIES) {
    await turso.execute({
      sql: `INSERT OR IGNORE INTO "Category" (id, name, icon, color, "isSystem", "userId") VALUES (?, ?, ?, ?, 1, NULL)`,
      args: [cat.id, cat.name, cat.icon, cat.color],
    });
  }
}

export async function getAllCategories(userId: string): Promise<Category[]> {
  await seedSystemCategories();

  const result = await turso.execute({
    sql: `SELECT * FROM "Category"
          WHERE "isSystem" = 1 OR "userId" = ?
          ORDER BY name ASC`,
    args: [userId],
  });
  return result.rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    color: String(r.color),
    icon: String(r.icon),
    isSystem: Boolean(r.isSystem),
    userId: r.userId ? String(r.userId) : null,
  }));
}

export async function insertCategory(
  category: Omit<Category, 'id' | 'isSystem'>,
): Promise<void> {
  const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await turso.execute({
    sql: `INSERT INTO "Category" (id, name, icon, color, "isSystem", "userId") VALUES (?, ?, ?, ?, 0, ?)`,
    args: [id, category.name, category.icon, category.color, category.userId],
  });
}

export async function countTransactionsByCategoryId(categoryId: string, userId: string): Promise<number> {
  const result = await turso.execute({
    sql: `SELECT COUNT(*) AS cnt FROM "Transaction" WHERE "categoryId" = ? AND "userId" = ? AND "deletedAt" IS NULL`,
    args: [categoryId, userId],
  });
  return Number(result.rows[0].cnt);
}

export async function deleteCategory(id: string, userId: string): Promise<void> {
  // Check if it's a system category
  const catResult = await turso.execute({
    sql: `SELECT "isSystem" FROM "Category" WHERE id = ?`,
    args: [id],
  });
  if (catResult.rows.length > 0 && Number(catResult.rows[0].isSystem) === 1) {
    throw new Error('No se puede eliminar una categoría del sistema.');
  }

  // Check for associated transactions
  const count = await countTransactionsByCategoryId(id, userId);
  if (count > 0) {
    throw new Error(`No se puede eliminar la categoría porque tiene ${count} transacción(es) asociada(s).`);
  }

  await turso.execute({
    sql: `DELETE FROM "Category" WHERE id = ? AND "userId" = ? AND "isSystem" = 0`,
    args: [id, userId],
  });
}

// ─── CUENTAS (Cards) ──────────────────────────────────────────────────────────

export async function getAllCards(userId: string): Promise<Card[]> {
  const result = await turso.execute({
    sql: `SELECT * FROM "Account" WHERE "userId" = ? ORDER BY name ASC`,
    args: [userId],
  });
  return result.rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    type: String(r.type) as Card['type'],
    color: String(r.color ?? '#4f46e5'),
    userId: String(r.userId),
    initialBalance: Number(r.initialBalance ?? 0) / 100, // centavos → pesos
  }));
}

export async function insertCard(card: Omit<Card, 'id'>): Promise<void> {
  const id = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const initialBalanceCents = Math.round(card.initialBalance * 100);
  await turso.execute({
    sql: `INSERT INTO "Account" (id, name, type, color, "userId", "initialBalance") VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, card.name, card.type, card.color, card.userId, initialBalanceCents],
  });
}

export async function updateCard(card: Card): Promise<void> {
  const initialBalanceCents = Math.round(card.initialBalance * 100);
  await turso.execute({
    sql: `UPDATE "Account" SET name = ?, type = ?, color = ?, "initialBalance" = ? WHERE id = ? AND "userId" = ?`,
    args: [card.name, card.type, card.color, initialBalanceCents, card.id, card.userId],
  });
}

export async function countTransactionsByAccountId(accountId: string, userId: string): Promise<number> {
  const result = await turso.execute({
    sql: `SELECT COUNT(*) AS cnt FROM "Transaction" WHERE "accountId" = ? AND "userId" = ? AND "deletedAt" IS NULL`,
    args: [accountId, userId],
  });
  return Number(result.rows[0].cnt);
}

export async function deleteCard(id: string, userId: string): Promise<void> {
  const count = await countTransactionsByAccountId(id, userId);
  if (count > 0) {
    throw new Error(`No se puede eliminar la cuenta porque tiene ${count} transacción(es) asociada(s).`);
  }
  await turso.execute({
    sql: `DELETE FROM "Account" WHERE id = ? AND "userId" = ?`,
    args: [id, userId],
  });
}

// ─── BALANCE ─────────────────────────────────────────────────────────────────

export async function getAccountBalance(accountId: string, userId: string): Promise<number> {
  const result = await turso.execute({
    sql: `SELECT
            COALESCE(a."initialBalance", 0)
            + COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0)
            AS balance
          FROM "Account" a
          LEFT JOIN "Transaction" t
            ON t."accountId" = a.id AND t."userId" = a."userId" AND t."deletedAt" IS NULL
          WHERE a.id = ? AND a."userId" = ?
          GROUP BY a.id`,
    args: [accountId, userId],
  });
  return Number(result.rows[0]?.balance ?? 0) / 100; // centavos → pesos
}

// ─── TRANSACCIONES ────────────────────────────────────────────────────────────

export async function getAllTransactions(userId: string): Promise<Transaction[]> {
  const result = await turso.execute({
    sql: `SELECT t.*, c.name AS category, c.color AS "categoryColor", c.icon AS "categoryIcon"
          FROM "Transaction" t
          LEFT JOIN "Category" c ON t."categoryId" = c.id
          WHERE t."userId" = ? AND t."deletedAt" IS NULL
          ORDER BY t.date DESC`,
    args: [userId],
  });
  return result.rows.map(rowToTransaction);
}

export async function getTransactionsByAccountId(
  accountId: string,
  userId: string
): Promise<Transaction[]> {
  const result = await turso.execute({
    sql: `SELECT t.*, c.name AS category, c.color AS "categoryColor", c.icon AS "categoryIcon"
          FROM "Transaction" t
          LEFT JOIN "Category" c ON t."categoryId" = c.id
          WHERE t."accountId" = ? AND t."userId" = ? AND t."deletedAt" IS NULL
          ORDER BY t.date DESC`,
    args: [accountId, userId],
  });
  return result.rows.map(rowToTransaction);
}

export async function insertTransaction(
  tx: Omit<Transaction, 'id' | 'createdAt' | 'deletedAt'>,
): Promise<void> {
  if (tx.type === 'EXPENSE') {
    const balance = await getAccountBalance(tx.accountId, tx.userId);
    if (tx.amount > balance) {
      throw new Error(`Saldo insuficiente. Balance disponible: $${balance.toFixed(2)}`);
    }
  }

  const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const amountCents = Math.round(tx.amount * 100);

  await turso.execute({
    sql: `INSERT INTO "Transaction" (id, amount, type, "categoryId", "accountId", "userId", description, date, "createdAt")
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      amountCents,
      tx.type,
      tx.categoryId,
      tx.accountId,
      tx.userId,
      tx.description,
      tx.date ?? now,
      now,
    ],
  });
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const amountCents = Math.round(tx.amount * 100);
  await turso.execute({
    sql: `UPDATE "Transaction"
          SET amount = ?, type = ?, "categoryId" = ?, "accountId" = ?, description = ?, date = ?
          WHERE id = ? AND "userId" = ?`,
    args: [
      amountCents,
      tx.type,
      tx.categoryId,
      tx.accountId,
      tx.description,
      tx.date,
      tx.id,
      tx.userId,
    ],
  });
}

export async function deleteTransaction(id: string, userId: string): Promise<void> {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `UPDATE "Transaction" SET "deletedAt" = ? WHERE id = ? AND "userId" = ?`,
    args: [now, id, userId],
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function rowToTransaction(r: Record<string, any>): Transaction {
  return {
    id: String(r.id),
    amount: Number(r.amount) / 100, // centavos → pesos
    type: String(r.type) as 'INCOME' | 'EXPENSE',
    categoryId: String(r.categoryId),
    accountId: String(r.accountId),
    userId: String(r.userId),
    description: String(r.description ?? ''),
    date: String(r.date),
    createdAt: String(r.createdAt),
    deletedAt: r.deletedAt ? String(r.deletedAt) : null,
    category: r.category ? String(r.category) : undefined,
    categoryColor: r.categoryColor ? String(r.categoryColor) : undefined,
    categoryIcon: r.categoryIcon ? String(r.categoryIcon) : undefined,
  };
}
