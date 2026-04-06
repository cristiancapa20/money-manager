import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { Loan } from '@/types/loan';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('loan-reminders', {
      name: 'Recordatorios de Préstamos',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a local notification for a loan reminder.
 * Cancels any existing notification for the same loan first.
 */
export async function scheduleLoanReminder(loan: Loan): Promise<void> {
  // Cancel existing reminder for this loan
  await cancelLoanReminder(loan.id);

  if (!loan.dueDate || loan.reminderDays == null || loan.status === 'PAID') return;

  const dueDate = new Date(loan.dueDate);
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - loan.reminderDays);

  // Don't schedule if reminder date is in the past
  if (reminderDate <= new Date()) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const isLent = loan.type === 'LENT';
  const title = isLent
    ? `Préstamo por vencer`
    : `Deuda por vencer`;
  const body = isLent
    ? `${loan.contactName} te debe $${loan.amount.toFixed(2)} — vence el ${dueDate.toLocaleDateString()}`
    : `Le debes $${loan.amount.toFixed(2)} a ${loan.contactName} — vence el ${dueDate.toLocaleDateString()}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { loanId: loan.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: Platform.OS === 'android' ? 'loan-reminders' : undefined,
    },
    identifier: `loan-reminder-${loan.id}`,
  });
}

/** Cancel a scheduled reminder for a specific loan. */
export async function cancelLoanReminder(loanId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`loan-reminder-${loanId}`);
}

/** Reschedule all active loan reminders (e.g. on app startup). */
export async function rescheduleAllLoanReminders(loans: Loan[]): Promise<void> {
  // Cancel all existing loan reminders
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('loan-reminder-')) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Schedule active loans with reminders
  for (const loan of loans) {
    if (loan.status === 'ACTIVE' && loan.dueDate && loan.reminderDays != null) {
      await scheduleLoanReminder(loan);
    }
  }
}
