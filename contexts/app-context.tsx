import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction } from '@/components/add-transaction-modal';
import type { Card } from '@/types/card';
import {
  initDatabase,
  getAllCards,
  getAllTransactions,
  insertCard,
  insertTransaction,
  updateCard,
  updateTransaction,
  deleteCard,
  deleteTransaction,
} from '@/database/database';

interface AppContextType {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  cards: Card[];
  addCard: (card: Card) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  refreshCards: () => Promise<void>;
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
  transactionModalVisible: boolean;
  setTransactionModalVisible: (visible: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar base de datos y cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await initDatabase();
        const loadedCards = await getAllCards();
        const loadedTransactions = await getAllTransactions();
        setCards(loadedCards);
        setTransactions(loadedTransactions);
        
        // Seleccionar la primera tarjeta si hay tarjetas y no hay una seleccionada
        if (loadedCards.length > 0 && !selectedCardId) {
          setSelectedCardId(loadedCards[0].id);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Funciones de transacciones
  const addTransaction = async (transaction: Transaction) => {
    try {
      const id = transaction.id || Date.now().toString();
      const transactionWithId = { ...transaction, id };
      await insertTransaction(transactionWithId);
      await refreshTransactions();
    } catch (error) {
      console.error('Error al agregar transacción:', error);
      throw error;
    }
  };

  const updateTransactionAsync = async (transaction: Transaction) => {
    try {
      if (!transaction.id) {
        throw new Error('Transaction ID is required');
      }
      await updateTransaction(transaction);
      await refreshTransactions();
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
      throw error;
    }
  };

  const deleteTransactionAsync = async (id: string) => {
    try {
      await deleteTransaction(id);
      await refreshTransactions();
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      throw error;
    }
  };

  const refreshTransactions = async () => {
    try {
      const loadedTransactions = await getAllTransactions();
      setTransactions(loadedTransactions);
    } catch (error) {
      console.error('Error al refrescar transacciones:', error);
    }
  };

  // Funciones de tarjetas
  const addCard = async (card: Card) => {
    try {
      await insertCard(card);
      await refreshCards();
    } catch (error) {
      console.error('Error al agregar tarjeta:', error);
      throw error;
    }
  };

  const updateCardAsync = async (card: Card) => {
    try {
      await updateCard(card);
      await refreshCards();
    } catch (error) {
      console.error('Error al actualizar tarjeta:', error);
      throw error;
    }
  };

  const deleteCardAsync = async (id: string) => {
    try {
      await deleteCard(id);
      await refreshCards();
      // Si se eliminó la tarjeta seleccionada, seleccionar otra o limpiar
      if (selectedCardId === id) {
        const remainingCards = cards.filter((c) => c.id !== id);
        setSelectedCardId(remainingCards.length > 0 ? remainingCards[0].id : null);
      }
    } catch (error) {
      console.error('Error al eliminar tarjeta:', error);
      throw error;
    }
  };

  const refreshCards = async () => {
    try {
      const loadedCards = await getAllCards();
      setCards(loadedCards);
    } catch (error) {
      console.error('Error al refrescar tarjetas:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        isLoading,
        addTransaction,
        updateTransaction: updateTransactionAsync,
        deleteTransaction: deleteTransactionAsync,
        refreshTransactions,
        cards,
        addCard,
        updateCard: updateCardAsync,
        deleteCard: deleteCardAsync,
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
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

