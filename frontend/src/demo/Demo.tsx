import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import {
  createRestaurant,
  listMenuItems,
  listRestaurants,
  toMenuItem,
  toMenuItemInput,
  toRestaurant,
  updateRestaurant,
} from '../lib/restaurants';
import type { Invitation, NewMenuItem, Order, Restaurant } from '../types';
import { mockInvitations, mockOrders } from './mockData';
import { useAuth } from './auth-context';
import { AdminPage } from './AdminPage';
import { OrderSheetPage } from './OrderSheetPage';
import { LoginPage } from './LoginPage';
import { RequireAuth } from './RequireAuth';

const uid = () => Math.random().toString(36).slice(2, 8);

/**
 * Demo wiring, routed with react-router:
 *   /login                -> sign in (required for the admin area)
 *   /z/<token>            -> order sheet (invitation link)
 *   /admin/speisekarte    -> menu editor   (login required)
 *   /admin/einladung      -> invitation links (login required)
 *   /admin/bestellungen   -> orders overview (login required)
 * Restaurants and menus come from the backend (`/api/user/...`); invitations
 * and orders are still mock data.
 */
export function Demo() {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  // Load the user's restaurants once a token is present.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const list = await listRestaurants(token);
        if (cancelled) return;
        setRestaurants(list.map(toRestaurant));
        setSelectedId(
          (current) => current ?? (list.length > 0 ? String(list[0].id) : null),
        );
      } catch {
        // Backend unreachable — leave the list empty.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Load the selected restaurant's menu whenever the selection changes.
  useEffect(() => {
    if (!token || !selectedId) return;
    let cancelled = false;
    void (async () => {
      try {
        const items = await listMenuItems(token, selectedId);
        if (cancelled) return;
        setRestaurants((rs) =>
          rs.map((r) =>
            r.id === selectedId ? { ...r, menu: items.map(toMenuItem) } : r,
          ),
        );
      } catch {
        // Backend unreachable — leave the menu as is.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, selectedId]);

  /** Re-fetch one restaurant's menu so item ids stay canonical. */
  const refreshMenu = async (restaurantId: string) => {
    if (!token) return;
    const items = await listMenuItems(token, restaurantId);
    setRestaurants((rs) =>
      rs.map((r) =>
        r.id === restaurantId ? { ...r, menu: items.map(toMenuItem) } : r,
      ),
    );
  };

  const handleCreateRestaurant = async () => {
    if (!token) return;
    await createRestaurant(token, { name: '', menuItems: [] });
    const list = await listRestaurants(token);
    setRestaurants(list.map(toRestaurant));
    const newest = list.reduce((best, s) => (s.id > best.id ? s : best));
    setSelectedId(String(newest.id));
  };

  const handleUpdateRestaurant = async (
    id: string,
    patch: { name?: string; phone?: string },
  ) => {
    if (!token) return;
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    await updateRestaurant(token, {
      restaurantId: Number(id),
      name: patch.name ?? r.name,
      phone: patch.phone ?? r.phone,
      menuItems: r.menu.map(toMenuItemInput),
    });
    setRestaurants((rs) =>
      rs.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
  };

  const handleAddItem = async (id: string, item: NewMenuItem) => {
    if (!token) return;
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    await updateRestaurant(token, {
      restaurantId: Number(id),
      name: r.name,
      phone: r.phone,
      menuItems: [
        ...r.menu.map(toMenuItemInput),
        {
          orderNumber: item.number,
          name: item.name,
          price: item.priceCents / 100,
        },
      ],
    });
    await refreshMenu(id);
  };

  const handleDeleteItem = async (id: string, itemId: string) => {
    if (!token) return;
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    await updateRestaurant(token, {
      restaurantId: Number(id),
      name: r.name,
      phone: r.phone,
      menuItems: r.menu.filter((m) => m.id !== itemId).map(toMenuItemInput),
    });
    await refreshMenu(id);
  };

  return (
    <Routes>
      <Route
        path="/z/:token"
        element={
          <OrderSheetPage
            restaurants={restaurants}
            invitations={invitations}
            onPlaceOrder={(invitationId, draft) =>
              setOrders((os) => [...os, { id: uid(), invitationId, ...draft }])
            }
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
              onCreateRestaurant={handleCreateRestaurant}
              onUpdateRestaurant={handleUpdateRestaurant}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onCreateInvitation={async ({
                restaurantId,
                validFrom,
                validUntil,
              }) => {
                const inv: Invitation = {
                  id: uid(),
                  url: `${location.origin}/z/${uid()}`,
                  restaurantId,
                  restaurantName:
                    restaurants.find((r) => r.id === restaurantId)?.name ?? '',
                  validFrom: validFrom.toISOString(),
                  validUntil: validUntil.toISOString(),
                };
                setInvitations((is) => [inv, ...is]);
                return inv;
              }}
              onTogglePaid={(orderId, paid) =>
                setOrders((os) =>
                  os.map((o) => (o.id === orderId ? { ...o, paid } : o)),
                )
              }
            />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
