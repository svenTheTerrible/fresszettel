import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { OrderSheet } from '../components/OrderSheet';
import { getOrderMenu, placeOrder } from '../lib/orders';
import { loadName, loadOrder, pruneExpiredOrders, saveName, saveOrder } from '../lib/orderSheetStorage';

/** Invitation link: the order sheet, loaded from the backend by token. */
export function OrderSheetPage() {
  const { token = '' } = useParams();

  // The name + dish selection the visitor last entered, so reopening the link
  // restores it.
  const saved = { name: loadName(), order: token ? loadOrder(token) : null };

  // Drop remembered sheets that are older than two weeks, once on mount.
  useEffect(() => {
    pruneExpiredOrders();
  }, []);

  // Load the order sheet data for this token via react-query.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['order-menu', token],
    queryFn: () => getOrderMenu(token),
  });

  const handlePersist = useCallback(
    (name: string, quantities: Record<string, number>) => {
      if (!token) return;
      saveName(name);
      saveOrder(token, quantities);
    },
    [token],
  );

  if (isLoading) {
    return <p style={{ padding: 24 }}>Wird geladen …</p>;
  }
  if (isError) {
    return <p style={{ padding: 24 }}>{error?.message ?? 'Das hat nicht geklappt. Versuch es nochmal.'}</p>;
  }
  if (!data) {
    return <p style={{ padding: 24 }}>Diesen Zettel gibt es nicht.</p>;
  }
  return (
    <OrderSheet
      key={token}
      view={data}
      initialName={saved.name}
      initialQuantities={saved.order?.quantities ?? {}}
      onPersist={handlePersist}
      onSubmit={(draft) => placeOrder(token, draft)}
    />
  );
}
