import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from './auth-context';

type Mode = 'login' | 'register';

/** Sign-in screen. The admin area is only reachable once this succeeds. */
export function LoginPage() {
  const { token, login, register } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If RequireAuth bounced us here, send the user back to the tab they wanted.
  const from = (location.state as { from?: string } | null)?.from;
  const target = from ?? '/admin/speisekarte';

  // Already signed in? Straight to the admin area.
  if (token) {
    return <Navigate to={target} replace />;
  }

  const isLogin = mode === 'login';

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !email.trim() || !password) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      if (isLogin) {
        await login(email, password);
        // On success the token is set and the guard above bounces us to the admin area.
      } else {
        await register(email, password);
        // Account created: hand the user back to sign-in with the form still filled.
        setMode('login');
        setSuccess('Konto erstellt. Melde dich jetzt an.');
      }
      setBusy(false);
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
          <span className="fz-small fz-muted fz-nowrap">{isLogin ? 'Anmelden' : 'Konto erstellen'}</span>
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
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </div>

          <div className="fz-spacer" />

          <div className="fz-row fz-row--center" style={{ gap: 20, flexWrap: 'wrap' }}>
            <button type="submit" className="fz-btn fz-btn--stamp" disabled={busy || !email.trim() || !password}>
              {busy ? (isLogin ? 'Wird angemeldet …' : 'Wird erstellt …') : isLogin ? 'Anmelden' : 'Konto erstellen'}
            </button>
            <button
              type="button"
              className="fz-link"
              disabled={busy}
              onClick={() => switchMode(isLogin ? 'register' : 'login')}
            >
              {isLogin ? 'Konto erstellen?' : 'Schon ein Konto? Anmelden'}
            </button>
          </div>
          {error && (
            <p role="alert" className="fz-error" style={{ margin: '0 0 16px', textAlign: 'center' }}>
              {error}
            </p>
          )}
          {success && (
            <p className="fz-success" style={{ margin: '0 0 16px', textAlign: 'center' }}>
              {success}
            </p>
          )}
        </form>
      </main>
      <p className="fz-footer-note">Fresszettel · Nur für den Admin.</p>
    </div>
  );
}
