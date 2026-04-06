/**
 * Script para poblar la base de datos local de desarrollo.
 *
 * Uso:
 *   1. Inicia Turso local:  turso dev
 *   2. Ejecuta el seed:     npx tsx scripts/seed-dev.ts
 *
 * Crea las tablas, categorías del sistema, un usuario de prueba,
 * cuentas y transacciones de ejemplo.
 *
 * Usuario de prueba:
 *   Email:    test@test.com
 *   Password: test1234
 */

import { createClient } from '@libsql/client/http';

const client = createClient({
  url: 'http://127.0.0.1:8080',
  authToken: 'dev-token',
});

async function seed() {
  console.log('🗄️  Creando tablas...');

  // ─── User ────────────────────────────────────────────────────────────
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id"           TEXT PRIMARY KEY,
      "email"        TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "displayName"  TEXT,
      "avatar"       TEXT,
      "createdAt"    TEXT NOT NULL DEFAULT (datetime('now')),
      "updatedAt"    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // ─── Category ────────────────────────────────────────────────────────
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Category" (
      "id"       TEXT PRIMARY KEY,
      "name"     TEXT NOT NULL,
      "color"    TEXT NOT NULL DEFAULT '#6B7280',
      "icon"     TEXT NOT NULL DEFAULT 'ellipse-outline',
      "isSystem" INTEGER NOT NULL DEFAULT 0,
      "userId"   TEXT,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    )
  `);

  // ─── Account ─────────────────────────────────────────────────────────
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Account" (
      "id"             TEXT PRIMARY KEY,
      "name"           TEXT NOT NULL,
      "type"           TEXT NOT NULL DEFAULT 'BANK',
      "color"          TEXT NOT NULL DEFAULT '#4f46e5',
      "initialBalance" INTEGER NOT NULL DEFAULT 0,
      "userId"         TEXT NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    )
  `);

  // ─── Transaction ─────────────────────────────────────────────────────
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Transaction" (
      "id"          TEXT PRIMARY KEY,
      "amount"      INTEGER NOT NULL,
      "type"        TEXT NOT NULL CHECK("type" IN ('INCOME', 'EXPENSE')),
      "categoryId"  TEXT NOT NULL,
      "accountId"   TEXT NOT NULL,
      "userId"      TEXT NOT NULL,
      "description" TEXT DEFAULT '',
      "date"        TEXT NOT NULL,
      "createdAt"   TEXT NOT NULL DEFAULT (datetime('now')),
      "deletedAt"   TEXT,
      FOREIGN KEY ("categoryId") REFERENCES "Category"("id"),
      FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE,
      FOREIGN KEY ("userId")    REFERENCES "User"("id")    ON DELETE CASCADE
    )
  `);

  // ─── Loan ────────────────────────────────────────────────────────────
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Loan" (
      "id"           TEXT PRIMARY KEY,
      "type"         TEXT NOT NULL CHECK("type" IN ('LENT', 'OWED')),
      "contactName"  TEXT NOT NULL,
      "amount"       INTEGER NOT NULL,
      "description"  TEXT,
      "dueDate"      TEXT,
      "status"       TEXT NOT NULL DEFAULT 'ACTIVE' CHECK("status" IN ('ACTIVE', 'PAID')),
      "reminderDays" INTEGER,
      "accountId"    TEXT,
      "userId"       TEXT NOT NULL,
      "createdAt"    TEXT NOT NULL DEFAULT (datetime('now')),
      "updatedAt"    TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY ("accountId") REFERENCES "Account"("id"),
      FOREIGN KEY ("userId")    REFERENCES "User"("id") ON DELETE CASCADE
    )
  `);

  // ─── LoanPayment ────────────────────────────────────────────────────
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "LoanPayment" (
      "id"        TEXT PRIMARY KEY,
      "loanId"    TEXT NOT NULL,
      "accountId" TEXT,
      "amount"    INTEGER NOT NULL,
      "date"      TEXT NOT NULL,
      "note"      TEXT,
      "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY ("loanId")    REFERENCES "Loan"("id")    ON DELETE CASCADE,
      FOREIGN KEY ("accountId") REFERENCES "Account"("id")
    )
  `);

  console.log('✅ Tablas creadas');

  // ─── Categorías del sistema ──────────────────────────────────────────
  console.log('📂 Insertando categorías del sistema...');

  const categories = [
    { id: 'cat_sys_alimentacion',    name: 'Alimentación',    icon: 'restaurant-outline',      color: '#FF6B6B' },
    { id: 'cat_sys_transporte',      name: 'Transporte',      icon: 'car-outline',             color: '#4ECDC4' },
    { id: 'cat_sys_vivienda',        name: 'Vivienda',        icon: 'home-outline',            color: '#45B7D1' },
    { id: 'cat_sys_salud',           name: 'Salud',           icon: 'medical-outline',         color: '#96CEB4' },
    { id: 'cat_sys_entretenimiento', name: 'Entretenimiento', icon: 'game-controller-outline', color: '#FFEAA7' },
    { id: 'cat_sys_educacion',       name: 'Educación',       icon: 'school-outline',          color: '#DDA0DD' },
    { id: 'cat_sys_ropa',            name: 'Ropa',            icon: 'shirt-outline',           color: '#F0A500' },
    { id: 'cat_sys_tecnologia',      name: 'Tecnología',      icon: 'laptop-outline',          color: '#6C5CE7' },
    { id: 'cat_sys_servicios',       name: 'Servicios',       icon: 'construct-outline',       color: '#A29BFE' },
    { id: 'cat_sys_otros',           name: 'Otros',           icon: 'ellipse-outline',         color: '#B2BEC3' },
    { id: 'cat_sys_prestamo',        name: 'Préstamo',        icon: 'cash-outline',            color: '#00B894' },
    { id: 'cat_sys_deuda',           name: 'Deuda',           icon: 'trending-down-outline',   color: '#E17055' },
  ];

  for (const cat of categories) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "Category" (id, name, icon, color, "isSystem", "userId") VALUES (?, ?, ?, ?, 1, NULL)`,
      args: [cat.id, cat.name, cat.icon, cat.color],
    });
  }
  console.log(`✅ ${categories.length} categorías insertadas`);

  // ─── Usuario de prueba ───────────────────────────────────────────────
  console.log('👤 Creando usuario de prueba...');

  const userId = 'user_dev_001';
  // Hash de "test1234" generado con bcryptjs (10 rounds)
  const passwordHash = '$2b$10$64ihTlUQii3xePm4hxN32ub.2x78GaALnj/Txsq7bliNiNN6SJ1nC';

  await client.execute({
    sql: `INSERT OR IGNORE INTO "User" (id, email, "passwordHash", "displayName") VALUES (?, ?, ?, ?)`,
    args: [userId, 'test@test.com', passwordHash, 'Dev User'],
  });
  console.log('✅ Usuario creado: test@test.com / test1234');

  // ─── Cuentas de ejemplo ──────────────────────────────────────────────
  console.log('💳 Creando cuentas...');

  const accounts = [
    { id: 'acc_dev_checking', name: 'Cuenta Principal', type: 'BANK',        color: '#4f46e5', initialBalance: 500000 },
    { id: 'acc_dev_savings',  name: 'Ahorros',          type: 'BANK',        color: '#10B981', initialBalance: 1000000 },
    { id: 'acc_dev_cash',     name: 'Efectivo',         type: 'CASH',        color: '#F59E0B', initialBalance: 50000 },
    { id: 'acc_dev_credit',   name: 'Tarjeta Crédito',  type: 'CREDIT_CARD', color: '#EF4444', initialBalance: 0 },
  ];

  for (const acc of accounts) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "Account" (id, name, type, color, "initialBalance", "userId") VALUES (?, ?, ?, ?, ?, ?)`,
      args: [acc.id, acc.name, acc.type, acc.color, acc.initialBalance, userId],
    });
  }
  console.log(`✅ ${accounts.length} cuentas creadas`);

  // ─── Transacciones de ejemplo ────────────────────────────────────────
  console.log('💰 Creando transacciones de ejemplo...');

  const now = new Date();
  const transactions = [
    // Ingresos
    { type: 'INCOME',  amount: 350000, catId: 'cat_sys_prestamo',       accId: 'acc_dev_checking', desc: 'Salario mensual',       daysAgo: 1 },
    { type: 'INCOME',  amount: 80000,  catId: 'cat_sys_tecnologia',     accId: 'acc_dev_checking', desc: 'Proyecto freelance',    daysAgo: 5 },
    { type: 'INCOME',  amount: 15000,  catId: 'cat_sys_otros',          accId: 'acc_dev_savings',  desc: 'Rendimiento inversión', daysAgo: 10 },
    // Gastos
    { type: 'EXPENSE', amount: 12500,  catId: 'cat_sys_alimentacion',   accId: 'acc_dev_checking', desc: 'Supermercado',         daysAgo: 0 },
    { type: 'EXPENSE', amount: 4500,   catId: 'cat_sys_transporte',     accId: 'acc_dev_cash',     desc: 'Gasolina',             daysAgo: 1 },
    { type: 'EXPENSE', amount: 25000,  catId: 'cat_sys_entretenimiento',accId: 'acc_dev_credit',   desc: 'Cena restaurante',     daysAgo: 2 },
    { type: 'EXPENSE', amount: 8000,   catId: 'cat_sys_salud',          accId: 'acc_dev_checking', desc: 'Consulta médica',      daysAgo: 3 },
    { type: 'EXPENSE', amount: 15000,  catId: 'cat_sys_educacion',      accId: 'acc_dev_checking', desc: 'Curso en línea',       daysAgo: 4 },
    { type: 'EXPENSE', amount: 6000,   catId: 'cat_sys_servicios',      accId: 'acc_dev_checking', desc: 'Internet y teléfono',  daysAgo: 7 },
    { type: 'EXPENSE', amount: 35000,  catId: 'cat_sys_ropa',           accId: 'acc_dev_credit',   desc: 'Ropa nueva',           daysAgo: 8 },
    { type: 'EXPENSE', amount: 2000,   catId: 'cat_sys_alimentacion',   accId: 'acc_dev_cash',     desc: 'Café y snacks',        daysAgo: 0 },
    { type: 'EXPENSE', amount: 18000,  catId: 'cat_sys_otros',          accId: 'acc_dev_checking', desc: 'Regalo cumpleaños',    daysAgo: 12 },
    { type: 'EXPENSE', amount: 9500,   catId: 'cat_sys_transporte',     accId: 'acc_dev_checking', desc: 'Uber mensual',         daysAgo: 6 },
  ];

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const date = new Date(now);
    date.setDate(date.getDate() - tx.daysAgo);

    await client.execute({
      sql: `INSERT OR IGNORE INTO "Transaction" (id, amount, type, "categoryId", "accountId", "userId", description, date, "createdAt")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `tx_dev_${String(i + 1).padStart(3, '0')}`,
        tx.amount, // ya en centavos
        tx.type,
        tx.catId,
        tx.accId,
        userId,
        tx.desc,
        date.toISOString(),
        date.toISOString(),
      ],
    });
  }
  console.log(`✅ ${transactions.length} transacciones creadas`);

  // ─── Préstamo de ejemplo ─────────────────────────────────────────────
  console.log('🤝 Creando préstamo de ejemplo...');

  await client.execute({
    sql: `INSERT OR IGNORE INTO "Loan" (id, type, "contactName", amount, description, "dueDate", status, "accountId", "userId", "createdAt", "updatedAt")
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'loan_dev_001',
      'LENT',
      'Juan Pérez',
      50000, // 500.00 en centavos
      'Préstamo para emergencia',
      new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
      'ACTIVE',
      'acc_dev_checking',
      userId,
      now.toISOString(),
      now.toISOString(),
    ],
  });

  await client.execute({
    sql: `INSERT OR IGNORE INTO "LoanPayment" (id, "loanId", "accountId", amount, date, note, "createdAt")
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'pay_dev_001',
      'loan_dev_001',
      'acc_dev_checking',
      20000, // 200.00 en centavos
      now.toISOString(),
      'Primer abono',
      now.toISOString(),
    ],
  });
  console.log('✅ Préstamo y pago creados');

  console.log('\n🎉 Seed completado. La base de datos local está lista.');
  console.log('   Email:    test@test.com');
  console.log('   Password: test1234');
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
