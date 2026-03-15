/** Mapea la tabla "Account" de Turso */
export interface Card {
  id: string;
  name: string;
  type: string;       // 'checking' | 'savings' | 'cash' | 'credit'
  color: string;
  userId: string;
  /** Balance inicial calculado desde las transacciones — no es columna real en Turso */
  initialBalance: number;
}

export type AccountType = 'checking' | 'savings' | 'cash' | 'credit';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Cuenta corriente',
  savings:  'Ahorros',
  cash:     'Efectivo',
  credit:   'Crédito',
};
