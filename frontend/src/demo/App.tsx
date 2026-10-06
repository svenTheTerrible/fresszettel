import { useEffect, useState } from 'react';
import { AdminLayout, InviteManager, MenuEditor, OrderSheet, OrdersOverview } from '../index';
import type { AdminTab, Invitation, Order, Restaurant } from '../types';
import { mockInvitations, mockOrders, mockRestaurants } from './mockData';

/**
 * Demo wiring with in-memory state and hash routes:
 *   #/z/<token>               -> order sheet (invitation link)
 *   #/admin/speisekarte       -> menu editor
 *   #/admin/einladung         -> invitation links
 *   #/admin/bestellungen      -> orders overview
 * Replace the state updates below with calls to your backend.
 */
const uid = () => Math.random().toString(36).slice(2, 8);

function useHash() {
  const [hash, setHash] = useState(() => location.hash || '#/admin/speisekarte');
  useEffect(() => {
    const onChange = () => setHash(location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [selectedId, setSelectedId] = useState<string | null>(mockRestaurants[0].id);
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const patchRestaurant = (id: string, fn: (r: Restaurant) => Restaurant) =>
    setRestaurants((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));

  // ---- Invitation link: the order sheet --------------------------------
  const token = hash.match(/^#\/z\/([^/?]+)/)?.[1];
  if (token) {
    const invitation = invitations.find((i) => i.url.endsWith(`/z/${token}`));
    const restaurant = restaurants.find((r) => r.id === invitation?.restaurantId);
    if (!invitation || !restaurant) return <p style={{ padding: 24 }}>Diesen Zettel gibt es nicht.</p>;
    return (
      <OrderSheet
        restaurant={restaurant}
        validUntil={invitation.validUntil}
        onSubmit={async (draft) => {
          // e.g. await api.post(`/invitations/${token}/orders`, draft)
          setOrders((os) => [...os, { id: uid(), invitationId: invitation.id, ...draft }]);
        }}
      />
    );
  }

  // ---- Admin -----------------------------------------------------------
  const tab = (hash.match(/^#\/admin\/(\w+)/)?.[1] ?? 'speisekarte') as AdminTab;
  const current = invitations[0];

  return (
    <AdminLayout active={tab}>
      {tab === 'speisekarte' && (
        <MenuEditor
          restaurants={restaurants}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreateRestaurant={() => {
            const r: Restaurant = { id: uid(), name: 'Neues Restaurant', menu: [] };
            setRestaurants((rs) => [...rs, r]);
            setSelectedId(r.id);
          }}
          onUpdateRestaurant={(id, patch) => patchRestaurant(id, (r) => ({ ...r, ...patch }))}
          onAddItem={(id, item) => patchRestaurant(id, (r) => ({ ...r, menu: [...r.menu, { id: uid(), ...item }] }))}
          onDeleteItem={(id, itemId) => patchRestaurant(id, (r) => ({ ...r, menu: r.menu.filter((m) => m.id !== itemId) }))}
        />
      )}

      {tab === 'einladung' && (
        <InviteManager
          restaurants={restaurants}
          invitations={invitations.map((inv) => {
            const restaurant = restaurants.find((r) => r.id === inv.restaurantId);
            const its = orders.filter((o) => o.invitationId === inv.id);
            const prices = new Map(restaurant?.menu.map((m) => [m.id, m.priceCents]));
            const totalCents = its.reduce((s, o) => s + o.lines.reduce((t, l) => t + (prices.get(l.menuItemId) ?? 0) * l.quantity, 0), 0);
            return { ...inv, orderCount: its.length, totalCents };
          })}
          onCreate={async ({ restaurantId, validFrom, validUntil }) => {
            const inv: Invitation = {
              id: uid(),
              url: `${location.origin}${location.pathname}#/z/${uid()}`,
              restaurantId,
              restaurantName: restaurants.find((r) => r.id === restaurantId)?.name ?? '',
              validFrom: validFrom.toISOString(),
              validUntil: validUntil.toISOString(),
            };
            setInvitations((is) => [inv, ...is]);
            return inv;
          }}
        />
      )}

      {tab === 'bestellungen' &&
        (current ? (
          <OrdersOverview
            invitation={current}
            restaurant={restaurants.find((r) => r.id === current.restaurantId)!}
            orders={orders.filter((o) => o.invitationId === current.id)}
            onTogglePaid={(orderId, paid) => setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, paid } : o)))}
          />
        ) : (
          <div className="fz-row">Noch kein Zettel unterwegs.</div>
        ))}
    </AdminLayout>
  );
}
