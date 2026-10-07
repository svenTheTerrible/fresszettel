import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MenuEditor } from '../components/MenuEditor';
import {
  createRestaurant,
  listMenuItems,
  listRestaurants,
  toMenuItem,
  toMenuItemInput,
  toRestaurant,
  updateRestaurant,
} from '../lib/restaurants';
import type { MenuItemView } from '../lib/restaurants';
import { useRestaurants } from '../hooks/useRestaurants';
import type { MenuItem, NewMenuItem, Restaurant } from '../types';
import { AdminShell } from './AdminShell';
import { useAuth } from './auth-context';

/**
 * The menu editor page. Restaurant + menu loading and the create/update
 * mutations are all handled internally via react-query, so the caller just
 * renders the page without supplying anything.
 */
export function MenuEditorPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const {
    restaurants: base,
    isLoading,
    isError,
    error,
  } = useRestaurants();

  const [selectedIdRaw, setSelectedIdRaw] = useState<string | null>(null);
  const selectedId = selectedIdRaw ?? base[0]?.id ?? null;

  // One query per selected restaurant, cached by react-query.
  const { data: menu } = useQuery({
    queryKey: ['restaurant-menu', token, selectedId],
    queryFn: () =>
      (selectedId
        ? listMenuItems(selectedId)
        : Promise.resolve<MenuItemView[]>([])).then((items) =>
        items.map(toMenuItem),
      ),
    enabled: Boolean(token && selectedId),
  });

  const menuForSelected = menu ?? [];
  const restaurants = base.map((r) =>
    r.id === selectedId ? { ...r, menu: menuForSelected } : r,
  );

  /** Drop the menu editor's react-query cache for the affected keys. */
  const refreshFor = (restaurantId: string | null) => {
    void queryClient.invalidateQueries({ queryKey: ['restaurants', token] });
    if (restaurantId) {
      void queryClient.invalidateQueries({
        queryKey: ['restaurant-menu', token, restaurantId],
      });
    }
  };

  /**
   * A restaurant's current menu from the react-query cache, fetching it if the
   * entry was dropped. Feeds the full-menu `updateRestaurant` request, so it
   * must resolve to what's currently on disk rather than an empty list.
   */
  const readMenu = async (restaurantId: string): Promise<MenuItem[]> => {
    const cached = queryClient.getQueryData<MenuItem[]>(
      ['restaurant-menu', token, restaurantId],
    );
    if (cached) return cached;
    const items = await listMenuItems(restaurantId);
    return items.map(toMenuItem);
  };

  /** The user's restaurants from the react-query cache, fetching if cold. */
  const readRestaurants = async (): Promise<Restaurant[]> => {
    const cached = queryClient.getQueryData<Restaurant[]>(['restaurants', token]);
    if (cached) return cached;
    const list = await listRestaurants();
    return list.map(toRestaurant);
  };

  const handleCreateRestaurant = async () => {
    if (!token) return;
    await createRestaurant({ name: '', menuItems: [] });
    refreshFor(null);
  };

  const handleUpdateRestaurant = async (
    id: string,
    patch: { name?: string; phone?: string },
  ) => {
    if (!token) return;
    const restaurants = await readRestaurants();
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    const menu = await readMenu(id);
    await updateRestaurant({
      restaurantId: Number(id),
      name: patch.name ?? r.name,
      phone: patch.phone ?? r.phone,
      menuItems: menu.map(toMenuItemInput),
    });
    refreshFor(id);
  };

  const handleAddItem = async (id: string, item: NewMenuItem) => {
    if (!token) return;
    const restaurants = await readRestaurants();
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    const menu = await readMenu(id);
    await updateRestaurant({
      restaurantId: Number(id),
      name: r.name,
      phone: r.phone,
      menuItems: [
        ...menu.map(toMenuItemInput),
        {
          orderNumber: item.number,
          name: item.name,
          description: item.description,
          price: item.priceCents / 100,
        },
      ],
    });
    refreshFor(id);
  };

  const handleUpdateItem = async (
    id: string,
    itemId: string,
    item: NewMenuItem,
  ) => {
    if (!token) return;
    const restaurants = await readRestaurants();
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    const menu = await readMenu(id);
    await updateRestaurant({
      restaurantId: Number(id),
      name: r.name,
      phone: r.phone,
      menuItems: menu.map((m) =>
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
    refreshFor(id);
  };

  const handleDeleteItem = async (id: string, itemId: string) => {
    if (!token) return;
    const restaurants = await readRestaurants();
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    const menu = await readMenu(id);
    await updateRestaurant({
      restaurantId: Number(id),
      name: r.name,
      phone: r.phone,
      menuItems: menu.filter((m) => m.id !== itemId).map(toMenuItemInput),
    });
    refreshFor(id);
  };

  if (isLoading) {
    return (
      <AdminShell active="speisekarte">
        <div className="fz-row">Lade Restaurants…</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell active="speisekarte">
      <MenuEditor
        restaurants={restaurants}
        selectedId={selectedId}
        onSelect={setSelectedIdRaw}
        onCreateRestaurant={handleCreateRestaurant}
        onUpdateRestaurant={handleUpdateRestaurant}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />
      {isError && (
        <div className="fz-row">
          <span role="status" className="fz-error">
            {(error as Error)?.message ?? 'Restaurants konnten nicht geladen werden.'}
          </span>
        </div>
      )}
    </AdminShell>
  );
}
