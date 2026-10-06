/**
 * Thin auth layer for the demo app. Talks to the backend's
 * `POST /api/authentification/login` endpoint and keeps the JWT access + refresh
 * tokens in localStorage so the admin pages stay unlocked across a refresh. The
 * tokens live in the shared storage used by `apiFetch` (see lib/apiHelper.ts).
 */

import { fetchCreateAccount, fetchLogin } from './api';
import { clearStoredTokens, getStoredAccessToken, storeTokens } from './apiHelper';

/** Read the stored access token, or null when not logged in. */
export function getStoredToken(): string | null {
  return getStoredAccessToken();
}

export function clearToken(): void {
  clearStoredTokens();
}

/**
 * Login body. A successful login always carries both tokens as non-empty
 * strings (JWTs minted by `JwtService`); a failed login is an empty body, not
 * a body with null fields.
 */
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Log in against the backend. Resolves with the access token, or throws an
 * Error with a user-facing message when the credentials are bad or the
 * server can't be reached.
 */
export async function login(email: string, password: string): Promise<string> {
  let response: Response;
  try {
    response = await fetchLogin(email, password);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }

  if (!response.ok) {
    throw new Error('Etwas ist schiefgelaufen. Versuch es nochmal.');
  }

  // The controller returns Optional<AuthResponse>: an empty body means the
  // email or password was wrong.
  const text = await response.text();
  if (!text) {
    throw new Error('E-Mail oder Passwort stimmt nicht.');
  }

  const data = (JSON.parse(text) ?? {}) as AuthResponse;
  if (!data.accessToken) {
    throw new Error('E-Mail oder Passwort stimmt nicht.');
  }
  storeTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

/**
 * Create a new account against the backend's
 * `POST /api/authentification/create` endpoint. Throws an Error with a
 * user-facing message when the request can't be made or the server rejects it.
 */
export async function register(email: string, password: string): Promise<void> {
  let response: Response;
  try {
    response = await fetchCreateAccount(email, password);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }

  if (!response.ok) {
    throw new Error('Etwas ist schiefgelaufen. Versuch es nochmal.');
  }
}
