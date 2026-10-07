/**
 * Thin restaurant/menu layer for the demo app. Talks to the backend's
 * `GET/POST/PUT /api/user/...` endpoints and returns the DTOs exactly as
 * serialized (the shapes in this file match the backend records), and throws
 * Errors with user-facing messages on failure (like auth.ts).
 */

import {
  fetchCreateRestaurant,
  fetchDeleteRestaurant,
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
 * The restaurant list has no menu; a selected restaurant's menu is fetched
 * separately via `listMenuItems`.
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

/**
 * Create a restaurant (empty menu when `menuItems` is empty) and return its new id.
 */
export async function createRestaurant(
  request: CreateRestaurantRequest,
): Promise<number> {
  let response: Response;
  try {
    response = await fetchCreateRestaurant(request);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
  return (await response.json()) as number;
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

/** Delete a restaurant by id. */
export async function deleteRestaurant(restaurantId: number): Promise<void> {
  let response: Response;
  try {
    response = await fetchDeleteRestaurant(restaurantId);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
}

/**
 * Map a backend menu item view onto the backend input for `createRestaurant` /
 * `updateRestaurant`. Backend `null`s are normalized away; price stays in euro.
 */
export function toMenuItemInput(item: MenuItemView): MenuItemInput {
  return {
    id: item.id,
    orderNumber: item.orderNumber ?? '',
    name: item.name ?? '',
    description: item.description ?? undefined,
    price: item.price ?? 0,
  };
}
