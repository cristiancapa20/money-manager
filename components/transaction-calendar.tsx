import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Transaction } from '@/types/transaction';

interface TransactionCalendarProps {
  transactions: Transaction[];
}

export function TransactionCalendar({ transactions }: TransactionCalendarProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const transactionsByDate = useMemo(() => {
    const map = new Map<string, { count: number; hasIncome: boolean; hasExpense: boolean }>();

    transactions.forEach((transaction) => {
      let date: Date;

      if ((transaction as any).createdAt) {
        date = new Date((transaction as any).createdAt);
        if (isNaN(date.getTime())) {
          date = transaction.id && !isNaN(parseInt(transaction.id))
            ? new Date(parseInt(transaction.id))
            : new Date();
        }
      } else if (transaction.id && !isNaN(parseInt(transaction.id))) {
        date = new Date(parseInt(transaction.id));
        if (isNaN(date.getTime())) date = new Date();
      } else {
        date = new Date();
      }

      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!map.has(dateKey)) {
        map.set(dateKey, { count: 0, hasIncome: false, hasExpense: false });
      }

      const entry = map.get(dateKey)!;
      entry.count += 1;
      if (transaction.type === 'income') entry.hasIncome = true;
      else entry.hasExpense = true;
    });

    return map;
  }, [transactions]);

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarDays: (null | { day: number; dateKey: string; count?: number; hasIncome?: boolean; hasExpense?: boolean })[] = [];

  for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = transactionsByDate.get(dateKey);
    calendarDays.push({ day, dateKey, ...dayData });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, shadowColor: '#000' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={[styles.navButton, { backgroundColor: theme.divider }]}>
          <Ionicons name="chevron-back" size={18} color={theme.tint} />
        </TouchableOpacity>

        <ThemedText type="subtitle" style={styles.monthTitle}>
          {monthNames[month]} {year}
        </ThemedText>

        <TouchableOpacity onPress={goToNextMonth} style={[styles.navButton, { backgroundColor: theme.divider }]}>
          <Ionicons name="chevron-forward" size={18} color={theme.tint} />
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDay}>
            <Text style={[styles.weekDayText, { color: theme.textMuted }]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => {
          if (dayData === null) {
            return <View key={index} style={styles.dayCell} />;
          }

          const { day, hasIncome, hasExpense, count } = dayData;

          return (
            <TouchableOpacity key={index} style={styles.dayCell} activeOpacity={0.7}>
              <View style={styles.dayContent}>
                <Text style={[styles.dayText, { color: theme.text }]}>{day}</Text>
                {count && count > 0 && (
                  <View style={styles.iconContainer}>
                    {hasIncome && (
                      <Ionicons name="arrow-up-circle" size={10} color={theme.income} style={styles.icon} />
                    )}
                    {hasExpense && (
                      <Ionicons name="arrow-down-circle" size={10} color={theme.expense} style={styles.icon} />
                    )}
                    {count > 1 && (
                      <View style={[styles.badge, { backgroundColor: theme.tint }]}>
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
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: '600',
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
    lineHeight: 16,
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
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
});
