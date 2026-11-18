import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, type LoginResult } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import type { TranslationKey } from '../i18n';

const ERRORS: Record<Exclude<LoginResult, 'ok'>, TranslationKey> = {
  required: 'login.error.required',
  invalid: 'login.error.invalid',
  locked: 'login.error.locked',
};

export function LoginPage() {
  const { t, to } = useMarket();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<TranslationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirect = params.get('redirect') || to();
  if (user && !submitting) return <Navigate to={redirect} replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Small artificial latency, like a real auth request.
    setTimeout(() => {
      const result = login(username, password);
      if (result === 'ok') {
        navigate(redirect, { replace: true });
      } else {
        setError(ERRORS[result]);
        setSubmitting(false);
      }
    }, 400);
  };

  return (
    <section className="narrow">
      <h1 data-testid="page-title">{t('login.title')}</h1>
      <form className="card form" onSubmit={onSubmit} noValidate data-testid="login-form">
        <label className="field">
          <span>{t('login.username')}</span>
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            data-testid="login-username"
          />
        </label>
        <label className="field">
          <span>{t('login.password')}</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="login-password"
          />
        </label>
        {error && (
          <p className="alert alert--error" role="alert" data-testid="login-error">
            {t(error)}
          </p>
        )}
        <button className="btn" type="submit" disabled={submitting} data-testid="login-submit">
          {submitting ? '…' : t('login.submit')}
        </button>
        <p className="muted small">{t('login.hint')}</p>
      </form>
    </section>
  );
}
