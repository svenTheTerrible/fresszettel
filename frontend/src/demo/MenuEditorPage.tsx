import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MenuEditor } from '../components/MenuEditor';
import {
  createRestaurant,
  deleteRestaurant,
  listMenuItems,
  listRestaurants,
  toMenuItemInput,
  updateRestaurant,
} from '../lib/restaurants';
import type { MenuItemView, RestaurantSummary } from '../lib/restaurants';
import { useRestaurants } from '../hooks/useRestaurants';
import type { NewMenuItem } from '../types';
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

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = selectedId ?? base[0]?.id ?? null;

  // One query per selected restaurant, cached by react-query.
  const { data: menu } = useQuery({
    queryKey: ['restaurant-menu', token, selected],
    queryFn: () => listMenuItems(selected),
    enabled: Boolean(token && selected),
  });

  const menuForSelected = menu ?? [];

  /** Drop the menu editor's react-query cache for the affected keys. */
  const refreshFor = (restaurantId: number | null) => {
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
  const readMenu = async (restaurantId: number): Promise<MenuItemView[]> => {
    const cached = queryClient.getQueryData<MenuItemView[]>(
      ['restaurant-menu', token, restaurantId],
    );
    if (cached) return cached;
    return listMenuItems(restaurantId);
  };

  /** The user's restaurants from the react-query cache, fetching if cold. */
  const readRestaurants = async (): Promise<RestaurantSummary[]> => {
    const cached = queryClient.getQueryData<RestaurantSummary[]>(
      ['restaurants', token],
    );
    if (cached) return cached;
    return listRestaurants();
  };

  const handleCreateRestaurant = async () => {
    if (!token) return;
    const id = await createRestaurant({ name: '', menuItems: [] });
    setSelectedId(id);
    refreshFor(null);
  };

  const handleUpdateRestaurant = async (
    id: number,
    patch: { name?: string; phone?: string },
  ) => {
    if (!token) return;
    const restaurants = await readRestaurants();
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    const menu = await readMenu(id);
    await updateRestaurant({
      restaurantId: r.id,
      name: patch.name ?? r.name ?? undefined,
      phone: patch.phone ?? r.phone ?? undefined,
      menuItems: menu.map(toMenuItemInput),
    });
    refreshFor(id);
  };

  const handleAddItem = async (id: number, item: NewMenuItem) => {
    if (!token) return;
    const restaurants = await readRestaurants();
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    const menu = await readMenu(id);
    await updateRestaurant({
      restaurantId: r.id,
      name: r.name ?? undefined,
      phone: r.phone ?? undefined,
      menuItems: [
        ...menu.map(toMenuItemInput),
        {
          orderNumber: item.orderNumber,
          name: item.name,
          description: item.description,
          price: item.price,
        },
      ],
    });
    refreshFor(id);
  };

  const handleUpdateItem = async (
    id: number,
    itemId: number,
    item: NewMenuItem,
  ) => {
    if (!token) return;
    const restaurants = await readRestaurants();
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    const menu = await readMenu(id);
    await updateRestaurant({
      restaurantId: r.id,
      name: r.name ?? undefined,
      phone: r.phone ?? undefined,
      menuItems: menu.map((m) =>
        m.id === itemId
          ? {
              id: m.id,
              orderNumber: item.orderNumber,
              name: item.name,
              description: item.description,
              price: item.price,
            }
          : toMenuItemInput(m),
      ),
    });
    refreshFor(id);
  };

  const handleDeleteItem = async (id: number, itemId: number) => {
    if (!token) return;
    const restaurants = await readRestaurants();
    const r = restaurants.find((x) => x.id === id);
    if (!r) return;
    const menu = await readMenu(id);
    await updateRestaurant({
      restaurantId: r.id,
      name: r.name ?? undefined,
      phone: r.phone ?? undefined,
      menuItems: menu.filter((m) => m.id !== itemId).map(toMenuItemInput),
    });
    refreshFor(id);
  };

  const handleDeleteRestaurant = async (id: number) => {
    if (!token) return;
    await deleteRestaurant(id);
    setSelectedId(null);
    refreshFor(null);
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
        restaurants={base}
        menu={menuForSelected}
        selectedId={selected}
        onSelect={setSelectedId}
        onCreateRestaurant={handleCreateRestaurant}
        onUpdateRestaurant={handleUpdateRestaurant}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onDeleteRestaurant={handleDeleteRestaurant}
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
