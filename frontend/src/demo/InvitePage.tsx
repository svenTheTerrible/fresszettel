import { InviteManager } from '../components/InviteManager';
import type { Invitation, NewInvitation, Restaurant } from '../types';
import { AdminShell } from './AdminShell';

export interface InvitePageProps {
  restaurants: Pick<Restaurant, 'id' | 'name'>[];
  invitations: Invitation[];
  onCreate: (input: NewInvitation) => Promise<Invitation>;
  onOpenOrders: (invitation: Invitation) => void;
}

const ordersHref = (invitation: Invitation) =>
  `/admin/bestellungen?zettel=${encodeURIComponent(invitation.id)}`;

export function InvitePage({
  restaurants,
  invitations,
  onCreate,
  onOpenOrders,
}: InvitePageProps) {
  return (
    <AdminShell active="einladung">
      <InviteManager
        restaurants={restaurants}
        invitations={invitations}
        onCreate={onCreate}
        ordersHref={ordersHref}
        onOpenOrders={onOpenOrders}
      />
    </AdminShell>
  );
}
