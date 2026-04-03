
export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}

export const categoryMap: Record<string, CategoryInfo> = {
  'Alimentación':    { name: 'Alimentación',    icon: 'restaurant-outline',      color: '#FF6B6B' },
  'Transporte':      { name: 'Transporte',      icon: 'car-outline',             color: '#4ECDC4' },
  'Vivienda':        { name: 'Vivienda',        icon: 'home-outline',            color: '#45B7D1' },
  'Salud':           { name: 'Salud',           icon: 'medical-outline',         color: '#96CEB4' },
  'Entretenimiento': { name: 'Entretenimiento', icon: 'game-controller-outline', color: '#FFEAA7' },
  'Educación':       { name: 'Educación',       icon: 'school-outline',          color: '#DDA0DD' },
  'Ropa':            { name: 'Ropa',            icon: 'shirt-outline',           color: '#F0A500' },
  'Tecnología':      { name: 'Tecnología',      icon: 'laptop-outline',          color: '#6C5CE7' },
  'Servicios':       { name: 'Servicios',       icon: 'construct-outline',       color: '#A29BFE' },
  'Otros':           { name: 'Otros',           icon: 'ellipse-outline',         color: '#B2BEC3' },
  'Préstamo':        { name: 'Préstamo',        icon: 'cash-outline',            color: '#00B894' },
  'Deuda':           { name: 'Deuda',           icon: 'trending-down-outline',   color: '#E17055' },
};

export function getCategoryInfo(categoryName: string): CategoryInfo {
  return categoryMap[categoryName] || categoryMap['Otros'];
}



