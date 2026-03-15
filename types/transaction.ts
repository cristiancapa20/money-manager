/** Mapea la tabla "Transaction" de Turso. amounts en centavos (INTEGER). */
export interface Transaction {
  id: string;
  /** En centavos — dividir entre 100 para mostrar */
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: number;
  accountId: string;
  userId: string;
  description: string;
  /** ISO date string  e.g. "2026-03-15T00:00:00.000Z" */
  date: string;
  createdAt: string;
  /** Nombre de la categoría — join al leer, no columna real */
  category?: string;
  /** Color de la categoría — join al leer */
  categoryColor?: string;
  /** Icono de la categoría — join al leer */
  categoryIcon?: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  isSystem: boolean;
  userId: string | null;
}
