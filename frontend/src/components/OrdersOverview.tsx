import { useMemo } from 'react';
import type { Invitation, Order, Restaurant } from '../types';
import { compareOrderNumbers, formatEuro, formatShortDate, formatTime, formatWindow } from '../lib/format';
import { useCountdown } from '../hooks/useCountdown';

export interface OrdersOverviewProps {
  invitation: Invitation;
  /** The invitation's restaurant, used to look up dish names and prices. */
  restaurant: Restaurant;
  orders: Order[];
  /** Pass this only if your backend tracks payments; otherwise the paid column is hidden. */
  onTogglePaid?: (orderId: string, paid: boolean) => Promise<void> | void;
}

/** Admin: incoming orders, the list to read out on the phone, and the total to pay. */
export function OrdersOverview({ invitation, restaurant, orders, onTogglePaid }: OrdersOverviewProps) {
  const countdown = useCountdown(invitation.validUntil);
  const tracksPaid = Boolean(onTogglePaid);

  const { people, aggregate, totalCents, paidCents } = useMemo(() => {
    const byId = new Map(restaurant.menu.map((m) => [m.id, m]));
    const agg = new Map<string, { number: string; name: string; quantity: number; cents: number }>();
    let total = 0;
    let paid = 0;

    const people = orders.map((o) => {
      let sum = 0;
      const parts: string[] = [];
      for (const line of o.lines) {
        const item = byId.get(line.menuItemId);
        const price = item?.priceCents ?? 0;
        sum += price * line.quantity;
        parts.push(`${line.quantity}× Nr. ${item?.number ?? '?'}`);
        const key = line.menuItemId;
        const prev = agg.get(key) ?? { number: item?.number ?? '?', name: item?.name ?? 'Unbekanntes Gericht', quantity: 0, cents: 0 };
        agg.set(key, { ...prev, quantity: prev.quantity + line.quantity, cents: prev.cents + price * line.quantity });
      }
      total += sum;
      if (o.paid) paid += sum;
      return { id: o.id, name: o.name, items: parts.join(', '), sumCents: sum, paid: Boolean(o.paid) };
    });

    return {
      people,
      aggregate: [...agg.values()].sort((a, b) => compareOrderNumbers(a.number, b.number)),
      totalCents: total,
      paidCents: paid,
    };
  }, [orders, restaurant.menu]);

  const countText = orders.length === 1 ? '1 Zettel eingegangen' : `${orders.length} Zettel eingegangen`;

  return (
    <>
      <div className="fz-row fz-row--double fz-row--between" style={{ flexWrap: 'wrap', paddingRight: 0 }}>
        <h1 className="fz-h1">{restaurant.name}</h1>
        {countdown.expired ? (
          <div className="fz-circled">geschlossen</div>
        ) : (
          <div className="fz-circled fz-circled--green">läuft noch bis {formatTime(invitation.validUntil)}</div>
        )}
      </div>
      <div className="fz-row fz-row--grow">
        <span className="fz-small fz-muted">
          {formatShortDate(invitation.validFrom)} · {formatWindow(invitation.validFrom, invitation.validUntil)} Uhr · {countText}
          {restaurant.phone ? ` · Tel. ${restaurant.phone}` : ''}
        </span>
      </div>

      <div className="fz-cols">
        <section aria-labelledby="fz-call">
          <div className="fz-row fz-row--double" style={{ paddingLeft: 0 }}>
            <h2 id="fz-call" className="fz-h2">
              Für den Anruf
            </h2>
          </div>
          {aggregate.length === 0 && (
            <div className="fz-row" style={{ paddingLeft: 0 }}>
              <span className="fz-small fz-muted">Noch nichts bestellt.</span>
            </div>
          )}
          {aggregate.map((a) => (
            <div key={a.number + a.name} className="fz-grid fz-grid--agg">
              <span className="fz-hand" style={{ fontWeight: 700, fontSize: 28, lineHeight: '34px' }}>
                {a.quantity}×
              </span>
              <span className="fz-no" style={{ textAlign: 'left' }}>
                Nr. {a.number}
              </span>
              <span className="fz-ellipsis" style={{ fontSize: 19, lineHeight: '30px' }}>
                {a.name}
              </span>
              <span className="fz-right fz-nowrap" style={{ fontSize: 19, lineHeight: '30px' }}>
                {formatEuro(a.cents)}
              </span>
            </div>
          ))}
          <div className="fz-row fz-row--double fz-row--between" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <span className="fz-text">Gesamtbetrag</span>
            <span className="fz-total fz-total--big">{formatEuro(totalCents)}</span>
          </div>
        </section>

        <section aria-labelledby="fz-who">
          <div className="fz-row fz-row--double" style={{ paddingLeft: 0 }}>
            <h2 id="fz-who" className="fz-h2">
              Wer zahlt was?
            </h2>
          </div>
          {people.map((p) => (
            <div key={p.id} className={`fz-grid fz-grid--people${tracksPaid ? '' : ' fz-grid--people-nopaid'}`}>
              <span className="fz-hand fz-ellipsis" style={{ fontWeight: 700, fontSize: 27, lineHeight: '34px' }}>
                {p.name}
              </span>
              <span className="fz-pick__desc fz-hide-sm" style={{ fontSize: 16, fontWeight: 400 }}>
                {p.items}
              </span>
              <span className="fz-right fz-nowrap" style={{ fontSize: 19, lineHeight: '30px' }}>
                {formatEuro(p.sumCents)}
              </span>
              {tracksPaid && (
                <label className="fz-checkbox">
                  <input
                    type="checkbox"
                    checked={p.paid}
                    aria-label={`${p.name} hat bezahlt`}
                    onChange={() => void onTogglePaid?.(p.id, !p.paid)}
                  />
                </label>
              )}
            </div>
          ))}
          {tracksPaid && (
            <>
              <div className="fz-grid fz-grid--sum fz-muted" style={{ fontSize: 16, lineHeight: '30px' }}>
                <span>schon bezahlt</span>
                <span className="fz-right" style={{ paddingRight: 56 }}>
                  {formatEuro(paidCents)}
                </span>
              </div>
              <div className="fz-grid fz-grid--sum" style={{ fontSize: 19, lineHeight: '30px' }}>
                <span>noch offen</span>
                <span className="fz-right" style={{ paddingRight: 56, fontWeight: 700, color: 'var(--fz-red)' }}>
                  {formatEuro(totalCents - paidCents)}
                </span>
              </div>
            </>
          )}
        </section>
      </div>

      <div className="fz-row fz-row--double">
        <p className="fz-muted" style={{ margin: 0, fontSize: 15, lineHeight: '30px' }}>
          Neue Zettel tauchen hier von selbst auf, solange der Link läuft.
        </p>
      </div>
    </>
  );
}
