import type { Transaction } from '@/components/add-transaction-modal';
import type { Card } from '@/types/card';
import * as SQLite from 'expo-sqlite';

const dbName = 'costos.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabaseAsync(dbName);
  return db;
}

export async function initDatabase(): Promise<void> {
  try {
    const database = await openDatabase();
    
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
            createdAt TEXT,
            FOREIGN KEY (cardId) REFERENCES cards(id) ON DELETE CASCADE
          );
        `);
        
        try {
          await database.execAsync(`
            ALTER TABLE transactions ADD COLUMN createdAt TEXT;
          `);
          console.log('Columna createdAt verificada/agregada');
        } catch (error: any) {
          const errorMsg = error?.message || String(error);
          if (!errorMsg.includes('duplicate column') && !errorMsg.includes('already exists')) {
            console.warn('Advertencia al verificar columna createdAt:', errorMsg);
          }
        }
        
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
    }>('SELECT * FROM transactions ORDER BY createdAt ASC;');
    
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
    }>('SELECT * FROM transactions WHERE cardId = ? ORDER BY createdAt ASC;', [cardId]);
    
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
    
    // Guardar fecha en UTC como ISO string
    const utcDate = new Date().toISOString();
    
    // Validar campos requeridos
    if (!transaction.title || !transaction.cardId || !transaction.category) {
      throw new Error('Campos requeridos faltantes en la transacción');
    }
    
    // Asegurar que todos los valores estén definidos
    const values = [
      id,
      String(transaction.title || ''),
      String(transaction.description || ''),
      Number(transaction.amount || 0),
      String(transaction.type || 'expense'),
      String(transaction.category),
      String(transaction.cardId),
      String(utcDate),
    ];
    
    await database.runAsync(
      'INSERT INTO transactions (id, title, description, amount, type, category, cardId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      values
    );
    console.log('Transacción insertada correctamente');
  } catch (error) {
    console.error('Error al insertar transacción:', error);
    console.error('Datos de la transacción:', {
      id: transaction.id,
      title: transaction.title,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      cardId: transaction.cardId,
    });
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
