import { useParams } from 'react-router';
import { OrdersOverview } from '../components/OrdersOverview';
import { AdminShell } from './AdminShell';

export function OrdersPage() {
  const { id: zettelId } = useParams();

  return (
    <AdminShell active="bestellungen">
      {zettelId ? (
        <OrdersOverview zettelId={zettelId} />
      ) : (
        <div className="fz-row">Noch kein Zettel unterwegs.</div>
      )}
    </AdminShell>
  );
}
