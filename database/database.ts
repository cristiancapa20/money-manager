import type { Transaction } from '@/components/add-transaction-modal';
import type { Card } from '@/types/card';
import * as SQLite from 'expo-sqlite';

const dbName = 'costos.db';

// Variable global para almacenar la instancia de la base de datos
let db: SQLite.SQLiteDatabase | null = null;

// Abrir o crear la base de datos
export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabaseAsync(dbName);
  return db;
}

// Inicializar las tablas
export async function initDatabase(): Promise<void> {
  try {
    const database = await openDatabase();
    
    // Crear tabla de tarjetas
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        initialBalance REAL NOT NULL,
        color TEXT
      );
    `);
    console.log('Tabla cards creada correctamente');

    // Crear tabla de transacciones
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        cardId TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (cardId) REFERENCES cards(id) ON DELETE CASCADE
      );
    `);
    console.log('Tabla transactions creada correctamente');
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar base de datos:', error);
    throw error;
  }
}

// ========== OPERACIONES DE TARJETAS ==========

export async function getAllCards(): Promise<Card[]> {
  try {
    const database = await openDatabase();
    const result = await database.getAllAsync<Card>(
      'SELECT * FROM cards ORDER BY name ASC;'
    );
    return result;
  } catch (error) {
    console.error('Error al obtener tarjetas:', error);
    throw error;
  }
}

export async function getCardById(id: string): Promise<Card | null> {
  try {
    const database = await openDatabase();
    const result = await database.getFirstAsync<Card>(
      'SELECT * FROM cards WHERE id = ?;',
      [id]
    );
    return result || null;
  } catch (error) {
    console.error('Error al obtener tarjeta:', error);
    throw error;
  }
}

export async function insertCard(card: Card): Promise<void> {
  try {
    const database = await openDatabase();
    await database.runAsync(
      'INSERT INTO cards (id, name, initialBalance, color) VALUES (?, ?, ?, ?);',
      [card.id, card.name, card.initialBalance, card.color || null]
    );
    console.log('Tarjeta insertada correctamente');
  } catch (error) {
    console.error('Error al insertar tarjeta:', error);
    throw error;
  }
}

export async function updateCard(card: Card): Promise<void> {
  try {
    const database = await openDatabase();
    await database.runAsync(
      'UPDATE cards SET name = ?, initialBalance = ?, color = ? WHERE id = ?;',
      [card.name, card.initialBalance, card.color || null, card.id]
    );
    console.log('Tarjeta actualizada correctamente');
  } catch (error) {
    console.error('Error al actualizar tarjeta:', error);
    throw error;
  }
}

export async function deleteCard(id: string): Promise<void> {
  try {
    const database = await openDatabase();
    await database.runAsync('DELETE FROM cards WHERE id = ?;', [id]);
    console.log('Tarjeta eliminada correctamente');
  } catch (error) {
    console.error('Error al eliminar tarjeta:', error);
    throw error;
  }
}

// ========== OPERACIONES DE TRANSACCIONES ==========

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const database = await openDatabase();
    const result = await database.getAllAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      type: string;
      category: string;
      cardId: string;
      createdAt?: string;
    }>('SELECT * FROM transactions ORDER BY createdAt DESC;');
    
    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: row.amount,
      type: row.type as 'income' | 'expense',
      category: row.category,
      cardId: row.cardId,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    throw error;
  }
}

export async function getTransactionsByCardId(cardId: string): Promise<Transaction[]> {
  try {
    const database = await openDatabase();
    const result = await database.getAllAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      type: string;
      category: string;
      cardId: string;
    }>('SELECT * FROM transactions WHERE cardId = ? ORDER BY createdAt DESC;', [cardId]);
    
    return result.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      amount: row.amount,
      type: row.type as 'income' | 'expense',
      category: row.category,
      cardId: row.cardId,
    }));
  } catch (error) {
    console.error('Error al obtener transacciones por tarjeta:', error);
    throw error;
  }
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  try {
    const database = await openDatabase();
    const result = await database.getFirstAsync<{
      id: string;
      title: string;
      description: string;
      amount: number;
      type: string;
      category: string;
      cardId: string;
    }>('SELECT * FROM transactions WHERE id = ?;', [id]);
    
    if (!result) {
      return null;
    }
    
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      amount: result.amount,
      type: result.type as 'income' | 'expense',
      category: result.category,
      cardId: result.cardId,
    };
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    throw error;
  }
}

export async function insertTransaction(transaction: Transaction): Promise<void> {
  try {
    const database = await openDatabase();
    const id = transaction.id || Date.now().toString();
    
    await database.runAsync(
      'INSERT INTO transactions (id, title, description, amount, type, category, cardId) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [
        id,
        transaction.title,
        transaction.description,
        transaction.amount,
        transaction.type,
        transaction.category,
        transaction.cardId,
      ]
    );
    console.log('Transacción insertada correctamente');
  } catch (error) {
    console.error('Error al insertar transacción:', error);
    throw error;
  }
}

export async function updateTransaction(transaction: Transaction): Promise<void> {
  if (!transaction.id) {
    throw new Error('Transaction ID is required for update');
  }

  try {
    const database = await openDatabase();
    await database.runAsync(
      'UPDATE transactions SET title = ?, description = ?, amount = ?, type = ?, category = ?, cardId = ? WHERE id = ?;',
      [
        transaction.title,
        transaction.description,
        transaction.amount,
        transaction.type,
        transaction.category,
        transaction.cardId,
        transaction.id,
      ]
    );
    console.log('Transacción actualizada correctamente');
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    throw error;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    const database = await openDatabase();
    await database.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
    console.log('Transacción eliminada correctamente');
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    throw error;
  }
}
