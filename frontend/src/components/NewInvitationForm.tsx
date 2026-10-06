import { useEffect, useRef, useState } from 'react';
import type { Invitation, NewInvitation, Restaurant } from '../types';
import { combineDateAndTime, formatShortDate, formatWindow, toDateInputValue } from '../lib/format';
import { CopyIcon } from './Icons';

export interface NewInvitationFormProps {
  restaurants: Pick<Restaurant, 'id' | 'name'>[];
  /** Create the invitation in your backend and return it (with its final URL). */
  onCreate: (input: NewInvitation) => Promise<Invitation>;
  defaultUntil?: string;
}

/** Pick a restaurant + time window, then generate the order link. */
export function NewInvitationForm({ restaurants, onCreate, defaultUntil = '12:15' }: NewInvitationFormProps) {
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? '');
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
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
    const validFrom = new Date();
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

  return (
    <>
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
    </>
  );
}
