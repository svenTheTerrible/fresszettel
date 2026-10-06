/**
 * Thin auth layer for the demo app. Talks to the backend's
 * `POST /api/authentification/login` endpoint and keeps the JWT access token
 * in localStorage so the admin pages stay unlocked across a refresh.
 */

const TOKEN_KEY = 'fresszettel.accessToken';

/** Read the stored access token, or null when not logged in. */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage errors (private mode, quota) — the session just won't persist.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Log in against the backend. Resolves with the access token, or throws an
 * Error with a user-facing message when the credentials are bad or the
 * server can't be reached.
 */
export async function login(email: string, password: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch('/api/authentification/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
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
  return data.accessToken;
}
