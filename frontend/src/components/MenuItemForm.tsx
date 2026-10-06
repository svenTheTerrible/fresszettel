import { useState, type FormEvent } from 'react';
import type { MenuItem, NewMenuItem } from '../types';
import { parseEuro } from '../lib/format';

export interface MenuItemFormProps {
  /** When set, the form edits that item (pre-filled) instead of adding a new one. */
  editingId?: string;
  /** Pre-fill the fields; used when editing. */
  initial?: Partial<{ number: string; name: string; description: string; priceCents: number }>;
  /** The full menu, used to reject a duplicate order number. */
  menu: MenuItem[];
  /** Persist the values; throw to surface the error inline. */
  onSubmit: (item: NewMenuItem) => Promise<void> | void;
}

const errorText = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback);

/** One menu row as an editable form: number, dish, description, price. */
export function MenuItemForm({ editingId, initial, menu, onSubmit }: MenuItemFormProps) {
  const [no, setNo] = useState(initial?.number ?? '');
  const [dish, setDish] = useState(initial?.name ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.priceCents != null ? (initial.priceCents / 100).toFixed(2) : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const editing = editingId != null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const number = no.trim();
    const name = dish.trim();
    const priceCents = parseEuro(price);
    if (!number || !name) return setError('Nummer und Gericht brauchen wir mindestens.');
    if (priceCents === null) return setError('Der Preis sieht komisch aus, z. B. 8,50');
    if (menu.some((m) => m.number === number && m.id !== editingId))
      return setError(`Nr. ${number} steht schon auf der Karte.`);

    setBusy(true);
    setError('');
    try {
      await onSubmit({ number, name, description: desc.trim() || undefined, priceCents });
      if (!editing) {
        setNo('');
        setDish('');
        setDesc('');
        setPrice('');
      }
    } catch (e) {
      setError(errorText(e, editing ? 'Speichern hat nicht geklappt.' : 'Eintragen hat nicht geklappt.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form className="fz-grid fz-grid--menu" onSubmit={handleSubmit}>
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
          placeholder={editing ? 'Gericht' : 'Neues Gericht …'}
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
        <button
          type="submit"
          className="fz-btn"
          disabled={busy}
          style={{ height: 40, padding: '0 8px', marginBottom: 4, fontSize: 16, justifyContent: 'center' }}
        >
          {busy ? 'Moment …' : editing ? 'Speichern' : 'Eintragen'}
        </button>
      </form>
      {error && (
        <div className="fz-row">
          <span role="status" className="fz-error">
            {error}
          </span>
        </div>
      )}
    </>
  );
}
