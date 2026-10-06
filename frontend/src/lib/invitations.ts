/**
 * Thin invitation layer for the demo app. Talks to the backend's
 * `POST/GET /api/user/...Invitation` endpoints (order batches), maps the DTOs
 * onto the shared types, and throws Errors with user-facing messages on failure
 * (like restaurants.ts).
 */

import type { Invitation, NewInvitation } from '../types';
import {
  fetchCreateInvitation,
  fetchListInvitations,
  type CreateInvitationRequest,
} from './api';

/**
 * One element of the invitation endpoints, exactly as serialized by the
 * backend. Reference fields may be `null`; timestamps are ISO local date-times.
 */
export interface InvitationView {
  id: number;
  token: string | null;
  restaurantId: number | null;
  restaurantName: string | null;
  validFrom: string | null;
  validUntil: string | null;
  orderCount: number | null;
  total: number | null;
}

function assertOk(response: Response): void {
  if (!response.ok) {
    throw new Error('Etwas ist schiefgelaufen. Versuch es nochmal.');
  }
}

/**
 * Map a backend view onto the shared shape. The shareable link is rebuilt from
 * the batch token (the `/z/<token>` route); backend `null`s become empty or
 * `undefined`.
 */
export function toInvitation(view: InvitationView): Invitation {
  return {
    id: String(view.id),
    url: `${location.origin}/z/${view.token ?? ''}`,
    restaurantId: String(view.restaurantId ?? ''),
    restaurantName: view.restaurantName ?? '',
    validFrom: view.validFrom ?? '',
    validUntil: view.validUntil ?? '',
    orderCount: view.orderCount ?? undefined,
    total: view.total ?? undefined,
  };
}

/** Format a Date as an ISO local date-time (no offset), matching the backend. */
function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}:${s}`;
}

/** List the logged-in user's invitations, newest first. */
export async function listInvitations(): Promise<Invitation[]> {
  let response: Response;
  try {
    response = await fetchListInvitations();
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
  const views = (await response.json()) as InvitationView[];
  return views.map(toInvitation);
}

/** Create an invitation in the backend and return it (with its final URL). */
export async function createInvitation(input: NewInvitation): Promise<Invitation> {
  const request: CreateInvitationRequest = {
    restaurantId: Number(input.restaurantId),
    validFrom: toLocalIso(input.validFrom),
    validUntil: toLocalIso(input.validUntil),
  };
  let response: Response;
  try {
    response = await fetchCreateInvitation(request);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
  const view = (await response.json()) as InvitationView;
  return toInvitation(view);
}
