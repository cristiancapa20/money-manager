/**
 * Design tokens — Finance Tracker style
 * Paleta: indigo como primario, gray-900 para nav, gray-50 para fondo,
 * green-600 / red-600 para ingresos / gastos.
 */

import { Platform } from 'react-native';

// ─── Primitivos ────────────────────────────────────────────────────────────────
export const Palette = {
  // Indigo (primario)
  indigo50:  '#eef2ff',
  indigo100: '#e0e7ff',
  indigo400: '#818cf8',
  indigo500: '#6366f1',
  indigo600: '#4f46e5',
  indigo700: '#4338ca',

  // Grays
  gray50:  '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Green (ingresos)
  green100: '#dcfce7',
  green600: '#16a34a',

  // Red (gastos)
  red100:   '#fee2e2',
  red600:   '#dc2626',

  // Amber (advertencias)
  amber50:  '#fffbeb',
  amber200: '#fde68a',
  amber600: '#d97706',

  white: '#ffffff',
  black: '#000000',
};

// ─── Tokens de tema ────────────────────────────────────────────────────────────
export const Colors = {
  light: {
    // Texto
    text:          Palette.gray900,
    textSecondary: Palette.gray500,
    textMuted:     Palette.gray400,

    // Fondos
    background:    Palette.gray50,
    card:          Palette.white,
    input:         Palette.white,
    inputBorder:   Palette.gray300,

    // Primario
    tint:            Palette.indigo600,
    tintLight:       Palette.indigo50,
    tintBorder:      Palette.indigo400,

    // Iconos
    icon:            Palette.gray500,
    tabIconDefault:  Palette.gray500,
    tabIconSelected: Palette.indigo400,

    // Nav
    navBackground:   Palette.gray900,

    // Separadores
    border:          Palette.gray200,
    divider:         Palette.gray100,

    // Transacciones
    income:          Palette.green600,
    incomeBg:        Palette.green100,
    expense:         Palette.red600,
    expenseBg:       Palette.red100,

    // Advertencias
    warning:         Palette.amber600,
    warningBg:       Palette.amber50,
    warningBorder:   Palette.amber200,
  },
  dark: {
    // Texto
    text:          '#f1f5f9',
    textSecondary: Palette.gray300,
    textMuted:     Palette.gray400,

    // Fondos
    background:    '#0f172a',
    card:          Palette.gray800,
    input:         Palette.gray800,
    inputBorder:   Palette.gray600,

    // Primario
    tint:            Palette.indigo400,
    tintLight:       '#1e1b4b',
    tintBorder:      Palette.indigo500,

    // Iconos
    icon:            Palette.gray300,
    tabIconDefault:  Palette.gray400,
    tabIconSelected: Palette.indigo400,

    // Nav
    navBackground:   Palette.gray900,

    // Separadores
    border:          Palette.gray600,
    divider:         Palette.gray700,

    // Transacciones
    income:          '#4ade80',
    incomeBg:        '#14532d',
    expense:         '#f87171',
    expenseBg:       '#7f1d1d',

    // Advertencias
    warning:         '#fbbf24',
    warningBg:       '#1c1008',
    warningBorder:   '#92400e',
  },
};

// ─── Tipografía ────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});
