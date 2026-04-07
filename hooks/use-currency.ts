import { useAuth } from '@/contexts/auth-context';
import { useCallback } from 'react';

/**
 * Hook que devuelve funciones de formato de moneda
 * basadas en la moneda preferida del usuario.
 */
export function useCurrency() {
  const { user } = useAuth();
  const currency = user?.preferredCurrency ?? 'MXN';

  const formatCurrency = useCallback(
    (amount: number) =>
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
      }).format(amount),
    [currency],
  );

  const formatCompact = useCallback(
    (amount: number) => {
      if (Math.abs(amount) >= 1000) {
        return `$${(amount / 1000).toFixed(1)}k`;
      }
      return `$${amount.toFixed(0)}`;
    },
    [],
  );

  return { currency, formatCurrency, formatCompact };
}
