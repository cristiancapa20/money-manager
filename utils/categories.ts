import { Ionicons } from '@expo/vector-icons';

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}

export const categoryMap: Record<string, CategoryInfo> = {
  'Alimentación': { name: 'Alimentación', icon: 'restaurant-outline', color: '#F59E0B' },
  'Transporte': { name: 'Transporte', icon: 'car-outline', color: '#3B82F6' },
  'Entretenimiento': { name: 'Entretenimiento', icon: 'game-controller-outline', color: '#8B5CF6' },
  'Salud': { name: 'Salud', icon: 'medical-outline', color: '#EF4444' },
  'Educación': { name: 'Educación', icon: 'school-outline', color: '#10B981' },
  'Servicios': { name: 'Servicios', icon: 'construct-outline', color: '#6366F1' },
  'Compras': { name: 'Compras', icon: 'bag-outline', color: '#EC4899' },
  'Salario': { name: 'Salario', icon: 'cash-outline', color: '#22C55E' },
  'Freelance': { name: 'Freelance', icon: 'laptop-outline', color: '#06B6D4' },
  'Inversiones': { name: 'Inversiones', icon: 'trending-up-outline', color: '#14B8A6' },
  'Otros': { name: 'Otros', icon: 'ellipse-outline', color: '#6B7280' },
};

export function getCategoryInfo(categoryName: string): CategoryInfo {
  return categoryMap[categoryName] || categoryMap['Otros'];
}

