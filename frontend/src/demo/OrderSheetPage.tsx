import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { OrderSheet } from '../components/OrderSheet';
import { getOrderMenu, placeOrder } from '../lib/orders';
import type { OrderMenu } from '../lib/orders';
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

  useEffect(() => {
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
      restaurant={state.restaurant}
      validUntil={state.deadline}
      onSubmit={(draft) => placeOrder(token, draft)}
    />
  );
}
