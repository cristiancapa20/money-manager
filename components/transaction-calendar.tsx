import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Transaction } from './add-transaction-modal';

interface TransactionCalendarProps {
  transactions: Transaction[];
}

export function TransactionCalendar({ transactions }: TransactionCalendarProps) {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtener año y mes actual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Obtener el primer día del mes y cuántos días tiene
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 6 = Sábado

  // Nombres de los días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Crear un mapa de días con transacciones
  const transactionsByDate = useMemo(() => {
    const map = new Map<string, { count: number; hasIncome: boolean; hasExpense: boolean }>();

    transactions.forEach((transaction) => {
      // Obtener la fecha de creación de la transacción
      let date: Date;
      
      // Intentar usar createdAt si está disponible
      if ((transaction as any).createdAt) {
        date = new Date((transaction as any).createdAt);
        if (isNaN(date.getTime())) {
          // Si createdAt no es válido, usar el ID como timestamp
          if (transaction.id && !isNaN(parseInt(transaction.id))) {
            date = new Date(parseInt(transaction.id));
            if (isNaN(date.getTime())) {
              date = new Date();
            }
          } else {
            date = new Date();
          }
        }
      } else if (transaction.id && !isNaN(parseInt(transaction.id))) {
        // Usar el ID como timestamp si createdAt no está disponible
        date = new Date(parseInt(transaction.id));
        if (isNaN(date.getTime())) {
          date = new Date();
        }
      } else {
        date = new Date();
      }
      
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!map.has(dateKey)) {
        map.set(dateKey, { count: 0, hasIncome: false, hasExpense: false });
      }
      
      const entry = map.get(dateKey)!;
      entry.count += 1;
      if (transaction.type === 'income') {
        entry.hasIncome = true;
      } else {
        entry.hasExpense = true;
      }
    });

    return map;
  }, [transactions]);

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generar los días del calendario
  const calendarDays = [];
  
  // Agregar días vacíos al inicio para alinear el primer día del mes
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Agregar los días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = transactionsByDate.get(dateKey);
    calendarDays.push({ day, dateKey, ...dayData });
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header del calendario */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDark ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.monthTitle}>
          {monthNames[month]} {year}
        </ThemedText>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isDark ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDay}>
            <Text
              style={[
                styles.weekDayText,
                isDark && styles.weekDayTextDark,
              ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid del calendario */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => {
          if (dayData === null) {
            return <View key={index} style={styles.dayCell} />;
          }

          const { day, hasIncome, hasExpense, count } = dayData || {};

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isDark && styles.dayCellDark,
              ]}>
              <View style={styles.dayContent}>
                <Text
                  style={[
                    styles.dayText,
                    isDark && styles.dayTextDark,
                  ]}>
                  {day}
                </Text>
                {count && count > 0 && (
                  <View style={styles.iconContainer}>
                    {hasIncome && (
                      <Ionicons
                        name="arrow-up-circle"
                        size={10}
                        color="#4ADE80"
                        style={styles.icon}
                      />
                    )}
                    {hasExpense && (
                      <Ionicons
                        name="arrow-down-circle"
                        size={10}
                        color="#F87171"
                        style={styles.icon}
                      />
                    )}
                    {count > 1 && (
                      <View style={[styles.badge, isDark && styles.badgeDark]}>
                        <Text style={styles.badgeText}>{count}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1F1F1F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  weekDayTextDark: {
    color: '#999',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCellDark: {
    // Estilos adicionales si es necesario
  },
  dayContent: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    lineHeight: 16,
  },
  dayTextDark: {
    color: '#fff',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexWrap: 'wrap',
  },
  icon: {
    marginHorizontal: 0,
  },
  badge: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeDark: {
    backgroundColor: '#1E40AF',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  legendTextDark: {
    color: '#999',
  },
});

