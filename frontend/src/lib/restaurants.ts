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

/** One element of `GET /api/user/listRestaurants`. */
export interface RestaurantSummary {
  id: number;
  name: string;
  itemCount: number;
  /** ISO local date-time. */
  timestamp: string;
}

/** One element of `GET /api/user/menuItems/{restaurantId}`. Price in euro. */
export interface MenuItemView {
  id: number;
  orderNumber: string;
  name: string;
  price: number;
}

function assertOk(response: Response): void {
  if (!response.ok) {
    throw new Error('Etwas ist schiefgelaufen. Versuch es nochmal.');
  }
}

/** List the logged-in user's restaurants. */
export async function listRestaurants(
  token: string,
): Promise<RestaurantSummary[]> {
  let response: Response;
  try {
    response = await fetchListRestaurants(token);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
  return (await response.json()) as RestaurantSummary[];
}

/** List one restaurant's menu items. */
export async function listMenuItems(
  token: string,
  restaurantId: number | string,
): Promise<MenuItemView[]> {
  let response: Response;
  try {
    response = await fetchMenuItems(token, restaurantId);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
  return (await response.json()) as MenuItemView[];
}

/** Create a restaurant (empty menu when `menuItems` is empty). */
export async function createRestaurant(
  token: string,
  request: CreateRestaurantRequest,
): Promise<void> {
  let response: Response;
  try {
    response = await fetchCreateRestaurant(token, request);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
}

/** Update a restaurant. Sends the full menu; items without an id are new. */
export async function updateRestaurant(
  token: string,
  request: UpdateRestaurantRequest,
): Promise<void> {
  let response: Response;
  try {
    response = await fetchUpdateRestaurant(token, request);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
}

/** Map a backend summary onto the shared restaurant shape (menu loaded separately). */
export function toRestaurant(summary: RestaurantSummary): Restaurant {
  return { id: String(summary.id), name: summary.name, menu: [] };
}

/** Map a backend menu item view onto the shared shape (price in cents). */
export function toMenuItem(view: MenuItemView): MenuItem {
  return {
    id: String(view.id),
    number: view.orderNumber,
    name: view.name,
    priceCents: Math.round(view.price * 100),
  };
}

/** Map a shared menu item onto the backend input (price in euro). */
export function toMenuItemInput(item: MenuItem): MenuItemInput {
  return {
    id: Number(item.id),
    orderNumber: item.number,
    name: item.name,
    price: item.priceCents / 100,
  };
}
