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
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

export async function getAllCategories(userId: string): Promise<Category[]> {
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

// ─── CUENTAS (Cards) ──────────────────────────────────────────────────────────

export async function getAllCards(userId: string): Promise<Card[]> {
  const result = await turso.execute({
    sql: `SELECT * FROM "Account" WHERE "userId" = ? ORDER BY name ASC`,
    args: [userId],
  });
  return result.rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    type: String(r.type),
    color: String(r.color ?? '#4f46e5'),
    userId: String(r.userId),
    initialBalance: 0, // Se calcula desde transacciones en el contexto
  }));
}

export async function insertCard(card: Omit<Card, 'initialBalance'>): Promise<void> {
  const id = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await turso.execute({
    sql: `INSERT INTO "Account" (id, name, type, color, "userId") VALUES (?, ?, ?, ?, ?)`,
    args: [id, card.name, card.type, card.color, card.userId],
  });
}

export async function updateCard(card: Card): Promise<void> {
  await turso.execute({
    sql: `UPDATE "Account" SET name = ?, type = ?, color = ? WHERE id = ? AND "userId" = ?`,
    args: [card.name, card.type, card.color, card.id, card.userId],
  });
}

export async function deleteCard(id: string, userId: string): Promise<void> {
  await turso.execute({
    sql: `DELETE FROM "Account" WHERE id = ? AND "userId" = ?`,
    args: [id, userId],
  });
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
