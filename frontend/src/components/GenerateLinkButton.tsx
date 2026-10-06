import { useEffect, useRef, useState } from 'react';
import type { Invitation, NewInvitation } from '../types';
import { formatShortDate, formatWindow } from '../lib/format';
import { CopyIcon } from './Icons';

/** Either a draft to create or an error message to display. */
export type InvitationDraftResult = { draft: NewInvitation } | { error: string };

export interface LinkSlipProps {
  invitation: Invitation;
}

/** The printed slip: the shareable link plus a copy button. Reusable on any admin screen. */
export function LinkSlip({ invitation }: LinkSlipProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitation.url);
      setFailed(false);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="fz-block" style={{ height: 192, display: 'flex', alignItems: 'center' }}>
      <div className="fz-slip">
        <div className="fz-slip__meta">
          Link für alle · {invitation.restaurantName} · {formatShortDate(invitation.validFrom)}{' '}
          {formatWindow(invitation.validFrom, invitation.validUntil)} Uhr
        </div>
        <div className="fz-slip__body">
          <code className="fz-slip__link">{invitation.url}</code>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" className="fz-btn" onClick={handleCopy}>
              <CopyIcon />
              <span aria-live="polite">{copied ? 'Kopiert!' : 'Kopieren'}</span>
            </button>
            {failed && <span className="fz-error">Kopieren ging nicht.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface GenerateLinkButtonProps {
  /** Build the invitation draft from the current state, or return an error message. */
  buildDraft: () => InvitationDraftResult;
  /** Create the invitation in your backend and return it (with its final URL). */
  onCreate: (input: NewInvitation) => Promise<Invitation>;
  /** Button label. Defaults to "Link erzeugen". */
  label?: string;
  /** Plain (non-stamp) button, for embedding in other screens. */
  compact?: boolean;
}

/** The "Link erzeugen" button plus the generated link slip. Reusable on any admin screen. */
export function GenerateLinkButton({
  buildDraft,
  onCreate,
  label = 'Link erzeugen',
  compact = false,
}: GenerateLinkButtonProps) {
  const [created, setCreated] = useState<Invitation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const result = buildDraft();
    if ('error' in result) return setError(result.error);
    setBusy(true);
    setError('');
    try {
      setCreated(await onCreate(result.draft));
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Link erzeugen hat nicht geklappt.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fz-row fz-row--double fz-row--center" style={{ gap: 16, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={compact ? 'fz-btn' : 'fz-btn fz-btn--stamp'}
          style={compact ? undefined : { fontSize: 30, height: 52 }}
          disabled={busy}
          onClick={handleCreate}
        >
          {busy ? 'Moment …' : label}
        </button>
        <span role="status" className="fz-error">
          {error}
        </span>
      </div>

      {created && <LinkSlip invitation={created} />}
    </>
  );
}
