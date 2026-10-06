import { useEffect, useRef, useState } from 'react';
import type { Invitation, NewInvitation, Restaurant } from '../types';
import { combineDateAndTime, formatEuro, formatShortDate, formatWindow, toDateInputValue } from '../lib/format';
import { CopyIcon } from './Icons';

export interface InviteManagerProps {
  restaurants: Pick<Restaurant, 'id' | 'name'>[];
  /** Earlier invitations, newest first. */
  invitations: Invitation[];
  /** Create the invitation in your backend and return it (with its final URL). */
  onCreate: (input: NewInvitation) => Promise<Invitation>;
  /** "läuft · ansehen" link target for running invitations. */
  ordersHref?: (invitation: Invitation) => string;
  onOpenOrders?: (invitation: Invitation) => void;
  defaultFrom?: string;
  defaultUntil?: string;
}

type Status = 'geplant' | 'läuft' | 'abgelaufen';
const statusOf = (inv: Invitation, now: number): Status => {
  if (now < new Date(inv.validFrom).getTime()) return 'geplant';
  if (now < new Date(inv.validUntil).getTime()) return 'läuft';
  return 'abgelaufen';
};

/** Admin: pick restaurant + time window, generate the link, see earlier sheets. */
export function InviteManager({
  restaurants,
  invitations,
  onCreate,
  ordersHref = (inv) => `#/admin/bestellungen?zettel=${encodeURIComponent(inv.id)}`,
  onOpenOrders,
  defaultFrom = '11:30',
  defaultUntil = '12:15',
}: InviteManagerProps) {
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? '');
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [from, setFrom] = useState(defaultFrom);
  const [until, setUntil] = useState(defaultUntil);
  const [created, setCreated] = useState<Invitation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!restaurants.some((r) => r.id === restaurantId)) setRestaurantId(restaurants[0]?.id ?? '');
  }, [restaurants, restaurantId]);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const handleCreate = async () => {
    const validFrom = combineDateAndTime(date, from);
    const validUntil = combineDateAndTime(date, until);
    if (!restaurantId) return setError('Erst ein Restaurant anlegen.');
    if (!validFrom || !validUntil) return setError('Datum und Uhrzeiten bitte ausfüllen.');
    if (validUntil <= validFrom) return setError('„bis“ muss nach „von“ liegen.');
    if (validUntil.getTime() <= Date.now()) return setError('Das Zeitfenster liegt schon in der Vergangenheit.');

    setBusy(true);
    setError('');
    try {
      setCreated(await onCreate({ restaurantId, validFrom, validUntil }));
      setCopied(false);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Link erzeugen hat nicht geklappt.');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.url);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Kopieren ging nicht – bitte den Link markieren und selbst kopieren.');
    }
  };

  const now = Date.now();

  return (
    <>
      <div className="fz-row fz-row--double">
        <h1 className="fz-h1">Neuen Zettel rumgehen lassen</h1>
      </div>

      <div className="fz-row fz-row--grow fz-row--wrap">
        <label className="fz-field">
          Restaurant
          <select className="fz-input fz-input--hand" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="fz-row fz-row--grow fz-row--wrap">
        <label className="fz-field">
          Datum
          <input type="date" className="fz-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="fz-field">
          bestellbar von
          <input type="time" className="fz-input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="fz-field">
          bis
          <input type="time" className="fz-input" value={until} onChange={(e) => setUntil(e.target.value)} />
        </label>
      </div>

      <div className="fz-row fz-row--double fz-row--center" style={{ gap: 16, flexWrap: 'wrap' }}>
        <button type="button" className="fz-btn fz-btn--stamp" style={{ fontSize: 30, height: 52 }} disabled={busy} onClick={handleCreate}>
          {busy ? 'Moment …' : 'Link erzeugen'}
        </button>
        <span role="status" className="fz-error">
          {error}
        </span>
      </div>

      {created && (
        <div className="fz-block" style={{ height: 192, display: 'flex', alignItems: 'center' }}>
          <div className="fz-slip">
            <div className="fz-slip__meta">
              Link für alle · {created.restaurantName} · {formatShortDate(created.validFrom)}{' '}
              {formatWindow(created.validFrom, created.validUntil)} Uhr
            </div>
            <div className="fz-slip__body">
              <code className="fz-slip__link">{created.url}</code>
              <button type="button" className="fz-btn" onClick={handleCopy}>
                <CopyIcon />
                <span aria-live="polite">{copied ? 'Kopiert!' : 'Kopieren'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fz-row fz-row--double">
        <h2 className="fz-h2">Frühere Zettel</h2>
      </div>

      {invitations.length === 0 ? (
        <div className="fz-row">
          <span className="fz-small fz-muted">Noch keine Zettel verschickt.</span>
        </div>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%', display: 'block' }}>
          <thead style={{ display: 'block' }}>
            <tr className="fz-grid fz-grid--history fz-th">
              <th className="fz-hide-sm" style={{ fontWeight: 400, textAlign: 'left' }}>Datum</th>
              <th style={{ fontWeight: 400, textAlign: 'left' }}>Restaurant</th>
              <th className="fz-hide-sm" style={{ fontWeight: 400, textAlign: 'left' }}>Zeitfenster</th>
              <th className="fz-hide-sm fz-right" style={{ fontWeight: 400 }}>Zettel</th>
              <th className="fz-right" style={{ fontWeight: 400 }}>Summe</th>
              <th style={{ fontWeight: 400, textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody style={{ display: 'block' }}>
            {invitations.map((inv) => {
              const status = statusOf(inv, now);
              return (
                <tr key={inv.id} className="fz-grid fz-grid--history">
                  <td className="fz-hide-sm">{formatShortDate(inv.validFrom)}</td>
                  <td className="fz-ellipsis">{inv.restaurantName}</td>
                  <td className="fz-hide-sm">{formatWindow(inv.validFrom, inv.validUntil)}</td>
                  <td className="fz-hide-sm fz-right">{inv.orderCount ?? '–'}</td>
                  <td className="fz-right fz-nowrap">{inv.totalCents != null ? formatEuro(inv.totalCents) : '–'}</td>
                  <td>
                    {status === 'abgelaufen' ? (
                      <span className="fz-muted" style={{ fontSize: 16 }}>
                        abgelaufen
                      </span>
                    ) : (
                      <a
                        href={ordersHref(inv)}
                        onClick={
                          onOpenOrders
                            ? (e) => {
                                e.preventDefault();
                                onOpenOrders(inv);
                              }
                            : undefined
                        }
                        className="fz-hand fz-status-link"
                        style={{ fontWeight: 700, fontSize: 24, color: 'var(--fz-green)' }}
                      >
                        {status} · ansehen
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
