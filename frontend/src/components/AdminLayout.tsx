import type { MouseEvent, ReactNode } from 'react';
import type { AdminTab } from '../types';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'speisekarte', label: 'Speisekarte' },
  { id: 'einladung', label: 'Einladung' },
  { id: 'bestellungen', label: 'Bestellungen' },
];

export interface AdminLayoutProps {
  active: AdminTab;
  children: ReactNode;
  /** Link target for each tab. Defaults to hash routes like "#/admin/speisekarte". */
  hrefFor?: (tab: AdminTab) => string;
  /** Optional client-side navigation (e.g. react-router's navigate). */
  onNavigate?: (tab: AdminTab) => void;
}

/** Desk background, logo, index tabs and the lined sheet for all admin screens. */
export function AdminLayout({ active, children, hrefFor = (t) => `#/admin/${t}`, onNavigate }: AdminLayoutProps) {
  const handleClick = (tab: AdminTab) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(tab);
  };

  return (
    <div className="fz-desk fz-desk--admin">
      <div className="fz-admin">
        <header className="fz-admin__header">
          <span className="fz-logo fz-logo--small">Fresszettel</span>
          <span className="fz-admin__badge">Admin</span>
        </header>
        <nav className="fz-tabs" aria-label="Admin-Bereiche">
          {TABS.map((tab) => (
            <a
              key={tab.id}
              href={hrefFor(tab.id)}
              onClick={handleClick(tab.id)}
              className={`fz-tab fz-tab--${tab.id}`}
              aria-current={tab.id === active ? 'page' : undefined}
            >
              {tab.label}
            </a>
          ))}
        </nav>
        <main className={`fz-sheet${active === TABS[0].id ? ' fz-sheet--first-tab' : ''}`}>{children}</main>
      </div>
    </div>
  );
}
