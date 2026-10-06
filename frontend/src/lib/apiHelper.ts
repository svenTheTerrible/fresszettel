/**
 * Transport layer shared by every API call. Owns token storage and the
 * `apiFetch` wrapper, which injects the stored bearer token — so callers never
 * have to pass a token around by hand. Both tokens carry a readable `exp` claim,
 * so `apiFetch` decodes the access token locally and, when it is expired, mints
 * a fresh one from the refresh token *before* the request goes out (no wasted
 * round-trip to discover a 401).
 */

const ACCESS_TOKEN_KEY = 'fresszettel.accessToken';
const REFRESH_TOKEN_KEY = 'fresszettel.refreshToken';

/** Read the stored access token, or null when not logged in. */
export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Read the stored refresh token, or null when not logged in. */
export function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Persist both tokens. Either may be null, which clears just that slot. */
export function storeTokens(accessToken: string | null, refreshToken: string | null): void {
  try {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage errors (private mode, quota) — the session just won't persist.
  }
}

/** Clear both tokens. */
export function clearStoredTokens(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** Buffer (seconds) to treat a token as already-expired just before `exp`. */
const CLOCK_SKEW_SECONDS = 30;

interface JwtPayload {
  /** Expiry timestamp in seconds since the Unix epoch. */
  exp?: number;
}

/**
 * Decode a JWT's payload (the base64url-encoded middle segment) without
 * verifying the signature — enough to read the `exp` claim. Returns null when
 * the token is not a well-formed JWT.
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * True when the token's `exp` claim is at or past now (allowing a small clock
 * skew). When the token can't be decoded there is no expiry to enforce, so it
 * is treated as still valid and left to the backend to reject.
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds + CLOCK_SKEW_SECONDS;
}

interface RefreshResponse {
  accessToken: string;
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Ask the backend for a fresh access token using the stored refresh token.
 * Deduped so concurrent calls share a single in-flight request. Resolves with
 * the new access token, or null when there is no usable refresh token (missing,
 * already expired, or rejected by the backend).
 */
function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken || isTokenExpired(refreshToken)) return null;
      try {
        const response = await fetch('/api/authentification/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) return null;
        const text = await response.text();
        if (!text) return null;
        const data = (JSON.parse(text) ?? {}) as RefreshResponse;
        if (!data.accessToken) return null;
        storeTokens(data.accessToken, refreshToken);
        return data.accessToken;
      } catch {
        return null;
      }
    })();
    refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Resolve a usable access token before a request: the stored one when it is
 * still valid, otherwise a freshly minted one via the refresh token. Resolves
 * null when logged out or the session has fully lapsed.
 */
async function ensureAccessToken(): Promise<string | null> {
  const stored = getStoredAccessToken();
  if (!stored) return null;
  if (!isTokenExpired(stored)) return stored;
  return refreshAccessToken();
}

export interface ApiOptions extends RequestInit {
  /**
   * When true (the default) a stored bearer token is attached, refreshing it
   * first when its `exp` claim says it is expired. Set false for the public
   * authentication endpoints that should not carry a token.
   */
  auth?: boolean;
}

/**
 * Fetch wrapper around the raw `fetch`. Attaches the stored bearer token,
 * refreshing it proactively when the access token is expired.
 */
export async function apiFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const { auth = true, headers, ...init } = options;
  const token = auth ? await ensureAccessToken() : null;
  return fetch(path, {
    ...init,
    headers: {
      ...(headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
