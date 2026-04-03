import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import * as db from '@/database/database';
import type { Card } from '@/types/card';
import type { Category, Transaction } from '@/types/transaction';
import { useAuth } from './auth-context';

interface AppContextType {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'userId' | 'deletedAt'>) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  cards: Card[];
  addCard: (card: Omit<Card, 'id' | 'userId'>) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  refreshCards: () => Promise<void>;
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  transactionModalVisible: boolean;
  setTransactionModalVisible: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      await db.initDatabase();

      const [loadedCards, loadedTransactions, loadedCategories] = await Promise.all([
        db.getAllCards(user.id),
        db.getAllTransactions(user.id),
        db.getAllCategories(user.id),
      ]);

      setCards(loadedCards);
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
      setSelectedCardId((prev) => {
        if (prev && loadedCards.some((c) => c.id === prev)) return prev;
        return loadedCards.length > 0 ? loadedCards[0].id : null;
      });
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Transacciones ──────────────────────────────────────────────────────────

  const refreshTransactions = async () => {
    if (!user) return;
    const loaded = await db.getAllTransactions(user.id);
    setTransactions(loaded);
  };

  const addTransaction = async (
    tx: Omit<Transaction, 'id' | 'createdAt' | 'userId' | 'deletedAt'>
  ) => {
    if (!user) throw new Error('No autenticado');
    await db.insertTransaction({ ...tx, userId: user.id });
    await refreshTransactions();
  };

  const updateTransaction = async (tx: Transaction) => {
    if (!user) throw new Error('No autenticado');
    await db.updateTransaction({ ...tx, userId: user.id });
    await refreshTransactions();
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('No autenticado');
    await db.deleteTransaction(id, user.id);
    await refreshTransactions();
  };

  // ── Cuentas ────────────────────────────────────────────────────────────────

  const refreshCards = async () => {
    if (!user) return;
    const loaded = await db.getAllCards(user.id);
    setCards(loaded);
  };

  const addCard = async (card: Omit<Card, 'id' | 'userId'>) => {
    if (!user) throw new Error('No autenticado');
    await db.insertCard({ ...card, userId: user.id });
    await refreshCards();
  };

  const updateCard = async (card: Card) => {
    if (!user) throw new Error('No autenticado');
    await db.updateCard({ ...card, userId: user.id });
    await refreshCards();
  };

  const deleteCard = async (id: string) => {
    if (!user) throw new Error('No autenticado');
    await db.deleteCard(id, user.id);
    setSelectedCardId((prev) => {
      if (prev !== id) return prev;
      const remaining = cards.filter((c) => c.id !== id);
      return remaining.length > 0 ? remaining[0].id : null;
    });
    await refreshCards();
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        categories,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions,
        cards,
        addCard,
        updateCard,
        deleteCard,
        refreshCards,
        selectedCardId,
        setSelectedCardId,
        editingTransaction,
        setEditingTransaction,
        transactionModalVisible,
        setTransactionModalVisible,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
