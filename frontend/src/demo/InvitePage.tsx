import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { InviteManager } from '../components/InviteManager';
import { createInvitation, listInvitations } from '../lib/invitations';
import type { Invitation, NewInvitation } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { AdminShell } from './AdminShell';

const ordersHref = (invitation: Invitation) =>
  `/admin/bestellungen?zettel=${encodeURIComponent(invitation.id)}`;

export function InvitePage() {
  const navigate = useNavigate();
  const { restaurants } = useRestaurants();
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // Load the user's invitations (order batches).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await listInvitations();
        if (cancelled) return;
        setInvitations(list);
      } catch {
        // Backend unreachable — leave the list empty.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (input: NewInvitation) => {
    const created = await createInvitation(input);
    setInvitations((is) => [created, ...is]);
    return created;
  };

  const onOpenOrders = (invitation: Invitation) =>
    navigate(`/admin/bestellungen?zettel=${encodeURIComponent(invitation.id)}`);

  return (
    <AdminShell active="einladung">
      <InviteManager
        restaurants={restaurants}
        invitations={invitations}
        onCreate={handleCreate}
        ordersHref={ordersHref}
        onOpenOrders={onOpenOrders}
      />
    </AdminShell>
  );
}
