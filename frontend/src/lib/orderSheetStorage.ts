/**
 * Remembers a visitor's order sheet in localStorage so that when they reopen
 * their invitation link the name and the dishes they ticked are restored and
 * they can hand the sheet in again.
 *
 * The name lives under a single key (a person's name is the same on every
 * sheet). The chosen dishes are stored per invitation token, and each entry
 * carries a timestamp so that entries older than two weeks are dropped — this
 * keeps localStorage from filling up with one record per token.
 */

const NAME_KEY = 'fresszettel:orderSheet:name';
const ORDER_KEY_PREFIX = 'fresszettel:orderSheet:order:';
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

/** A remembered dish selection for one invitation token. */
export interface SavedOrder {
  /** menuItemId -> quantity, exactly as the OrderSheet keeps it. */
  quantities: Record<string, number>;
  /** Epoch milliseconds when the entry was last written. */
  savedAt: number;
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or storage disabled — nothing to do.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

/** The remembered name, or '' when none is stored. */
export function loadName(): string {
  return read(NAME_KEY) ?? '';
}

export function saveName(name: string): void {
  write(NAME_KEY, name);
}

function orderKey(token: string): string {
  return ORDER_KEY_PREFIX + token;
}

/** The remembered dish selection for a token, or null when none is stored. */
export function loadOrder(token: string): SavedOrder | null {
  const raw = read(orderKey(token));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SavedOrder>;
    if (parsed == null || typeof parsed !== 'object' || parsed.quantities == null || typeof parsed.quantities !== 'object') {
      return null;
    }
    return {
      quantities: parsed.quantities as Record<string, number>,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveOrder(token: string, quantities: Record<string, number>): void {
  const record: SavedOrder = { quantities, savedAt: Date.now() };
  write(orderKey(token), JSON.stringify(record));
}

/** Drop remembered sheets older than two weeks so storage never grows unbounded. */
export function pruneExpiredOrders(now: number = Date.now()): void {
  try {
    const stale: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key == null || !key.startsWith(ORDER_KEY_PREFIX)) continue;
      const saved = loadOrder(key.slice(ORDER_KEY_PREFIX.length));
      if (saved && now - saved.savedAt > TWO_WEEKS_MS) {
        stale.push(key);
      }
    }
    for (const key of stale) {
      remove(key);
    }
  } catch {
    // Storage unavailable — nothing to prune.
  }
}
