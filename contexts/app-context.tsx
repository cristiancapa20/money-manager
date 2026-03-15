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
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  cards: Card[];
  addCard: (card: Omit<Card, 'id' | 'initialBalance' | 'userId'>) => Promise<void>;
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

      // Calcular balance de cada cuenta desde las transacciones
      const cardsWithBalance = loadedCards.map((card) => {
        const cardTxs = loadedTransactions.filter((t) => t.accountId === card.id);
        const balance = cardTxs.reduce(
          (sum, t) => (t.type === 'INCOME' ? sum + t.amount : sum - t.amount),
          0
        );
        return { ...card, initialBalance: balance };
      });

      setCards(cardsWithBalance);
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
      setSelectedCardId((prev) => {
        if (prev && cardsWithBalance.some((c) => c.id === prev)) return prev;
        return cardsWithBalance.length > 0 ? cardsWithBalance[0].id : null;
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
    // Recalcular balances
    setCards((prev) =>
      prev.map((card) => {
        const cardTxs = loaded.filter((t) => t.accountId === card.id);
        const balance = cardTxs.reduce(
          (sum, t) => (t.type === 'INCOME' ? sum + t.amount : sum - t.amount),
          0
        );
        return { ...card, initialBalance: balance };
      })
    );
  };

  const addTransaction = async (
    tx: Omit<Transaction, 'id' | 'createdAt' | 'userId'>
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
    const loadedTxs = transactions;
    const withBalance = loaded.map((card) => {
      const cardTxs = loadedTxs.filter((t) => t.accountId === card.id);
      const balance = cardTxs.reduce(
        (sum, t) => (t.type === 'INCOME' ? sum + t.amount : sum - t.amount),
        0
      );
      return { ...card, initialBalance: balance };
    });
    setCards(withBalance);
  };

  const addCard = async (card: Omit<Card, 'id' | 'initialBalance' | 'userId'>) => {
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
