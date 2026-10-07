import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { compareOrderNumbers, formatEuro, formatShortDate, formatTime, formatWindow } from '../lib/format';
import { getOrdersView, setOrderPaid } from '../lib/orders';
import { useCountdown } from '../hooks/useCountdown';
import { LinkSlip } from './GenerateLinkButton';

export interface OrdersOverviewProps {
  /** The Zettel (order batch) id to load everything for. */
  zettelId: string;
}

/** Admin: incoming orders, the list to read out on the phone, and the total to pay. */
export function OrdersOverview({ zettelId }: OrdersOverviewProps) {
  const queryClient = useQueryClient();
  const [showLink, setShowLink] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders-view', zettelId],
    queryFn: () => getOrdersView(zettelId),
  });

  const countdown = useCountdown(data?.validUntil ?? '');

  const { people, aggregate, totalEuro, paidEuro } = useMemo(() => {
    if (!data) {
      return { people: [], aggregate: [], totalEuro: 0, paidEuro: 0 };
    }

    const byId = new Map(data.menu.map((m) => [m.id, m]));
    const agg = new Map<number, { number: string; name: string; quantity: number; euro: number }>();
    let total = 0;
    let paid = 0;

    const people = data.orders.map((order) => {
      let sum = 0;
      const parts: string[] = [];
      for (const line of order.lines) {
        const item = byId.get(line.menuItemId);
        const price = item?.price ?? 0;
        sum += price * line.quantity;
        parts.push(`${line.quantity}× Nr. ${item?.orderNumber ?? '?'}`);
        const key = line.menuItemId;
        const prev = agg.get(key) ?? { number: item?.orderNumber ?? '?', name: item?.name ?? 'Unbekantes Gericht', quantity: 0, euro: 0 };
        agg.set(key, { ...prev, quantity: prev.quantity + line.quantity, euro: prev.euro + price * line.quantity });
      }
      total += sum;
      if (order.paid) paid += sum;
      return { id: order.name, name: order.name, items: parts.join(', '), sumEuro: sum, paid: order.paid };
    });

    return {
      people,
      aggregate: [...agg.values()].sort((a, b) => compareOrderNumbers(a.number, b.number)),
      totalEuro: total,
      paidEuro: paid,
    };
  }, [data]);

  if (isLoading) {
    return <p style={{ padding: 24 }}>Wird geladen …</p>;
  }
  if (isError) {
    return <p style={{ padding: 24 }}>{error?.message ?? 'Das hat nicht geklappt. Versuch es nochmal.'}</p>;
  }
  if (!data) {
    return <p style={{ padding: 24 }}>Dieser Zettel gibt es nicht.</p>;
  }

  const { orders } = data;

  const handleTogglePaid = async (name: string, paid: boolean) => {
    try {
      await setOrderPaid(zettelId, name, paid);
    } catch {
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['orders-view', zettelId] });
  };

  const countText = orders.length === 1 ? '1 Zettel eingegangen' : `${orders.length} Zettel eingegangen`;

  return (
    <>
      <div className="fz-row fz-row--double fz-row--between" style={{ flexWrap: 'wrap', paddingRight: 0 }}>
        <h1 className="fz-h1">{data.restaurantName}</h1>
        {countdown.expired ? (
          <div className="fz-circled">geschlossen</div>
        ) : (
          <div className="fz-circled fz-circled--green">läuft noch bis {formatTime(data.validUntil)}</div>
        )}
      </div>
      <div className="fz-row fz-row--grow">
        <span className="fz-small fz-muted">
          {formatShortDate(data.validFrom)} · {formatWindow(data.validFrom, data.validUntil)} Uhr · {countText}
          {data.phone ? ` · Tel. ${data.phone}` : ''}
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
                {formatEuro(a.euro)}
              </span>
            </div>
          ))}
          <div className="fz-row fz-row--double fz-row--between" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <span className="fz-text">Gesamtbetrag</span>
            <span className="fz-total fz-total--big">{formatEuro(totalEuro)}</span>
          </div>
        </section>

        <section aria-labelledby="fz-who">
          <div className="fz-row fz-row--double" style={{ paddingLeft: 0 }}>
            <h2 id="fz-who" className="fz-h2">
              Wer zahlt was?
            </h2>
          </div>
          {people.map((p) => (
            <div key={p.id} className="fz-grid fz-grid--people">
              <span className="fz-hand fz-ellipsis" style={{ fontWeight: 700, fontSize: 27, lineHeight: '34px' }}>
                {p.name}
              </span>
              <span className="fz-pick__desc fz-hide-sm" style={{ fontSize: 16, fontWeight: 400 }}>
                {p.items}
              </span>
              <span className="fz-right fz-nowrap" style={{ fontSize: 19, lineHeight: '30px' }}>
                {formatEuro(p.sumEuro)}
              </span>
              <label className="fz-checkbox">
                <input
                  type="checkbox"
                  checked={p.paid}
                  aria-label={`${p.name} hat bezahlt`}
                  onChange={() => void handleTogglePaid(p.name, !p.paid)}
                />
              </label>
            </div>
          ))}
          <div className="fz-grid fz-grid--sum fz-muted" style={{ fontSize: 16, lineHeight: '30px' }}>
            <span>schon bezahlt</span>
            <span className="fz-right" style={{ paddingRight: 56 }}>
              {formatEuro(paidEuro)}
            </span>
          </div>
          <div className="fz-grid fz-grid--sum" style={{ fontSize: 19, lineHeight: '30px' }}>
            <span>noch offen</span>
            <span className="fz-right" style={{ paddingRight: 56, fontWeight: 700, color: 'var(--fz-red)' }}>
              {formatEuro(totalEuro - paidEuro)}
            </span>
          </div>
        </section>
      </div>

      <div className="fz-row fz-row--double">
        <p className="fz-muted" style={{ margin: 0, fontSize: 15, lineHeight: '30px' }}>
          Neue Zettel tauchen hier von selbst auf, solange der Link läuft.
        </p>
      </div>

      <div className="fz-row fz-row--double fz-row--center" style={{ gap: 16, flexWrap: 'wrap' }}>
        <button type="button" className="fz-btn" onClick={() => setShowLink((s) => !s)}>
          {showLink ? 'Link verstecken' : 'Link anzeigen'}
        </button>
      </div>

       {showLink && <LinkSlip invitation={data} />}
    </>
  );
}
