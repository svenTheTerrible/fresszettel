import { useEffect, useMemo, useState } from 'react';
import type { OrderDraft } from '../types';
import { formatEuro, formatTime } from '../lib/format';
import type { OrderMenuView } from '../lib/orders';
import type { MenuItemView } from '../lib/restaurants';
import { useCountdown } from '../hooks/useCountdown';
import { useSubmitState } from '../hooks/useSubmitState';

export interface OrderSheetProps {
  /** The order sheet data from the backend (get-menu by token). */
  view: OrderMenuView;
  /** Prefill, e.g. when the user reopens the link and already has an order. */
   initialName?: string;
  initialQuantities?: Record<string, number>;
  /** Called on "Zettel abgeben" (and again after "Nochmal ändern"). Throw to show an error. */
  onSubmit: (draft: OrderDraft) => Promise<void> | void;
  /** Called whenever the name or the selected dishes change (for remembering). */
  onPersist?: (name: string, quantities: Record<string, number>) => void;
}

/** The page behind the invitation link: tick dishes, set quantities, hand in the sheet. */
export function OrderSheet({
  view,
  initialName = '',
  initialQuantities = {},
  onSubmit,
  onPersist,
}: OrderSheetProps) {
  const restaurantName = view.name ?? '';
  const restaurantPhone = view.phone ?? undefined;
  const menu: MenuItemView[] = view.menuItems ?? [];
  const deadline = formatTime(view.deadline ?? '');

  const [name, setName] = useState(initialName);
  const [qty, setQty] = useState<Record<string, number>>(initialQuantities);
  const [submitted, setSubmitted] = useState(false);
  const { busy, setBusy, error, setError } = useSubmitState();
  const countdown = useCountdown(view.deadline ?? '');

  // Remember what the visitor typed so reopening the link restores it.
  useEffect(() => {
    onPersist?.(name, qty);
  }, [name, qty, onPersist]);

  const setQuantity = (id: number, q: number) =>
    setQty((prev) => ({ ...prev, [String(id)]: Math.max(0, Math.min(20, q)) }));

  const chosen = useMemo(
    () => menu
        .filter((m) => (qty[String(m.id)] ?? 0) > 0)
        .map((m) => ({ item: m, quantity: qty[String(m.id)] })),
    [menu, qty],
  );
  const total = chosen.reduce((sum, c) => sum + (c.item.price ?? 0) * c.quantity, 0);
  const summary = chosen.length
    ? chosen.map((c) => `${c.quantity}× Nr. ${c.item.orderNumber}`).join(', ')
    : 'noch nichts angestrichen';

  const trimmedName = name.trim();
  const cannotSubmit = busy || chosen.length === 0 || trimmedName.length === 0;
  const hint = error
    ? error
    : !trimmedName
      ? 'Erst noch deinen Namen eintragen.'
      : chosen.length
        ? `Du kannst bis ${deadline} Uhr noch ändern.`
        : 'Streich mindestens ein Gericht an.';

  const handleSubmit = async () => {
    if (cannotSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        name: trimmedName,
        lines: chosen.map((c) => ({ menuItemId: c.item.id, quantity: c.quantity })),
      });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Das hat nicht geklappt. Versuch es nochmal.');
    } finally {
      setBusy(false);
    }
  };

  const stage: 'open' | 'done' | 'expired' = submitted ? 'done' : countdown.expired ? 'expired' : 'open';

  return (
    <div className="fz-desk">
      <main className="fz-sheet fz-sheet--order">
        <div className="fz-row fz-row--double fz-row--between">
          <h1 className="fz-logo">Fresszettel</h1>
          {!countdown.expired && (
            <div className="fz-circled" aria-live="off">
              <span className="fz-hide-sm">noch </span>
              {countdown.label}
            </div>
          )}
        </div>

        <div className="fz-row fz-row--grow">
          <span className="fz-text fz-strong-ink" style={{ fontSize: 22 }}>
            {restaurantName}
          </span>
          <span className="fz-small fz-muted">
            {restaurantPhone ? `· Tel. ${restaurantPhone} ` : ''}· bestellt wird um {deadline}
          </span>
        </div>

        {stage === 'open' && (
          <>
            <div className="fz-row">
              <p className="fz-small fz-muted" style={{ margin: 0 }}>
                Tipp auf ein Gericht, um es anzustreichen. Mit + und − änderst du die Menge.
              </p>
            </div>

            <div className="fz-spacer" />

            <div className="fz-row">
              <label htmlFor="fz-eater" className="fz-text fz-nowrap">
                Dein Name:
              </label>
              <input
                id="fz-eater"
                className="fz-input fz-input--hand fz-input--name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Sven"
                autoComplete="given-name"
                maxLength={60}
              />
            </div>

            <div className="fz-spacer" />

            <div className="fz-grid fz-grid--order fz-th" aria-hidden="true">
              <span className="fz-right">Nr.</span>
              <span>Gericht</span>
              <span className="fz-right">Preis</span>
              <span style={{ textAlign: 'center' }}>Menge</span>
            </div>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Speisekarte">
              {menu.map((item) => {
                const q = qty[String(item.id)] ?? 0;
                const has = q > 0;
                return (
                  <li key={item.id} className="fz-grid fz-grid--order">
                    <span className="fz-no">{item.orderNumber}</span>
                    <button
                      type="button"
                      className="fz-pick"
                      aria-pressed={has}
                      onClick={() => setQuantity(item.id, has ? 0 : 1)}
                    >
                      <span className={`fz-pick__name${has ? ' fz-highlight' : ''}`}>{item.name}</span>
                      {item.description && <span className="fz-pick__desc fz-hide-sm">{item.description}</span>}
                    </button>
                    <span className="fz-text fz-right fz-nowrap">{formatEuro(item.price ?? 0)}</span>
                    <div className="fz-qty">
                      {has && (
                        <>
                          <button
                            type="button"
                            className="fz-qbtn"
                            aria-label={`${item.name}: eins weniger`}
                            onClick={() => setQuantity(item.id, q - 1)}
                          >
                            −
                          </button>
                          <span className="fz-qty__count" aria-label={`${q} Stück`}>
                            {q}×
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        className="fz-qbtn fz-qbtn--outline"
                        aria-label={`${item.name}: eins mehr`}
                        disabled={q >= 20}
                        onClick={() => setQuantity(item.id, q + 1)}
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="fz-spacer" />

            <div className="fz-row fz-row--grow">
              <span className="fz-small fz-muted fz-nowrap">Dein Zettel:</span>
              <span className="fz-hand" style={{ fontSize: 26, lineHeight: '32px' }}>
                {summary}
              </span>
            </div>

            <div className="fz-row fz-row--between">
              <span>Summe</span>
              <span className="fz-total">{formatEuro(total)}</span>
            </div>

            <div className="fz-spacer" />

            <div className="fz-row fz-row--double fz-row--center" style={{ gap: 20, flexWrap: 'wrap' }}>
              <button type="button" className="fz-btn fz-btn--stamp" disabled={cannotSubmit} onClick={handleSubmit}>
                {busy ? 'Wird abgegeben …' : 'Zettel abgeben'}
              </button>
              <span role={error ? 'alert' : undefined} className={error ? 'fz-error' : 'fz-muted'} style={{ fontSize: 15, lineHeight: '22px' }}>
                {hint}
              </span>
            </div>
          </>
        )}

        {stage === 'done' && (
          <>
            <div className="fz-spacer" />
            <div className="fz-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ height: 144, display: 'flex', alignItems: 'center' }}>
                <div role="status" className="fz-stamp">
                  Abgegeben
                </div>
              </div>
              <p className="fz-text" style={{ margin: 0, lineHeight: '48px' }}>
                Danke, <strong style={{ color: 'var(--fz-ink)' }}>{trimmedName}</strong>! Dein Zettel liegt beim Admin.
              </p>
              <p className="fz-hand" style={{ margin: 0, fontSize: 28, lineHeight: '48px' }}>
                {summary} · {formatEuro(total)}
              </p>
              {!countdown.expired && (
                <>
                  <p className="fz-small fz-muted" style={{ margin: 0, lineHeight: '48px' }}>
                    Bis {deadline} Uhr kannst du noch ändern (noch {countdown.label}).
                  </p>
                  <div style={{ height: 96, display: 'flex', alignItems: 'center' }}>
                    <button type="button" className="fz-btn fz-btn--stamp fz-btn--stamp-sm" onClick={() => setSubmitted(false)}>
                      Nochmal ändern
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {stage === 'expired' && (
          <>
            <div className="fz-spacer" />
            <div className="fz-block">
              <p
                className="fz-hand"
                style={{ margin: 0, fontWeight: 700, fontSize: 56, lineHeight: '96px', color: 'var(--fz-red)', transform: 'rotate(-2deg)' }}
              >
                Zu spät, der Zettel ist weg.
              </p>
              <p className="fz-text" style={{ margin: 0, lineHeight: '48px' }}>
                Dieser Link war bis {deadline} Uhr gültig. Jetzt wird schon telefoniert.
              </p>
              <p className="fz-small fz-muted" style={{ margin: 0, lineHeight: '48px' }}>
                Hast du noch Hunger? Frag beim Admin nach einem neuen Link.
              </p>
              <div style={{ height: 240 }} />
            </div>
          </>
        )}
      </main>
      <p className="fz-footer-note">Fresszettel · Bestellen wie früher, nur ohne Kuli.</p>
    </div>
  );
}
