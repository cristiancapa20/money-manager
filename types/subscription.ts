/** Mapea la tabla "Subscription" de Turso. amounts en centavos (INTEGER). */
export interface Subscription {
  id: string;
  name: string;
  /** Monto recurrente (ya convertido a pesos al leer) */
  amount: number;
  /** Día del mes en que se cobra (1-31) */
  billingDay: number;
  /** Si la suscripción está activa */
  active: boolean;
  accountId: string;
  /** Categoría opcional */
  categoryId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  /** Nombre de la cuenta — join al leer */
  accountName?: string;
  /** Nombre de la categoría — join al leer */
  categoryName?: string;
  /** Color de la categoría — join al leer */
  categoryColor?: string;
  /** Icono de la categoría — join al leer */
  categoryIcon?: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE';

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
};
