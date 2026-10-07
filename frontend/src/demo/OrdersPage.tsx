import { useSearchParams } from 'react-router';
import { OrdersOverview } from '../components/OrdersOverview';
import type { Invitation, Restaurant } from '../types';
import { AdminShell } from './AdminShell';

export interface OrdersPageProps {
  invitations: Invitation[];
  restaurants: Restaurant[];
}

export function OrdersPage({ invitations, restaurants }: OrdersPageProps) {
  const [searchParams] = useSearchParams();
  const current = invitations.find((i) => i.id === searchParams.get('zettel')) ?? invitations[0];

  return (
    <AdminShell active="bestellungen">
      {current ? (
        <OrdersOverview
          invitation={current}
          restaurant={restaurants.find((r) => r.id === current.restaurantId)!}
        />
      ) : (
        <div className="fz-row">Noch kein Zettel unterwegs.</div>
      )}
    </AdminShell>
  );
}
