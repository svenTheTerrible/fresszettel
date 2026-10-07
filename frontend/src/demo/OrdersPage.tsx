import { useSearchParams } from 'react-router';
import { OrdersOverview } from '../components/OrdersOverview';
import type { Invitation } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { AdminShell } from './AdminShell';

/** Placeholder until OrdersPage is wired to the real invitations source. */
const invitations: Invitation[] = [];

export function OrdersPage() {
  const [searchParams] = useSearchParams();
  const { restaurants } = useRestaurants();
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
