import { Platform } from 'react-native';
import type { Subscription } from '@/types/subscription';
import * as db from '@/database/database';

type NotificationsModule = typeof import('expo-notifications');

let _notifications: NotificationsModule | null = null;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web' && typeof window === 'undefined') return null;
  if (!_notifications) {
    _notifications = await import('expo-notifications');
  }
  return _notifications;
}

export interface SubscriptionProcessResult {
  processedAt: string;
  created: number;
  skipped: number;
  errors: number;
  processedNames: string[];
}

/**
 * Obtiene la fecha actual en timezone Ecuador (UTC-5).
 */
function getEcuadorDate(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utcMs - 5 * 60 * 60_000);
}

/**
 * Procesa suscripciones activas cuyo billingDay coincide con hoy (Ecuador TZ).
 * Crea transacciones EXPENSE automáticas con prevención de duplicados.
 */
export async function processSubscriptions(
  subscriptions: Subscription[],
  userId: string,
): Promise<SubscriptionProcessResult> {
  const ecuadorNow = getEcuadorDate();
  const today = ecuadorNow.getDate();
  const dateISO = ecuadorNow.toISOString();

  const activeDue = subscriptions.filter((s) => s.active && s.billingDay === today);

  let created = 0;
  let skipped = 0;
  let errors = 0;
  const processedNames: string[] = [];

  for (const sub of activeDue) {
    try {
      const wasCreated = await db.createSubscriptionTransaction(
        { ...sub, userId },
        dateISO,
      );
      if (wasCreated) {
        created++;
        processedNames.push(sub.name);
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`Error procesando suscripción "${sub.name}":`, err);
      errors++;
    }
  }

  // Enviar notificación local si se crearon transacciones
  if (created > 0) {
    await sendSubscriptionNotification(processedNames);
  }

  return {
    processedAt: new Date().toISOString(),
    created,
    skipped,
    errors,
    processedNames,
  };
}

async function sendSubscriptionNotification(names: string[]): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('subscription-billing', {
      name: 'Cobros de Suscripciones',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const title = names.length === 1
    ? `Suscripción cobrada`
    : `${names.length} suscripciones cobradas`;

  const body = names.length === 1
    ? `Se registró el cobro de "${names[0]}"`
    : `Se registraron: ${names.join(', ')}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'subscription-billing' },
    },
    trigger: null, // Inmediata
    identifier: `sub-billing-${Date.now()}`,
  });
}
