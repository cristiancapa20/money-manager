/**
 * Cola de operaciones de escritura pendientes cuando la app esta offline.
 *
 * Cada item serializa el nombre de la funcion en database.ts y sus argumentos.
 * Al recuperar conexion se drena en orden FIFO.
 *
 * Limitaciones conocidas:
 * - No hay actualizacion optimista del estado local (al flushear, los contextos
 *   deben refrescar desde Turso). El banner muestra el numero de pendientes.
 * - Si un op falla con error no transitorio, se descarta para no bloquear la cola
 *   (se loguea a consola).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

import * as db from './database';

const STORAGE_KEY = 'costos_sync_queue_v1';

export type QueueOpName =
  | 'insertTransaction'
  | 'updateTransaction'
  | 'deleteTransaction'
  | 'insertCategory'
  | 'updateCategory'
  | 'deleteCategory'
  | 'insertCard'
  | 'updateCard'
  | 'deleteCard'
  | 'insertSubscription'
  | 'updateSubscription'
  | 'deleteSubscription'
  | 'insertLoan'
  | 'updateLoan'
  | 'deleteLoan'
  | 'insertLoanPayment'
  | 'updateLoanPayment'
  | 'deleteLoanPayment';

export interface QueueOp {
  id: string;
  name: QueueOpName;
  args: unknown[];
  createdAt: number;
  attempts: number;
}

type Listener = (size: number) => void;

const listeners = new Set<Listener>();
let cachedQueue: QueueOp[] | null = null;
let draining = false;
let currentlyOnline = true;
let onFlushedCallback: (() => void) | null = null;

// ── Persistencia ────────────────────────────────────────────────────────────

async function load(): Promise<QueueOp[]> {
  if (cachedQueue) return cachedQueue;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cachedQueue = raw ? (JSON.parse(raw) as QueueOp[]) : [];
  } catch {
    cachedQueue = [];
  }
  return cachedQueue;
}

async function save(queue: QueueOp[]): Promise<void> {
  cachedQueue = queue;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
  notify(queue.length);
}

function notify(size: number) {
  listeners.forEach((l) => {
    try {
      l(size);
    } catch {
      // ignore listener errors
    }
  });
}

// ── API publica ─────────────────────────────────────────────────────────────

export async function enqueue(name: QueueOpName, args: unknown[]): Promise<void> {
  const queue = await load();
  const op: QueueOp = {
    id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    args,
    createdAt: Date.now(),
    attempts: 0,
  };
  queue.push(op);
  await save(queue);
}

export async function getQueueSize(): Promise<number> {
  const q = await load();
  return q.length;
}

export function subscribeQueue(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Callback invocado despues de un flush exitoso — util para que los contextos refresquen */
export function onFlushed(cb: (() => void) | null) {
  onFlushedCallback = cb;
}

export function isOnline(): boolean {
  return currentlyOnline;
}

// ── Ejecucion ───────────────────────────────────────────────────────────────

function execOp(op: QueueOp): Promise<unknown> {
  const fn = (db as any)[op.name];
  if (typeof fn !== 'function') {
    throw new Error(`Unknown queue op: ${op.name}`);
  }
  return fn(...op.args);
}

function isNetworkError(err: unknown): boolean {
  const msg = String((err as any)?.message ?? err ?? '').toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('failed to fetch') ||
    msg.includes('timeout') ||
    msg.includes('econnrefused') ||
    msg.includes('unreachable')
  );
}

export async function flushQueue(): Promise<void> {
  if (draining) return;
  if (!currentlyOnline) return;
  draining = true;
  try {
    let queue = await load();
    while (queue.length > 0) {
      if (!currentlyOnline) break;
      const [head, ...rest] = queue;
      try {
        await execOp(head);
        queue = rest;
        await save(queue);
      } catch (err) {
        if (isNetworkError(err)) {
          // Red fallo de nuevo — dejar en cola y salir
          break;
        }
        // Error no transitorio — descartar y seguir para no bloquear
        console.warn('[sync-queue] descarta op', head.name, err);
        queue = rest;
        await save(queue);
      }
    }
    if (onFlushedCallback) {
      try {
        onFlushedCallback();
      } catch {
        // ignore
      }
    }
  } finally {
    draining = false;
  }
}

// ── Suscripcion a NetInfo (auto-flush) ──────────────────────────────────────

function applyNetState(state: NetInfoState) {
  const prev = currentlyOnline;
  const reachable = state.isInternetReachable;
  currentlyOnline = Boolean(state.isConnected) && reachable !== false;
  if (!prev && currentlyOnline) {
    // transicion offline → online: intentar drenar
    flushQueue().catch(() => {});
  }
}

NetInfo.fetch().then(applyNetState).catch(() => {});
NetInfo.addEventListener(applyNetState);

// ── Helper de escritura con fallback a cola ─────────────────────────────────

/**
 * Ejecuta una operacion remota. Si estamos offline o la llamada falla por red,
 * encola la operacion y resuelve sin error para no romper el flujo de UI.
 * Otros errores (validacion, permisos) se propagan normalmente.
 */
export async function runOrQueue(name: QueueOpName, args: unknown[]): Promise<void> {
  if (!currentlyOnline) {
    await enqueue(name, args);
    return;
  }
  try {
    await execOp({ id: '', name, args, createdAt: 0, attempts: 0 });
  } catch (err) {
    if (isNetworkError(err)) {
      await enqueue(name, args);
      return;
    }
    throw err;
  }
}
