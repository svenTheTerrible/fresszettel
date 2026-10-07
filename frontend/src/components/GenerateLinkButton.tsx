import { useEffect, useRef, useState } from 'react';
import type { NewInvitation } from '../types';
import type { InvitationView } from '../lib/invitations';
import { formatShortDate, formatWindow } from '../lib/format';
import { CopyIcon } from './Icons';
import { useSubmitState } from '../hooks/useSubmitState';

/** Either a draft to create or an error message to display. */
export type InvitationDraftResult = { draft: NewInvitation } | { error: string };

/** Fields the printed slip needs: shared by an invitation and an orders view. */
export interface LinkSlipView {
  restaurantName: string | null;
  validFrom: string | null;
  validUntil: string | null;
  token: string | null;
}

export interface LinkSlipProps {
  invitation: LinkSlipView;
}

/** The printed slip: the shareable link plus a copy button. Reusable on any admin screen. */
export function LinkSlip({ invitation }: LinkSlipProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const shareUrl = `${window.location.origin}/#/z/${invitation.token ?? ''}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
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
          <code className="fz-slip__link">{shareUrl}</code>
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
  /** Create the invitation in your backend and return it (with its final link). */
  onCreate: (input: NewInvitation) => Promise<InvitationView>;
}

/** The "Link erzeugen" button plus the generated link slip. Reusable on any admin screen. */
export function GenerateLinkButton({
  buildDraft,
  onCreate,
}: GenerateLinkButtonProps) {
  const [created, setCreated] = useState<InvitationView | null>(null);
  const { busy, setBusy, error, setError } = useSubmitState();

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
          className="fz-btn fz-btn--stamp"
          style={{ fontSize: 30, height: 52 }}
          disabled={busy}
          onClick={handleCreate}
        >
          {busy ? 'Moment …' : 'Link erzeugen'}
        </button>
        <span role="status" className="fz-error">
          {error}
        </span>
      </div>

      {created && <LinkSlip invitation={created} />}
    </>
  );
}
