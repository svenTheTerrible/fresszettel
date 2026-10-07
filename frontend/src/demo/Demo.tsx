import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router';
import { createInvitation, listInvitations } from '../lib/invitations';
import {
  createRestaurant,
  listMenuItems,
  listRestaurants,
  toMenuItem,
  toMenuItemInput,
  toRestaurant,
  updateRestaurant,
} from '../lib/restaurants';
import type { Invitation, NewInvitation, NewMenuItem, Restaurant } from '../types';
import { useAuth } from './auth-context';
import { MenuEditorPage } from './MenuEditorPage';
import { InvitePage } from './InvitePage';
import { OrdersPage } from './OrdersPage';
import { OrderSheetPage } from './OrderSheetPage';
import { LoginPage } from './LoginPage';
import { RequireAuth } from './RequireAuth';

/**
 * Demo wiring, routed with react-router:
 *   /login                -> sign in (required for the admin area)
 *   /z/<token>            -> order sheet (invitation link)
 *   /admin/speisekarte    -> menu editor   (login required)
 *   /admin/einladung      -> invitation links (login required)
 *   /admin/bestellungen   -> orders overview (login required)
 * Restaurants, menus, invitations and orders all come from the backend
 * (`/api/user/...`).
 */
export function Demo() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // Which Zettel the admin is looking at: the `?zettel=` id, else the newest.
  const zettelId = searchParams.get('zettel') ?? invitations[0]?.id ?? null;
  const currentRestaurantId =
    invitations.find((i) => i.id === zettelId)?.restaurantId ?? null;

  // Load the user's restaurants once a token is present.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const list = await listRestaurants();
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

  // Load the user's invitations (order batches) once a token is present.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const list = await listInvitations();
        if (cancelled) return;
        setInvitations(list);
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
        const items = await listMenuItems(selectedId);
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

  // Load the current Zettel's restaurant menu so dish names and prices resolve.
  useEffect(() => {
    if (!token || !currentRestaurantId) return;
    let cancelled = false;
    void (async () => {
      try {
        const items = await listMenuItems(currentRestaurantId);
        if (cancelled) return;
        setRestaurants((rs) =>
          rs.map((r) =>
            r.id === currentRestaurantId
              ? { ...r, menu: items.map(toMenuItem) }
              : r,
          ),
        );
      } catch {
        // Backend unreachable — leave the menu as is.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, currentRestaurantId]);

  /** Re-fetch one restaurant's menu so item ids stay canonical. */
  const refreshMenu = async (restaurantId: string) => {
    if (!token) return;
    const items = await listMenuItems(restaurantId);
    setRestaurants((rs) =>
      rs.map((r) =>
        r.id === restaurantId ? { ...r, menu: items.map(toMenuItem) } : r,
      ),
    );
  };

  const handleCreateRestaurant = async () => {
    if (!token) return;
    await createRestaurant({ name: '', menuItems: [] });
    const list = await listRestaurants();
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
    await updateRestaurant({
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
    await updateRestaurant({
      restaurantId: Number(id),
      name: r.name,
      phone: r.phone,
      menuItems: [
        ...r.menu.map(toMenuItemInput),
        {
          orderNumber: item.number,
          name: item.name,
          description: item.description,
          price: item.priceCents / 100,
        },
      ],
    });
    await refreshMenu(id);
  };

  const handleUpdateItem = async (
    id: string,
    itemId: string,
    item: NewMenuItem,
  ) => {
    if (!token) return;
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    await updateRestaurant({
      restaurantId: Number(id),
      name: r.name,
      phone: r.phone,
      menuItems: r.menu.map((m) =>
        m.id === itemId
          ? {
              id: Number(itemId),
              orderNumber: item.number,
              name: item.name,
              description: item.description,
              price: item.priceCents / 100,
            }
          : toMenuItemInput(m),
      ),
    });
    await refreshMenu(id);
  };

  const handleDeleteItem = async (id: string, itemId: string) => {
    if (!token) return;
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    await updateRestaurant({
      restaurantId: Number(id),
      name: r.name,
      phone: r.phone,
      menuItems: r.menu.filter((m) => m.id !== itemId).map(toMenuItemInput),
    });
    await refreshMenu(id);
  };

  const handleCreateInvitation = async (input: NewInvitation) => {
    const created = await createInvitation(input);
    setInvitations((is) => [created, ...is]);
    return created;
  };

  return (
    <Routes>
      <Route path="/z/:token" element={<OrderSheetPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/speisekarte"
        element={
          <RequireAuth>
            <MenuEditorPage
              restaurants={restaurants}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onCreateRestaurant={handleCreateRestaurant}
              onUpdateRestaurant={handleUpdateRestaurant}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/einladung"
        element={
          <RequireAuth>
            <InvitePage
              restaurants={restaurants}
              invitations={invitations}
              onCreate={handleCreateInvitation}
              onOpenOrders={(inv) => navigate(`/admin/bestellungen?zettel=${encodeURIComponent(inv.id)}`)}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/bestellungen"
        element={
          <RequireAuth>
            <OrdersPage invitations={invitations} restaurants={restaurants} />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
