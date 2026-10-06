import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router';
import { AdminLayout, InviteManager, MenuEditor, OrderSheet, OrdersOverview } from '../index';
import type { AdminTab, Invitation, NewInvitation, NewMenuItem, Order, OrderDraft, Restaurant } from '../types';
import { mockInvitations, mockOrders, mockRestaurants } from './mockData';

/**
 * Demo wiring with in-memory state, routed with react-router:
 *   /z/<token>            -> order sheet (invitation link)
 *   /admin/speisekarte    -> menu editor
 *   /admin/einladung      -> invitation links
 *   /admin/bestellungen   -> orders overview
 * Replace the state updates below with calls to your backend.
 */
const uid = () => Math.random().toString(36).slice(2, 8);

const TABS: AdminTab[] = ['speisekarte', 'einladung', 'bestellungen'];
const adminHref = (tab: AdminTab, zettelId?: string) =>
  zettelId ? `/admin/${tab}?zettel=${encodeURIComponent(zettelId)}` : `/admin/${tab}`;

export function App() {
  return (
    <BrowserRouter>
      <Demo />
    </BrowserRouter>
  );
}

function Demo() {
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
      <Route
        path="/admin/:tab"
        element={
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
        }
      />
      <Route path="*" element={<Navigate to="/admin/speisekarte" replace />} />
    </Routes>
  );
}

interface OrderSheetPageProps {
  restaurants: Restaurant[];
  invitations: Invitation[];
  onPlaceOrder: (invitationId: string, draft: OrderDraft) => void;
}

/** Invitation link: the order sheet. */
function OrderSheetPage({ restaurants, invitations, onPlaceOrder }: OrderSheetPageProps) {
  const { token } = useParams();
  const invitation = invitations.find((i) => i.url.endsWith(`/z/${token}`));
  const restaurant = restaurants.find((r) => r.id === invitation?.restaurantId);
  if (!invitation || !restaurant) return <p style={{ padding: 24 }}>Diesen Zettel gibt es nicht.</p>;
  return <OrderSheet restaurant={restaurant} validUntil={invitation.validUntil} onSubmit={(draft) => onPlaceOrder(invitation.id, draft)} />;
}

interface AdminPageProps {
  restaurants: Restaurant[];
  invitations: Invitation[];
  orders: Order[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateRestaurant: () => void;
  onUpdateRestaurant: (id: string, patch: { name?: string; phone?: string }) => void;
  onAddItem: (id: string, item: NewMenuItem) => void;
  onDeleteItem: (id: string, itemId: string) => void;
  onCreateInvitation: (input: NewInvitation) => Promise<Invitation>;
  onTogglePaid: (orderId: string, paid: boolean) => void;
}

/** All admin tabs. */
function AdminPage({
  restaurants,
  invitations,
  orders,
  selectedId,
  onSelect,
  onCreateRestaurant,
  onUpdateRestaurant,
  onAddItem,
  onDeleteItem,
  onCreateInvitation,
  onTogglePaid,
}: AdminPageProps) {
  const { tab: tabParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab: AdminTab = TABS.includes(tabParam as AdminTab) ? (tabParam as AdminTab) : 'speisekarte';
  const current = invitations.find((i) => i.id === searchParams.get('zettel')) ?? invitations[0];

  return (
    <AdminLayout active={tab} hrefFor={adminHref} onNavigate={(t) => navigate(adminHref(t))}>
      {tab === 'speisekarte' && (
        <MenuEditor
          restaurants={restaurants}
          selectedId={selectedId}
          onSelect={onSelect}
          onCreateRestaurant={onCreateRestaurant}
          onUpdateRestaurant={onUpdateRestaurant}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
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
          ordersHref={(inv) => adminHref('bestellungen', inv.id)}
          onOpenOrders={(inv) => navigate(adminHref('bestellungen', inv.id))}
          onCreate={onCreateInvitation}
        />
      )}

      {tab === 'bestellungen' &&
        (current ? (
          <OrdersOverview
            invitation={current}
            restaurant={restaurants.find((r) => r.id === current.restaurantId)!}
            orders={orders.filter((o) => o.invitationId === current.id)}
            onTogglePaid={onTogglePaid}
          />
        ) : (
          <div className="fz-row">Noch kein Zettel unterwegs.</div>
        ))}
    </AdminLayout>
  );
}
