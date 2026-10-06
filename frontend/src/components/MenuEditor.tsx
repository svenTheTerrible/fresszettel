import { useEffect, useState } from 'react';
import type { MenuItem, NewMenuItem, Restaurant } from '../types';
import { compareOrderNumbers, formatEuro } from '../lib/format';
import { CrossIcon, PencilIcon } from './Icons';
import { MenuItemForm } from './MenuItemForm';

export interface MenuEditorProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (restaurantId: string) => void;
  /** Create an empty restaurant; select it afterwards via onSelect. */
  onCreateRestaurant: () => Promise<void> | void;
  /** Saved when a name/phone field loses focus. */
  onUpdateRestaurant: (restaurantId: string, patch: { name?: string; phone?: string }) => Promise<void> | void;
  onAddItem: (restaurantId: string, item: NewMenuItem) => Promise<void> | void;
  onUpdateItem: (restaurantId: string, menuItemId: string, item: NewMenuItem) => Promise<void> | void;
  onDeleteItem: (restaurantId: string, menuItemId: string) => Promise<void> | void;
}

const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

/** Admin: restaurants and their menus (order number, dish, description, price). */
export function MenuEditor({
  restaurants,
  selectedId,
  onSelect,
  onCreateRestaurant,
  onUpdateRestaurant,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: MenuEditorProps) {
  const current = restaurants.find((r) => r.id === selectedId) ?? restaurants[0] ?? null;

  // Local drafts for name/phone so we only hit the backend on blur.
  const [nameDraft, setNameDraft] = useState(current?.name ?? '');
  const [phoneDraft, setPhoneDraft] = useState(current?.phone ?? '');
  useEffect(() => {
    setNameDraft(current?.name ?? '');
    setPhoneDraft(current?.phone ?? '');
  }, [current?.id, current?.name, current?.phone]);

  /** The menu item currently being edited inline, if any. */
  const [editingId, setEditingId] = useState<string | null>(null);

  /** The menu item awaiting a delete confirmation, if any. */
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const [error, setError] = useState('');
  const run = async (fn: () => Promise<void> | void, fallback: string) => {
    setError('');
    try {
      await fn();
      return true;
    } catch (e) {
      setError(errorText(e, fallback));
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !current) return;
    const ok = await run(() => onDeleteItem(current.id, deleteTarget.id), 'Streichen hat nicht geklappt.');
    if (ok) setDeleteTarget(null);
  };

  const saveField = (field: 'name' | 'phone', value: string) => {
    if (!current) return;
    const trimmed = value.trim();
    if ((current[field] ?? '') === trimmed) return;
    if (field === 'name' && !trimmed) {
      setNameDraft(current.name);
      return;
    }
    void run(() => onUpdateRestaurant(current.id, { [field]: trimmed }), 'Speichern hat nicht geklappt.');
  };

  const menu = current ? [...current.menu].sort((a, b) => compareOrderNumbers(a.number, b.number)) : [];
  const countText = !current
    ? ''
    : menu.length === 0
      ? 'Noch leer. Unten das erste Gericht eintragen.'
      : menu.length === 1
        ? '1 Gericht'
        : `${menu.length} Gerichte`;

  return (
    <>
      <div className="fz-row fz-row--double">
        <h1 className="fz-h1">Restaurants</h1>
      </div>

      <div className="fz-row fz-row--grow" style={{ columnGap: 8, rowGap: 0 }}>
        {restaurants.map((r) => {
          const active = r.id === current?.id;
          return (
            <button key={r.id} type="button" className="fz-chip" aria-pressed={active} onClick={() => onSelect(r.id)}>
              <span className={active ? 'fz-highlight' : undefined}>{r.name || 'Ohne Namen'}</span>
            </button>
          );
        })}
        <button
          type="button"
          className="fz-btn fz-btn--dashed"
          onClick={() => void run(onCreateRestaurant, 'Anlegen hat nicht geklappt.')}
        >
          + Restaurant anlegen
        </button>
      </div>

      {current && (
        <>
          <div className="fz-spacer" />

          <div className="fz-row fz-row--wrap" style={{ columnGap: 24 }}>
            <label className="fz-field">
              Name
              <input
                className="fz-input fz-input--hand"
                style={{ width: 260 }}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={() => saveField('name', nameDraft)}
              />
            </label>
            <label className="fz-field">
              Telefon
              <input
                className="fz-input fz-input--hand"
                style={{ width: 200 }}
                value={phoneDraft}
                inputMode="tel"
                placeholder="Telefonnummer"
                onChange={(e) => setPhoneDraft(e.target.value)}
                onBlur={() => saveField('phone', phoneDraft)}
              />
            </label>
          </div>

          <div className="fz-spacer" />

          <div className="fz-row fz-row--double fz-row--between" style={{ paddingRight: 0 }}>
            <h2 className="fz-h2" style={{ fontSize: 40 }}>
              Speisekarte
            </h2>
            <span className="fz-muted" style={{ fontSize: 15, lineHeight: '30px' }}>
              {countText}
            </span>
          </div>

          <div className="fz-grid fz-grid--menu fz-th" aria-hidden="true">
            <span className="fz-right">Nr.</span>
            <span>Gericht</span>
            <span className="fz-hide-sm">Beschreibung</span>
            <span className="fz-right">Preis</span>
            <span />
          </div>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label={`Speisekarte ${current.name}`}>
            {menu.map((item) =>
              editingId === item.id ? (
                <li key={item.id}>
                  <MenuItemForm
                    menu={menu}
                    editingId={item.id}
                    initial={toFormInitial(item)}
                    onSubmit={async (next) => {
                      await onUpdateItem(current.id, item.id, next);
                      setEditingId(null);
                    }}
                  />
                </li>
              ) : (
                <li key={item.id} className="fz-grid fz-grid--menu">
                  <span className="fz-no">{item.number}</span>
                  <span className="fz-text fz-ellipsis">{item.name}</span>
                  <span className="fz-pick__desc fz-hide-sm">{item.description}</span>
                  <span className="fz-text fz-right fz-nowrap">{formatEuro(item.priceCents)}</span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, height: 44 }}>
                    <button
                      type="button"
                      className="fz-icon-btn"
                      aria-label={`${item.name} ändern`}
                      onClick={() => setEditingId(item.id)}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className="fz-icon-btn"
                       aria-label={`${item.name} streichen`}
                       onClick={() => setDeleteTarget(item)}
                    >
                      <CrossIcon />
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>

          <MenuItemForm
            menu={menu}
            onSubmit={(next) => onAddItem(current.id, next)}
          />
        </>
      )}

      <div className="fz-row">
        <span role="status" className="fz-error">
          {error}
        </span>
      </div>

      {deleteTarget && (
        <div
          className="fz-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fz-del-title"
          aria-describedby="fz-del-desc"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setDeleteTarget(null);
          }}
        >
          <div className="fz-modal__backdrop" onClick={() => setDeleteTarget(null)} />
          <div className="fz-modal__card">
            <h2 className="fz-h2" id="fz-del-title">
              Gericht streichen?
            </h2>
            <p className="fz-text" id="fz-del-desc">
              „{deleteTarget.name}“ von der Karte entfernen?
            </p>
            <div className="fz-modal__actions">
              <button type="button" className="fz-btn" onClick={() => setDeleteTarget(null)}>
                Abbrechen
              </button>
              <button type="button" className="fz-btn" autoFocus onClick={() => void confirmDelete()}>
                Streichen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function toFormInitial(item: MenuItem) {
  return { number: item.number, name: item.name, description: item.description ?? '', priceCents: item.priceCents };
}
