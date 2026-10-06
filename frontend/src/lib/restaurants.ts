/**
 * Thin restaurant/menu layer for the demo app. Talks to the backend's
 * `GET/POST/PUT /api/user/...` endpoints, maps the DTOs onto the shared
 * types, and throws Errors with user-facing messages on failure (like
 * auth.ts).
 */

import type { MenuItem, Restaurant } from '../types';
import {
  fetchCreateRestaurant,
  fetchListRestaurants,
  fetchMenuItems,
  fetchUpdateRestaurant,
  type CreateRestaurantRequest,
  type MenuItemInput,
  type UpdateRestaurantRequest,
} from './api';

/**
 * One element of `GET /api/user/listRestaurants`, exactly as serialized by the
 * backend. Every reference field may be `null` (a `null` DB column serializes to
 * JSON `null`); only `itemCount` is a primitive and therefore never `null`.
 */
export interface RestaurantSummary {
  id: number;
  name: string | null;
  phone: string | null;
  itemCount: number;
  /** ISO local date-time. */
  timestamp: string | null;
}

/**
 * One element of `GET /api/user/menuItems/{restaurantId}`, exactly as serialized
 * by the backend. Reference fields may be `null`; price is in euro.
 */
export interface MenuItemView {
  id: number;
  orderNumber: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
}

function assertOk(response: Response): void {
  if (!response.ok) {
    throw new Error('Etwas ist schiefgelaufen. Versuch es nochmal.');
  }
}

/** List the logged-in user's restaurants. */
export async function listRestaurants(): Promise<RestaurantSummary[]> {
  let response: Response;
  try {
    response = await fetchListRestaurants();
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
  return (await response.json()) as RestaurantSummary[];
}

/** List one restaurant's menu items. */
export async function listMenuItems(
  restaurantId: number | string,
): Promise<MenuItemView[]> {
  let response: Response;
  try {
    response = await fetchMenuItems(restaurantId);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
  return (await response.json()) as MenuItemView[];
}

/** Create a restaurant (empty menu when `menuItems` is empty). */
export async function createRestaurant(
  request: CreateRestaurantRequest,
): Promise<void> {
  let response: Response;
  try {
    response = await fetchCreateRestaurant(request);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
}

/** Update a restaurant. Sends the full menu; items without an id are new. */
export async function updateRestaurant(
  request: UpdateRestaurantRequest,
): Promise<void> {
  let response: Response;
  try {
    response = await fetchUpdateRestaurant(request);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
}

/**
 * Map a backend summary onto the shared restaurant shape (menu loaded separately).
 * Backend `null`s are normalized away: optional fields become `undefined`.
 */
export function toRestaurant(summary: RestaurantSummary): Restaurant {
  return {
    id: String(summary.id),
    name: summary.name ?? '',
    phone: summary.phone ?? undefined,
    menu: [],
  };
}

/**
 * Map a backend menu item view onto the shared shape (price in cents).
 * Backend `null`s are normalized away: optional fields become `undefined`.
 */
export function toMenuItem(view: MenuItemView): MenuItem {
  return {
    id: String(view.id),
    number: view.orderNumber ?? '',
    name: view.name ?? '',
    description: view.description ?? undefined,
    priceCents: Math.round((view.price ?? 0) * 100),
  };
}

/** Map a shared menu item onto the backend input (price in euro). */
export function toMenuItemInput(item: MenuItem): MenuItemInput {
  return {
    id: Number(item.id),
    orderNumber: item.number,
    name: item.name,
    description: item.description,
    price: item.priceCents / 100,
  };
}
