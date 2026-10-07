import { Navigate, Route, Routes } from 'react-router';
import { MenuEditorPage } from './MenuEditorPage';
import { InvitePage } from './InvitePage';
import { OrdersPage } from './OrdersPage';
import { OrderSheetPage } from './OrderSheetPage';
import { LoginPage } from './LoginPage';
import { RequireAuth } from './RequireAuth';

/**
 * Demo wiring, routed with react-router:
 *   /login                -> sign in (required for the admin area)
 *   /z/<token>            -> order sheet (invitation link)
 *   /admin/speisekarte    -> menu editor   (login required)
 *   /admin/einladung      -> invitation links (login required)
 *   /admin/bestellungen/:id -> orders overview (login required)
 * Restaurants, menus, invitations and orders all come from the backend
 * (`/api/user/...`). MenuEditorPage is self-contained and needs no props.
 */
export function Fresszettel() {
  return (
    <Routes>
      <Route path="/z/:token" element={<OrderSheetPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/speisekarte"
        element={
          <RequireAuth>
            <MenuEditorPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/einladung"
        element={
          <RequireAuth>
            <InvitePage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/bestellungen/:id"
        element={
          <RequireAuth>
            <OrdersPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
