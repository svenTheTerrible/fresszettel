import type { Invitation, NewInvitation, Restaurant } from '../types';
import { formatEuro, formatShortDate, formatWindow } from '../lib/format';
import { NewInvitationForm } from './NewInvitationForm';

export interface InviteManagerProps {
  restaurants: Pick<Restaurant, 'id' | 'name'>[];
  /** Earlier invitations, newest first. */
  invitations: Invitation[];
  /** Create the invitation in your backend and return it (with its final URL). */
  onCreate: (input: NewInvitation) => Promise<Invitation>;
  /** "läuft · ansehen" link target for running invitations. */
  ordersHref?: (invitation: Invitation) => string;
  onOpenOrders?: (invitation: Invitation) => void;
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
  defaultUntil,
}: InviteManagerProps) {
  const now = Date.now();

  return (
    <>
      <div className="fz-row fz-row--double">
        <h1 className="fz-h1">Neuen Zettel rumgehen lassen</h1>
      </div>

      <NewInvitationForm restaurants={restaurants} onCreate={onCreate} defaultUntil={defaultUntil} />

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
                  <td className="fz-right fz-nowrap">{inv.total != null ? formatEuro(Math.round(inv.total * 100)) : '–'}</td>
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
