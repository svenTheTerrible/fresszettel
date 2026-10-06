import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { OrderSheet } from '../components/OrderSheet';
import { getOrderMenu, placeOrder } from '../lib/orders';
import type { OrderMenu } from '../lib/orders';
import { loadName, loadOrder, pruneExpiredOrders, saveName, saveOrder } from '../lib/orderSheetStorage';
import type { Restaurant } from '../types';

type State =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; message: string }
  | { status: 'ready'; restaurant: Restaurant; deadline: string };

/** Invitation link: the order sheet, loaded from the backend by token. */
export function OrderSheetPage() {
  const { token = '' } = useParams();
  const [state, setState] = useState<State>({ status: 'loading' });

  // The name + dish selection the visitor last entered, read once on mount so
  // reopening the link restores it.
  const [saved] = useState(() => ({ name: loadName(), order: token ? loadOrder(token) : null }));

  useEffect(() => {
    pruneExpiredOrders();
    let cancelled = false;
    void (async () => {
      try {
        const menu: OrderMenu | null = await getOrderMenu(token);
        if (cancelled) return;
        setState(
          menu
            ? { status: 'ready', restaurant: menu.restaurant, deadline: menu.deadline }
            : { status: 'missing' },
        );
      } catch (e) {
        if (cancelled) return;
        setState({
          status: 'error',
          message: e instanceof Error && e.message ? e.message : 'Das hat nicht geklappt. Versuch es nochmal.',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handlePersist = useCallback(
    (name: string, quantities: Record<string, number>) => {
      if (!token) return;
      saveName(name);
      saveOrder(token, quantities);
    },
    [token],
  );

  if (state.status === 'loading') {
    return <p style={{ padding: 24 }}>Wird geladen …</p>;
  }
  if (state.status === 'missing') {
    return <p style={{ padding: 24 }}>Diesen Zettel gibt es nicht.</p>;
  }
  if (state.status === 'error') {
    return <p style={{ padding: 24 }}>{state.message}</p>;
  }
  return (
    <OrderSheet
      key={token}
      restaurant={state.restaurant}
      validUntil={state.deadline}
      initialName={saved.name}
      initialQuantities={saved.order?.quantities ?? {}}
      onPersist={handlePersist}
      onSubmit={(draft) => placeOrder(token, draft)}
    />
  );
}
