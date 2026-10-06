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
