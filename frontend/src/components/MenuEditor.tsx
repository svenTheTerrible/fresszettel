import { useEffect, useState, type FormEvent } from 'react';
import type { NewMenuItem, Restaurant } from '../types';
import { compareOrderNumbers, formatEuro, parseEuro } from '../lib/format';
import { CrossIcon } from './Icons';

export interface MenuEditorProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (restaurantId: string) => void;
  /** Create an empty restaurant; select it afterwards via onSelect. */
  onCreateRestaurant: () => Promise<void> | void;
  /** Saved when a name/phone field loses focus. */
  onUpdateRestaurant: (restaurantId: string, patch: { name?: string; phone?: string }) => Promise<void> | void;
  onAddItem: (restaurantId: string, item: NewMenuItem) => Promise<void> | void;
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

  const [no, setNo] = useState('');
  const [dish, setDish] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!current || busy) return;
    const number = no.trim();
    const name = dish.trim();
    const priceCents = parseEuro(price);
    if (!number || !name) return setError('Nummer und Gericht brauchen wir mindestens.');
    if (priceCents === null) return setError('Der Preis sieht komisch aus, z. B. 8,50');
    if (current.menu.some((m) => m.number === number)) return setError(`Nr. ${number} steht schon auf der Karte.`);

    setBusy(true);
    const ok = await run(
      () => onAddItem(current.id, { number, name, description: desc.trim() || undefined, priceCents }),
      'Eintragen hat nicht geklappt.',
    );
    setBusy(false);
    if (ok) {
      setNo('');
      setDish('');
      setDesc('');
      setPrice('');
    }
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
            {menu.map((item) => (
              <li key={item.id} className="fz-grid fz-grid--menu">
                <span className="fz-no">{item.number}</span>
                <span className="fz-text fz-ellipsis">{item.name}</span>
                <span className="fz-pick__desc fz-hide-sm">{item.description}</span>
                <span className="fz-text fz-right fz-nowrap">{formatEuro(item.priceCents)}</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', height: 44 }}>
                  <button
                    type="button"
                    className="fz-icon-btn"
                    aria-label={`${item.name} streichen`}
                    onClick={() => void run(() => onDeleteItem(current.id, item.id), 'Streichen hat nicht geklappt.')}
                  >
                    <CrossIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <form className="fz-grid fz-grid--menu" onSubmit={handleAdd}>
            <input
              className="fz-input fz-input--dashed fz-input--no"
              aria-label="Bestellnummer"
              placeholder="Nr."
              value={no}
              onChange={(e) => setNo(e.target.value)}
            />
            <input
              className="fz-input fz-input--dashed"
              aria-label="Gericht"
              placeholder="Neues Gericht …"
              value={dish}
              onChange={(e) => setDish(e.target.value)}
            />
            <input
              className="fz-input fz-input--dashed fz-hide-sm"
              style={{ fontSize: 16 }}
              aria-label="Beschreibung"
              placeholder="Beschreibung (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <input
              className="fz-input fz-input--dashed fz-right"
              aria-label="Preis in Euro"
              placeholder="0,00 €"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button type="submit" className="fz-btn" disabled={busy} style={{ height: 40, padding: '0 8px', marginBottom: 4, fontSize: 16, justifyContent: 'center' }}>
              Eintragen
            </button>
          </form>
        </>
      )}

      <div className="fz-row">
        <span role="status" className="fz-error">
          {error}
        </span>
      </div>
    </>
  );
}
