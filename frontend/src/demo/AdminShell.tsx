import { useNavigate } from 'react-router';
import type { ReactNode } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import type { AdminTab } from '../types';
import { useAuth } from './auth-context';

/** AdminLayout with sign-out and client-side tab navigation already wired up. */
export function AdminShell({ active, children }: { active: AdminTab; children: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const hrefFor = (tab: AdminTab) => `/admin/${tab}`;

  return (
    <AdminLayout
      active={active}
      hrefFor={hrefFor}
      onNavigate={(tab) => navigate(hrefFor(tab))}
      onLogout={handleLogout}
    >
      {children}
    </AdminLayout>
  );
}
