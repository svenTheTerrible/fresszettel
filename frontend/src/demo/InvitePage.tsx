import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { InviteManager } from '../components/InviteManager';
import { createInvitation, listInvitations } from '../lib/invitations';
import type { InvitationView } from '../lib/invitations';
import type { NewInvitation } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { AdminShell } from './AdminShell';

const ordersHref = (invitation: InvitationView) => `/admin/bestellungen/${invitation.id}`;

export function InvitePage() {
  const navigate = useNavigate();
  const { restaurants } = useRestaurants();
  const queryClient = useQueryClient();

  // Load the user's invitations (order batches) via react-query.
  const { data: invitations = [] } = useQuery({
    queryKey: ['invitations'],
    queryFn: listInvitations,
  });

  const handleCreate = async (input: NewInvitation) => {
    const created = await createInvitation(input);
    queryClient.invalidateQueries({ queryKey: ['invitations'] });
    return created;
  };

  const onOpenOrders = (invitation: InvitationView) =>
    navigate(`/admin/bestellungen/${invitation.id}`);

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
