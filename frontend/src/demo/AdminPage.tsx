import { useNavigate, useParams, useSearchParams } from 'react-router';
import { AdminLayout, InviteManager, MenuEditor, OrdersOverview } from '../index';
import type { AdminTab, Invitation, NewInvitation, NewMenuItem, Order, Restaurant } from '../types';

const TABS: AdminTab[] = ['speisekarte', 'einladung', 'bestellungen'];
const adminHref = (tab: AdminTab, zettelId?: string) =>
  zettelId ? `/admin/${tab}?zettel=${encodeURIComponent(zettelId)}` : `/admin/${tab}`;

export interface AdminPageProps {
  restaurants: Restaurant[];
  invitations: Invitation[];
  orders: Order[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateRestaurant: () => void;
  onUpdateRestaurant: (id: string, patch: { name?: string; phone?: string }) => void;
  onAddItem: (id: string, item: NewMenuItem) => void;
  onDeleteItem: (id: string, itemId: string) => void;
  onCreateInvitation: (input: NewInvitation) => Promise<Invitation>;
  onTogglePaid: (orderId: string, paid: boolean) => void;
}

/** All admin tabs. */
export function AdminPage({
  restaurants,
  invitations,
  orders,
  selectedId,
  onSelect,
  onCreateRestaurant,
  onUpdateRestaurant,
  onAddItem,
  onDeleteItem,
  onCreateInvitation,
  onTogglePaid,
}: AdminPageProps) {
  const { tab: tabParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab: AdminTab = TABS.includes(tabParam as AdminTab) ? (tabParam as AdminTab) : 'speisekarte';
  const current = invitations.find((i) => i.id === searchParams.get('zettel')) ?? invitations[0];

  return (
    <AdminLayout active={tab} hrefFor={adminHref} onNavigate={(t) => navigate(adminHref(t))}>
      {tab === 'speisekarte' && (
        <MenuEditor
          restaurants={restaurants}
          selectedId={selectedId}
          onSelect={onSelect}
          onCreateRestaurant={onCreateRestaurant}
          onUpdateRestaurant={onUpdateRestaurant}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
        />
      )}

      {tab === 'einladung' && (
        <InviteManager
          restaurants={restaurants}
          invitations={invitations.map((inv) => {
            const restaurant = restaurants.find((r) => r.id === inv.restaurantId);
            const its = orders.filter((o) => o.invitationId === inv.id);
            const prices = new Map(restaurant?.menu.map((m) => [m.id, m.priceCents]));
            const totalCents = its.reduce((s, o) => s + o.lines.reduce((t, l) => t + (prices.get(l.menuItemId) ?? 0) * l.quantity, 0), 0);
            return { ...inv, orderCount: its.length, totalCents };
          })}
          ordersHref={(inv) => adminHref('bestellungen', inv.id)}
          onOpenOrders={(inv) => navigate(adminHref('bestellungen', inv.id))}
          onCreate={onCreateInvitation}
        />
      )}

      {tab === 'bestellungen' &&
        (current ? (
          <OrdersOverview
            invitation={current}
            restaurant={restaurants.find((r) => r.id === current.restaurantId)!}
            orders={orders.filter((o) => o.invitationId === current.id)}
            onTogglePaid={onTogglePaid}
          />
        ) : (
          <div className="fz-row">Noch kein Zettel unterwegs.</div>
        ))}
    </AdminLayout>
  );
}
