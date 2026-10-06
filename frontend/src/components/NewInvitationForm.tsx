import { useEffect, useState } from 'react';
import type { Invitation, NewInvitation, Restaurant } from '../types';
import { combineDateAndTime, toDateInputValue } from '../lib/format';
import { GenerateLinkButton, type InvitationDraftResult } from './GenerateLinkButton';

export interface NewInvitationFormProps {
  restaurants: Pick<Restaurant, 'id' | 'name'>[];
  /** Create the invitation in your backend and return it (with its final URL). */
  onCreate: (input: NewInvitation) => Promise<Invitation>;
  defaultUntil?: string;
}

/** Pick a restaurant + time window, then generate the order link. */
export function NewInvitationForm({ restaurants, onCreate, defaultUntil = '12:15' }: NewInvitationFormProps) {
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? '');
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [until, setUntil] = useState(defaultUntil);

  useEffect(() => {
    if (!restaurants.some((r) => r.id === restaurantId)) setRestaurantId(restaurants[0]?.id ?? '');
  }, [restaurants, restaurantId]);

  const buildDraft = (): InvitationDraftResult => {
    const validFrom = new Date();
    const validUntil = combineDateAndTime(date, until);
    if (!restaurantId) return { error: 'Erst ein Restaurant anlegen.' };
    if (!validUntil) return { error: 'Datum und Uhrzeiten bitte ausfüllen.' };
    if (validUntil <= validFrom) return { error: '„bis“ muss nach „von“ liegen.' };
    if (validUntil.getTime() <= Date.now()) return { error: 'Das Zeitfenster liegt schon in der Vergangenheit.' };
    return { draft: { restaurantId, validFrom, validUntil } };
  };

  return (
    <>
      <div className="fz-row fz-row--grow fz-row--wrap">
        <label className="fz-field">
          Restaurant
          <select className="fz-input fz-input--hand" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="fz-row fz-row--grow fz-row--wrap">
        <label className="fz-field">
          Datum
          <input type="date" className="fz-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="fz-field">
          bis
          <input type="time" className="fz-input" value={until} onChange={(e) => setUntil(e.target.value)} />
        </label>
      </div>

      <GenerateLinkButton buildDraft={buildDraft} onCreate={onCreate} />
    </>
  );
}
