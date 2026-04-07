import { useAuth } from '@/contexts/auth-context';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

/* ─── Monedas soportadas (ISO 4217) ─── */

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'MXN', name: 'Peso mexicano', symbol: '$' },
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'ARS', name: 'Peso argentino', symbol: '$' },
  { code: 'COP', name: 'Peso colombiano', symbol: '$' },
  { code: 'CLP', name: 'Peso chileno', symbol: '$' },
  { code: 'PEN', name: 'Sol peruano', symbol: 'S/' },
  { code: 'BRL', name: 'Real brasileño', symbol: 'R$' },
  { code: 'GBP', name: 'Libra esterlina', symbol: '£' },
];

/* ─── Context ─── */

interface CurrencyContextType {
  /** Código ISO 4217 de la moneda activa (ej. "MXN") */
  currency: string;
  /** Símbolo de la moneda (ej. "$", "€", "£") */
  symbol: string;
  /** Formatea un monto con la moneda del usuario (ej. "$1,234.56") */
  formatCurrency: (amount: number) => string;
  /** Formato compacto para gráficas (ej. "$1.2k") */
  formatCompact: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const currency = user?.preferredCurrency ?? 'MXN';

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

  return (
    <CurrencyContext.Provider value={{ currency, symbol, formatCurrency, formatCompact }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
