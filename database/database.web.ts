/**
 * Implementación de la capa de datos para web.
 * No usa expo-sqlite (evita el error wa-sqlite.wasm).
 * Persistencia en memoria + localStorage.
 */
import type { Transaction } from '@/components/add-transaction-modal';
import type { Card } from '@/types/card';

const STORAGE_KEYS = {
  cards: 'costos_cards',
  transactions: 'costos_transactions',
};

let cards: Card[] = [];
let transactions: Transaction[] = [];

function loadFromStorage() {
  try {
    const cardsJson = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.cards) : null;
    const txJson = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.transactions) : null;
    if (cardsJson) cards = JSON.parse(cardsJson);
    if (txJson) transactions = JSON.parse(txJson);
  } catch {
    cards = [];
    transactions = [];
  }
}

function saveCards() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.cards, JSON.stringify(cards));
    }
  } catch (e) {
    console.warn('No se pudo guardar cards en localStorage', e);
  }
}

function saveTransactions() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    }
  } catch (e) {
    console.warn('No se pudo guardar transacciones en localStorage', e);
  }
}

export async function openDatabase(): Promise<unknown> {
  return {};
}

export async function initDatabase(): Promise<void> {
  loadFromStorage();
}

export async function getAllCards(): Promise<Card[]> {
  loadFromStorage();
  return [...cards].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCardById(id: string): Promise<Card | null> {
  loadFromStorage();
  return cards.find((c) => c.id === id) ?? null;
}

export async function insertCard(card: Card): Promise<void> {
  loadFromStorage();
  if (cards.some((c) => c.id === card.id)) return;
  cards.push({ ...card });
  saveCards();
}

export async function updateCard(card: Card): Promise<void> {
  loadFromStorage();
  const i = cards.findIndex((c) => c.id === card.id);
  if (i >= 0) {
    cards[i] = { ...card };
    saveCards();
  }
}

export async function deleteCard(id: string): Promise<void> {
  loadFromStorage();
  cards = cards.filter((c) => c.id !== id);
  transactions = transactions.filter((t) => t.cardId !== id);
  saveCards();
  saveTransactions();
}

export async function getAllTransactions(): Promise<Transaction[]> {
  loadFromStorage();
  return [...transactions].sort((a, b) => {
    const aDate = (a as Transaction & { createdAt?: string }).createdAt
      ? new Date((a as Transaction & { createdAt?: string }).createdAt).getTime()
      : 0;
    const bDate = (b as Transaction & { createdAt?: string }).createdAt
      ? new Date((b as Transaction & { createdAt?: string }).createdAt).getTime()
      : 0;
    return aDate - bDate;
  });
}

export async function getTransactionsByCardId(cardId: string): Promise<Transaction[]> {
  loadFromStorage();
  return transactions
    .filter((t) => t.cardId === cardId)
    .map((t) => ({ ...t, createdAt: t.createdAt }))
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aDate - bDate;
    });
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  loadFromStorage();
  const t = transactions.find((x) => x.id === id || (x as Transaction & { id?: string }).id === id);
  return t ? { ...t } : null;
}

export async function insertTransaction(transaction: Transaction): Promise<void> {
  loadFromStorage();
  const id = transaction.id ?? Date.now().toString();
  const createdAt = new Date().toISOString();
  const t: Transaction & { id: string; createdAt?: string } = {
    ...transaction,
    id,
    createdAt,
  };
  transactions.push(t);
  saveTransactions();
}

export async function updateTransaction(transaction: Transaction): Promise<void> {
  if (!transaction.id) throw new Error('Transaction ID is required for update');
  loadFromStorage();
  const i = transactions.findIndex((t) => (t.id ?? (t as Transaction & { id?: string }).id) === transaction.id);
  if (i >= 0) {
    const prev = transactions[i];
    const createdAt = 'createdAt' in prev && prev.createdAt ? prev.createdAt : new Date().toISOString();
    transactions[i] = { ...transaction, id: transaction.id, createdAt };
    saveTransactions();
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  loadFromStorage();
  transactions = transactions.filter((t) => (t.id ?? (t as Transaction & { id?: string }).id) !== id);
  saveTransactions();
}
