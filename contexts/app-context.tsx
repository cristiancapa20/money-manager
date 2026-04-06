import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import * as db from '@/database/database';
import { scheduleLoanReminder, cancelLoanReminder, rescheduleAllLoanReminders } from '@/services/loan-notifications';
import type { Card } from '@/types/card';
import type { Loan, LoanPayment } from '@/types/loan';
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
  getAccountBalance: (accountId: string) => number;
  cards: Card[];
  addCard: (card: Omit<Card, 'id' | 'userId'>) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  refreshCards: () => Promise<void>;
  addCategory: (cat: Omit<Category, 'id' | 'isSystem' | 'userId'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'totalPaid' | 'accountName'>) => Promise<void>;
  updateLoan: (loan: Pick<Loan, 'id' | 'contactName' | 'amount' | 'description' | 'dueDate' | 'reminderDays' | 'status'>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  refreshLoans: () => Promise<Loan[]>;
  getLoanPayments: (loanId: string) => Promise<LoanPayment[]>;
  addLoanPayment: (payment: Omit<LoanPayment, 'id' | 'createdAt' | 'accountName'>, loan: Loan) => Promise<void>;
  updateLoanPayment: (payment: Pick<LoanPayment, 'id' | 'accountId' | 'amount' | 'date' | 'note'>, loan: Loan, oldAmount: number) => Promise<void>;
  deleteLoanPayment: (paymentId: string, loan: Loan, paymentAmount: number) => Promise<void>;
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
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      await db.initDatabase();

      const [loadedCards, loadedTransactions, loadedCategories, loadedLoans] = await Promise.all([
        db.getAllCards(user.id),
        db.getAllTransactions(user.id),
        db.getAllCategories(user.id),
        db.getAllLoans(user.id),
      ]);

      setCards(loadedCards);
      setTransactions(loadedTransactions);
      setCategories(loadedCategories);
      setLoans(loadedLoans);
      rescheduleAllLoanReminders(loadedLoans).catch(() => {});
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

  // ── Balance ────────────────────────────────────────────────────────────────

  const getAccountBalance = useCallback(
    (accountId: string): number => {
      const card = cards.find((c) => c.id === accountId);
      if (!card) return 0;
      const cardTxs = transactions.filter((t) => t.accountId === accountId);
      const income = cardTxs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const expenses = cardTxs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
      return card.initialBalance + income - expenses;
    },
    [cards, transactions],
  );

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

  // ── Categorías ─────────────────────────────────────────────────────────────

  const refreshCategories = async () => {
    if (!user) return;
    const loaded = await db.getAllCategories(user.id);
    setCategories(loaded);
  };

  const addCategory = async (cat: Omit<Category, 'id' | 'isSystem' | 'userId'>) => {
    if (!user) throw new Error('No autenticado');
    await db.insertCategory({ ...cat, userId: user.id });
    await refreshCategories();
  };

  const deleteCategory = async (id: string) => {
    if (!user) throw new Error('No autenticado');
    await db.deleteCategory(id, user.id);
    await refreshCategories();
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

  // ── Préstamos ──────────────────────────────────────────────────────────────

  const refreshLoans = async (): Promise<Loan[]> => {
    if (!user) return [];
    const loaded = await db.getAllLoans(user.id);
    setLoans(loaded);
    return loaded;
  };

  const addLoan = async (
    loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'totalPaid' | 'accountName'>
  ) => {
    if (!user) throw new Error('No autenticado');
    await db.insertLoan({ ...loan, userId: user.id });
    const fresh = await refreshLoans();
    const created = fresh.find((l) => l.contactName === loan.contactName && l.amount === loan.amount);
    if (created) scheduleLoanReminder(created).catch(() => {});
  };

  const updateLoan = async (
    loan: Pick<Loan, 'id' | 'contactName' | 'amount' | 'description' | 'dueDate' | 'reminderDays' | 'status'>
  ) => {
    if (!user) throw new Error('No autenticado');
    await db.updateLoan({ ...loan, userId: user.id });
    const fresh = await refreshLoans();
    const updated = fresh.find((l) => l.id === loan.id);
    if (updated) scheduleLoanReminder(updated).catch(() => {});
  };

  const deleteLoan = async (id: string) => {
    if (!user) throw new Error('No autenticado');
    await cancelLoanReminder(id);
    await db.deleteLoan(id, user.id);
    await refreshLoans();
    await refreshTransactions();
  };

  // ── Pagos de préstamos ────────────────────────────────────────────────────

  const getLoanPayments = async (loanId: string) => {
    return db.getLoanPayments(loanId);
  };

  const addLoanPayment = async (
    payment: Omit<LoanPayment, 'id' | 'createdAt' | 'accountName'>,
    loan: Loan,
  ) => {
    if (!user) throw new Error('No autenticado');
    await db.insertLoanPayment(payment, { ...loan, userId: user.id }, loan.totalPaid ?? 0);
    await Promise.all([refreshLoans(), refreshTransactions()]);
  };

  const updateLoanPayment = async (
    payment: Pick<LoanPayment, 'id' | 'accountId' | 'amount' | 'date' | 'note'>,
    loan: Loan,
    oldAmount: number,
  ) => {
    if (!user) throw new Error('No autenticado');
    await db.updateLoanPayment(payment, { ...loan, userId: user.id }, loan.totalPaid ?? 0, oldAmount);
    await Promise.all([refreshLoans(), refreshTransactions()]);
  };

  const deleteLoanPayment = async (paymentId: string, loan: Loan, paymentAmount: number) => {
    if (!user) throw new Error('No autenticado');
    await db.deleteLoanPayment(paymentId, { ...loan, userId: user.id }, loan.totalPaid ?? 0, paymentAmount);
    await Promise.all([refreshLoans(), refreshTransactions()]);
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
        getAccountBalance,
        addCategory,
        deleteCategory,
        refreshCategories,
        cards,
        addCard,
        updateCard,
        deleteCard,
        refreshCards,
        loans,
        addLoan,
        updateLoan,
        deleteLoan,
        refreshLoans,
        getLoanPayments,
        addLoanPayment,
        updateLoanPayment,
        deleteLoanPayment,
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
