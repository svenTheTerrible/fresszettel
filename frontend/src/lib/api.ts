/**
 * Central place for all API endpoint fetch calls. Each function performs the
 * raw `fetch` against a backend endpoint under the `/api` context path and
 * returns the `Response` so callers can interpret the status and body.
 */

/** `POST /api/authentification/login` — authenticate with email + password. */
export async function fetchLogin(
  email: string,
  password: string,
): Promise<Response> {
  return fetch('/api/authentification/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

/** `POST /api/authentification/create` — create a new account. */
export async function fetchCreateAccount(
  email: string,
  password: string,
): Promise<Response> {
  return fetch('/api/authentification/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

const authHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});

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
export async function fetchListRestaurants(token: string): Promise<Response> {
  return fetch('/api/user/listRestaurants', { headers: authHeaders(token) });
}

/** `GET /api/user/menuItems/{restaurantId}` — one restaurant's menu. */
export async function fetchMenuItems(
  token: string,
  restaurantId: number | string,
): Promise<Response> {
  return fetch(`/api/user/menuItems/${restaurantId}`, {
    headers: authHeaders(token),
  });
}

/** `POST /api/user/createRestaurant`. */
export async function fetchCreateRestaurant(
  token: string,
  request: CreateRestaurantRequest,
): Promise<Response> {
  return fetch('/api/user/createRestaurant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(request),
  });
}

/** `PUT /api/user/updateRestaurant`. */
export async function fetchUpdateRestaurant(
  token: string,
  request: UpdateRestaurantRequest,
): Promise<Response> {
  return fetch('/api/user/updateRestaurant', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(request),
  });
}
