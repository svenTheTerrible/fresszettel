import { useParams } from 'react-router';
import { OrderSheet } from '../components/OrderSheet';
import type { Invitation, OrderDraft, Restaurant } from '../types';

export interface OrderSheetPageProps {
  restaurants: Restaurant[];
  invitations: Invitation[];
  onPlaceOrder: (invitationId: string, draft: OrderDraft) => void;
}

/** Invitation link: the order sheet. */
export function OrderSheetPage({ restaurants, invitations, onPlaceOrder }: OrderSheetPageProps) {
  const { token } = useParams();
  const invitation = invitations.find((i) => i.url.endsWith(`/z/${token}`));
  const restaurant = restaurants.find((r) => r.id === invitation?.restaurantId);
  if (!invitation || !restaurant) return <p style={{ padding: 24 }}>Diesen Zettel gibt es nicht.</p>;
  return <OrderSheet restaurant={restaurant} validUntil={invitation.validUntil} onSubmit={(draft) => onPlaceOrder(invitation.id, draft)} />;
}
