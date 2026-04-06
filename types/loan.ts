/** Mapea la tabla "Loan" de Turso. amounts en centavos (INTEGER). */
export interface Loan {
  id: string;
  /** LENT = dinero que presté, OWED = dinero que debo */
  type: LoanType;
  contactName: string;
  /** Monto total del préstamo (ya convertido a pesos al leer) */
  amount: number;
  description: string;
  /** ISO date string — fecha límite de pago */
  dueDate: string | null;
  status: LoanStatus;
  /** Días antes del vencimiento para recordatorio */
  reminderDays: number | null;
  accountId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  /** Suma de pagos realizados (calculado, no columna real) */
  totalPaid?: number;
  /** Nombre de la cuenta — join al leer */
  accountName?: string;
}

export type LoanType = 'LENT' | 'OWED';
export type LoanStatus = 'ACTIVE' | 'PAID';

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  LENT: 'Prestado',
  OWED: 'Deuda',
};

export const LOAN_TYPE_ICONS: Record<LoanType, string> = {
  LENT: 'arrow-up-circle-outline',
  OWED: 'arrow-down-circle-outline',
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  ACTIVE: 'Activo',
  PAID: 'Pagado',
};

export interface LoanPayment {
  id: string;
  loanId: string;
  accountId: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}
