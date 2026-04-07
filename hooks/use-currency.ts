import { useAuth } from '@/contexts/auth-context';
import { useCallback, useMemo } from 'react';

/**
 * Hook que devuelve funciones de formato de moneda
 * basadas en la moneda preferida del usuario.
 */
export function useCurrency() {
  const { user } = useAuth();
  const currency = user?.preferredCurrency ?? 'MXN';

  /** Símbolo de la moneda (ej. "$", "€", "£") extraído vía Intl */
  const symbol = useMemo(() => {
    const parts = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? '$';
  }, [currency]);

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
        return `${symbol}${(amount / 1000).toFixed(1)}k`;
      }
      return `${symbol}${amount.toFixed(0)}`;
    },
    [symbol],
  );

  return { currency, symbol, formatCurrency, formatCompact };
}
