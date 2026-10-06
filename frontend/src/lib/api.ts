/**
 * Central place for all API endpoint calls. Each function performs the raw
 * fetch against a backend endpoint under the `/api` context path and returns the
 * `Response` so callers can interpret the status and body. Token injection and
 * the refresh logic live in `apiHelper.ts`.
 */

import { apiFetch } from './apiHelper';

/** `POST /api/authentification/login` — authenticate with email + password. */
export async function fetchLogin(
  email: string,
  password: string,
): Promise<Response> {
  return apiFetch('/api/authentification/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    auth: false,
  });
}

/** `POST /api/authentification/create` — create a new account. */
export async function fetchCreateAccount(
  email: string,
  password: string,
): Promise<Response> {
  return apiFetch('/api/authentification/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    auth: false,
  });
}

/** A menu item as accepted by `createRestaurant` / `updateRestaurant`. */
export interface MenuItemInput {
  /** Set only when editing an existing item. */
  id?: number;
  orderNumber: string;
  name: string;
  description?: string;
  /** Price in euro, e.g. 8.5. */
  price: number;
}

/** Body for `POST /api/user/createRestaurant`. */
export interface CreateRestaurantRequest {
  name?: string;
  phone?: string;
  menuItems: MenuItemInput[];
}

/**
 * Body for `PUT /api/user/updateRestaurant`. `menuItems` is the full menu:
 * items without an `id` are created, items missing from the list are deleted.
 */
export interface UpdateRestaurantRequest {
  restaurantId: number;
  name?: string;
  phone?: string;
  menuItems: MenuItemInput[];
}

/** `GET /api/user/listRestaurants` — the logged-in user's restaurants. */
export async function fetchListRestaurants(): Promise<Response> {
  return apiFetch('/api/user/listRestaurants');
}

/** `GET /api/user/menuItems/{restaurantId}` — one restaurant's menu. */
export async function fetchMenuItems(restaurantId: number | string): Promise<Response> {
  return apiFetch(`/api/user/menuItems/${restaurantId}`);
}

/** `POST /api/user/createRestaurant`. */
export async function fetchCreateRestaurant(
  request: CreateRestaurantRequest,
): Promise<Response> {
  return apiFetch('/api/user/createRestaurant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

/** `PUT /api/user/updateRestaurant`. */
export async function fetchUpdateRestaurant(
  request: UpdateRestaurantRequest,
): Promise<Response> {
  return apiFetch('/api/user/updateRestaurant', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

/** Body for `POST /api/user/createInvitation`. */
export interface CreateInvitationRequest {
  restaurantId: number;
  /** ISO local date-time (no timezone offset). */
  validFrom: string;
  /** ISO local date-time (no timezone offset). */
  validUntil: string;
}

/** `POST /api/user/createInvitation` — create a new order batch. */
export async function fetchCreateInvitation(
  request: CreateInvitationRequest,
): Promise<Response> {
  return apiFetch('/api/user/createInvitation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

/** `GET /api/user/listInvitations` — the logged-in user's order batches. */
export async function fetchListInvitations(): Promise<Response> {
  return apiFetch('/api/user/listInvitations');
}

/** `GET /api/user/orders/{orderBatchId}` — the logged-in user's orders for one batch. */
export async function fetchOrders(orderBatchId: number | string): Promise<Response> {
  return apiFetch(`/api/user/orders/${orderBatchId}`);
}

/** Body for `PUT /api/user/orders/{orderBatchId}/pay`. */
export interface SetOrderPaidRequest {
  /** The orderer's name — groups that person's order rows in the batch. */
  name: string;
  /** Whether the person has paid. */
  paid: boolean;
}

/** `PUT /api/user/orders/{orderBatchId}/pay` — mark a person's order paid/unpaid. */
export async function fetchSetOrderPaid(
  orderBatchId: number | string,
  request: SetOrderPaidRequest,
): Promise<Response> {
  return apiFetch(`/api/user/orders/${orderBatchId}/pay`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

/**
 * `GET /api/order/get-menu?token=...` — the public order sheet data, looked up
 * by the invitation token (no JWT). Unknown tokens come back as 404.
 */
export async function fetchOrderMenu(token: string): Promise<Response> {
  return apiFetch(`/api/order/get-menu?token=${encodeURIComponent(token)}`, {
    auth: false,
  });
}

/** Body for `POST /api/order/place-order`. */
export interface PlaceOrderRequest {
  /** The invitation token the sheet was opened with. */
  token: string;
  name: string;
  items: { menuItemId: number; quantity: number }[];
}

/** `POST /api/order/place-order` — public, no JWT. */
export async function fetchPlaceOrder(
  request: PlaceOrderRequest,
): Promise<Response> {
  return apiFetch('/api/order/place-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    auth: false,
  });
}
