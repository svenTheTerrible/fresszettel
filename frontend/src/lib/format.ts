const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

/** 850 -> "8,50 €" */
export function formatEuro(cents: number): string {
  return euro.format(cents / 100);
}

/** "8,50", "8.50", "8,50 €", "8" -> 850. Returns null when it doesn't look like a price. */
export function parseEuro(input: string): number | null {
  const cleaned = input.replace(/€/g, '').replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}

/** "12:15" */
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

/** "Fr 02.10." */
export function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  const weekday = d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '');
  const day = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  return `${weekday} ${day}`;
}

/** "11:30–12:15" */
export function formatWindow(from: Date | string, until: Date | string): string {
  return `${formatTime(from)}–${formatTime(until)}`;
}

/** 2_832_000 ms -> "47:12 Min", over an hour -> "1:05 Std" */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')} Std`;
  return `${m}:${String(s).padStart(2, '0')} Min`;
}

/** Local date + "HH:MM" -> Date */
export function combineDateAndTime(isoDate: string, time: string): Date | null {
  if (!isoDate || !time) return null;
  const d = new Date(`${isoDate}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date -> "YYYY-MM-DD" in local time (for <input type="date">) */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Sort helper so "7" comes before "12". */
export function compareOrderNumbers(a: string, b: string): number {
  return a.localeCompare(b, 'de', { numeric: true });
}
