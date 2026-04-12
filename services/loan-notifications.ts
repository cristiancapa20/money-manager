import { Platform } from 'react-native';
import type { Loan } from '@/types/loan';

type NotificationsModule = typeof import('expo-notifications');
type DeviceModule = typeof import('expo-device');

let _notifications: NotificationsModule | null = null;
let _device: DeviceModule | null = null;
let _handlerSet = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web' && typeof window === 'undefined') return null;
  if (!_notifications) {
    try {
      _notifications = await import('expo-notifications');
    } catch {
      return null;
    }
    if (!_handlerSet) {
      _handlerSet = true;
      _notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  }
  return _notifications;
}

async function getDevice(): Promise<DeviceModule | null> {
  if (Platform.OS === 'web' && typeof window === 'undefined') return null;
  if (!_device) {
    _device = await import('expo-device');
  }
  return _device;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Device = await getDevice();
  const Notifications = await getNotifications();
  if (!Device || !Notifications) return false;
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
  await cancelLoanReminder(loan.id);

  if (!loan.dueDate || loan.reminderDays == null || loan.status === 'PAID') return;

  const Notifications = await getNotifications();
  if (!Notifications) return;

  const dueDate = new Date(loan.dueDate);
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - loan.reminderDays);

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
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(`loan-reminder-${loanId}`);
}

/** Reschedule all active loan reminders (e.g. on app startup). */
export async function rescheduleAllLoanReminders(loans: Loan[]): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('loan-reminder-')) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  for (const loan of loans) {
    if (loan.status === 'ACTIVE' && loan.dueDate && loan.reminderDays != null) {
      await scheduleLoanReminder(loan);
    }
  }
}
