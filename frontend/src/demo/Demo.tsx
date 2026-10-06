import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import type { Invitation, Order, Restaurant } from '../types';
import { mockInvitations, mockOrders, mockRestaurants } from './mockData';
import { AdminPage } from './AdminPage';
import { OrderSheetPage } from './OrderSheetPage';
import { LoginPage } from './LoginPage';
import { RequireAuth } from './RequireAuth';

const uid = () => Math.random().toString(36).slice(2, 8);

/**
 * Demo wiring with in-memory state, routed with react-router:
 *   /login                -> sign in (required for the admin area)
 *   /z/<token>            -> order sheet (invitation link)
 *   /admin/speisekarte    -> menu editor   (login required)
 *   /admin/einladung      -> invitation links (login required)
 *   /admin/bestellungen   -> orders overview (login required)
 * Replace the state updates below with calls to your backend.
 */
export function Demo() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [selectedId, setSelectedId] = useState<string | null>(mockRestaurants[0].id);
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const patchRestaurant = (id: string, fn: (r: Restaurant) => Restaurant) =>
    setRestaurants((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));

  return (
    <Routes>
      <Route
        path="/z/:token"
        element={
          <OrderSheetPage
            restaurants={restaurants}
            invitations={invitations}
            onPlaceOrder={(invitationId, draft) => setOrders((os) => [...os, { id: uid(), invitationId, ...draft }])}
          />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/:tab"
        element={
          <RequireAuth>
            <AdminPage
              restaurants={restaurants}
              invitations={invitations}
              orders={orders}
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
              onCreateInvitation={async ({ restaurantId, validFrom, validUntil }) => {
                const inv: Invitation = {
                  id: uid(),
                  url: `${location.origin}/z/${uid()}`,
                  restaurantId,
                  restaurantName: restaurants.find((r) => r.id === restaurantId)?.name ?? '',
                  validFrom: validFrom.toISOString(),
                  validUntil: validUntil.toISOString(),
                };
                setInvitations((is) => [inv, ...is]);
                return inv;
              }}
              onTogglePaid={(orderId, paid) => setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, paid } : o)))}
            />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
