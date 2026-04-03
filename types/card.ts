/** Mapea la tabla "Account" de Turso */
export interface Card {
  id: string;
  name: string;
  type: AccountType;
  color: string;
  userId: string;
  /** Balance inicial configurado por el usuario (columna real en Turso) */
  initialBalance: number;
}

export type AccountType = 'CASH' | 'BANK' | 'CREDIT_CARD' | 'OTHER';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CASH:        'Efectivo',
  BANK:        'Banco',
  CREDIT_CARD: 'Tarjeta de crédito',
  OTHER:       'Otro',
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  CASH:        'cash-outline',
  BANK:        'business-outline',
  CREDIT_CARD: 'card-outline',
  OTHER:       'wallet-outline',
};
