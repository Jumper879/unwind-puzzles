import { supabase, isSupabaseConfigured } from './supabase'

const QUEUE_KEY = 'unwind:result-sync-queue'

export interface PendingResult {
  sessionId: string
  score: number
  timeMs: number
  moves?: number
  hintsUsed?: number
  mistakes?: number
  queuedAt: string
}

function readQueue(): PendingResult[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as PendingResult[]) : []
  } catch {
    return []
  }
}

function writeQueue(queue: PendingResult[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

/**
 * Called by a game when a round ends. Submits immediately if online and
 * configured; otherwise (or on a network failure) queues it for
 * `syncPendingResults` to retry once connectivity returns. Never throws —
 * a failed score submission should never crash the result screen.
 */
export async function submitResult(entry: Omit<PendingResult, 'queuedAt'>): Promise<void> {
  const pending: PendingResult = { ...entry, queuedAt: new Date().toISOString() }

  if (!isSupabaseConfigured || !navigator.onLine) {
    enqueue(pending)
    return
  }

  const ok = await trySubmit(pending)
  if (!ok) enqueue(pending)
}

function enqueue(entry: PendingResult) {
  const queue = readQueue()
  queue.push(entry)
  writeQueue(queue)
}

/**
 * Submits one entry. Returns true if it's resolved (submitted, or already
 * submitted previously — the RPC's "session is not active" error means an
 * earlier attempt already got through, so a retry is a no-op success, not
 * a failure) — false only for a genuine network/server failure that
 * should be retried later.
 */
async function trySubmit(entry: PendingResult): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.rpc('submit_result', {
    p_session_id: entry.sessionId,
    p_score: entry.score,
    p_time_ms: entry.timeMs,
    p_moves: entry.moves ?? null,
    p_hints_used: entry.hintsUsed ?? 0,
    p_mistakes: entry.mistakes ?? 0,
  })
  if (!error) return true
  if (error.message.includes('is not active') || error.message.includes('not found')) {
    return true // already synced (or the session expired) — drop it, not a retry case
  }
  return false
}

/** Drains the queue in order, stopping at the first genuine failure so later entries keep their place. */
export async function syncPendingResults(): Promise<void> {
  if (!isSupabaseConfigured || !navigator.onLine) return
  const queue = readQueue()
  if (queue.length === 0) return

  const remaining: PendingResult[] = []
  for (const entry of queue) {
    const ok = await trySubmit(entry)
    if (!ok) remaining.push(entry)
  }
  writeQueue(remaining)
}

export function getPendingResultCount(): number {
  return readQueue().length
}

let initialized = false

/** Wires the online-event listener. Call once at app startup. */
export function initSyncQueue() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  window.addEventListener('online', () => {
    void syncPendingResults()
  })
  if (navigator.onLine) void syncPendingResults()
}
