import { useNavigate, useParams, useSearchParams } from 'react-router';
import { AdminLayout } from '../components/AdminLayout';
import { InviteManager } from '../components/InviteManager';
import { MenuEditor } from '../components/MenuEditor';
import { OrdersOverview } from '../components/OrdersOverview';
import { useAuth } from './auth-context';
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
  onUpdateItem: (id: string, itemId: string, item: NewMenuItem) => void;
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
  onUpdateItem,
  onDeleteItem,
  onCreateInvitation,
  onTogglePaid,
}: AdminPageProps) {
  const { tab: tabParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const tab: AdminTab = TABS.includes(tabParam as AdminTab) ? (tabParam as AdminTab) : 'speisekarte';
  const current = invitations.find((i) => i.id === searchParams.get('zettel')) ?? invitations[0];

  return (
    <AdminLayout active={tab} hrefFor={adminHref} onNavigate={(t) => navigate(adminHref(t))} onLogout={handleLogout}>
      {tab === 'speisekarte' && (
        <MenuEditor
          restaurants={restaurants}
          selectedId={selectedId}
          onSelect={onSelect}
          onCreateRestaurant={onCreateRestaurant}
          onUpdateRestaurant={onUpdateRestaurant}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
        />
      )}

      {tab === 'einladung' && (
        <InviteManager
          restaurants={restaurants}
          invitations={invitations}
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
