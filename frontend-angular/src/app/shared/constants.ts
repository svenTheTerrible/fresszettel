export type AdminTabType = 'speisekarte' | 'einladung' | 'bestellungen';

export const ADMIN_TABS: { id: AdminTabType; label: string; hiddenByDefault?: boolean }[] = [
  { id: 'speisekarte', label: 'Speisekarte' },
  { id: 'einladung', label: 'Einladung' },
  { id: 'bestellungen', label: 'Bestellungen', hiddenByDefault: true },
];
