import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from './auth-context';

/** Sign-in screen. The admin area is only reachable once this succeeds. */
export function LoginPage() {
  const { token, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If RequireAuth bounced us here, send the user back to the tab they wanted.
  const from = (location.state as { from?: string } | null)?.from;
  const target = from ?? '/admin/speisekarte';

  // Already signed in? Straight to the admin area.
  if (token) {
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !email.trim() || !password) return;
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      // On success the token is set and the guard above bounces us to the admin area.
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Das hat nicht geklappt. Versuch es nochmal.');
      setBusy(false);
    }
  };

  return (
    <div className="fz-desk">
      <main className="fz-sheet fz-sheet--order" style={{ maxWidth: 560 }}>
        <div className="fz-row fz-row--double fz-row--between">
          <h1 className="fz-logo fz-logo--small">Fresszettel</h1>
          <span className="fz-small fz-muted fz-nowrap">Anmelden</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fz-spacer" />

          <div className="fz-row">
            <label htmlFor="fz-login-email" className="fz-text fz-nowrap">
              E-Mail:
            </label>
            <input
              id="fz-login-email"
              className="fz-input fz-input--hand fz-input--name"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fresszettel.de"
              autoComplete="email"
              required
              autoFocus
            />
          </div>

          <div className="fz-row">
            <label htmlFor="fz-login-password" className="fz-text fz-nowrap">
              Passwort:
            </label>
            <input
              id="fz-login-password"
              className="fz-input fz-input--hand fz-input--name"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="fz-spacer" />

          <div className="fz-row fz-row--center" style={{ gap: 20, flexWrap: 'wrap' }}>
            <button type="submit" className="fz-btn fz-btn--stamp" disabled={busy || !email.trim() || !password}>
              {busy ? 'Wird angemeldet …' : 'Anmelden'}
            </button>
            {error && (
              <span role="alert" className="fz-error" style={{ fontSize: 15, lineHeight: '22px' }}>
                {error}
              </span>
            )}
          </div>
        </form>
      </main>
      <p className="fz-footer-note">Fresszettel · Nur für den Admin.</p>
    </div>
  );
}
