import { useState, type FormEvent } from 'react';
import { useMarket } from '../context/MarketContext';
import { CustomSelect } from '../components/CustomSelect';
import type { TranslationKey } from '../i18n';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  postalCode: string;
  phone: string;
  gender: string;
  interests: string[];
  contact: string;
  experience: number;
  newsletter: boolean;
  cv: string;
  comments: string;
  terms: boolean;
}

const EMPTY: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  birthDate: '',
  postalCode: '',
  phone: '',
  gender: '',
  interests: [],
  contact: '',
  experience: 0,
  newsletter: false,
  cv: '',
  comments: '',
  terms: false,
};

type Errors = Partial<Record<keyof FormState, string>>;

export function passwordStrength(pw: string): 'weak' | 'medium' | 'strong' {
  if (pw.length < 8 || !/\d/.test(pw)) return 'weak';
  if (/[A-Z]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return 'strong';
  return 'medium';
}

export function FormsPage() {
  const { market, t } = useMarket();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = (): Errors => {
    const e: Errors = {};
    const req = t('error.required');
    if (!form.firstName.trim()) e.firstName = req;
    if (!form.lastName.trim()) e.lastName = req;
    if (!form.email.trim()) e.email = req;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('error.email');
    if (form.password.length < 8) e.password = t('error.password');
    if (!form.postalCode.trim()) e.postalCode = req;
    else if (!market.postalCode.pattern.test(form.postalCode.trim())) e.postalCode = t('error.postal', { market: t(`market.${market.code}` as TranslationKey) });
    if (!form.gender) e.gender = req;
    if (!form.terms) e.terms = t('error.terms');
    return e;
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      const { password, ...safe } = form;
      setResult(JSON.stringify({ market: market.code, ...safe, phone: form.phone ? `${market.phonePrefix} ${form.phone}` : '' }, null, 2));
    } else {
      setResult(null);
    }
  };

  const onReset = () => {
    setForm(EMPTY);
    setErrors({});
    setResult(null);
  };

  const strength = passwordStrength(form.password);
  const err = (key: keyof FormState) =>
    errors[key] ? (
      <span className="field__error" role="alert" data-testid={`error-${key}`}>
        {errors[key]}
      </span>
    ) : null;

  const toggleInterest = (value: string) =>
    set('interests', form.interests.includes(value) ? form.interests.filter((i) => i !== value) : [...form.interests, value]);

  return (
    <section>
      <h1 data-testid="page-title">{t('forms.title')}</h1>

      <form className="card form form--grid" onSubmit={onSubmit} onReset={onReset} noValidate data-testid="registration-form">
        <label className="field">
          <span>{t('forms.firstName')} *</span>
          <input name="firstName" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} data-testid="first-name" />
          {err('firstName')}
        </label>

        <label className="field">
          <span>{t('forms.lastName')} *</span>
          <input name="lastName" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} data-testid="last-name" />
          {err('lastName')}
        </label>

        <label className="field">
          <span>{t('forms.email')} *</span>
          <input name="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} data-testid="email" />
          {err('email')}
        </label>

        <label className="field">
          <span>{t('forms.password')} *</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            data-testid="password"
          />
          {form.password && (
            <span className={`strength strength--${strength}`} data-testid="password-strength" data-strength={strength}>
              {t('forms.strength', { level: t(`forms.strength.${strength}` as TranslationKey) })}
            </span>
          )}
          {err('password')}
        </label>

        <label className="field">
          <span>{t('forms.birthDate')}</span>
          <input
            name="birthDate"
            type="date"
            min="1900-01-01"
            max={new Date().toISOString().slice(0, 10)}
            value={form.birthDate}
            onChange={(e) => set('birthDate', e.target.value)}
            data-testid="birth-date"
          />
        </label>

        <label className="field">
          <span>{t('forms.postalCode')} *</span>
          <input
            name="postalCode"
            value={form.postalCode}
            placeholder={market.postalCode.example}
            onChange={(e) => set('postalCode', e.target.value)}
            data-testid="postal-code"
          />
          <span className="muted small">{t('forms.postalHint', { example: market.postalCode.example })}</span>
          {err('postalCode')}
        </label>

        <label className="field">
          <span>{t('forms.phone')}</span>
          <div className="input-group">
            <span className="input-group__prefix" data-testid="phone-prefix">
              {market.phonePrefix}
            </span>
            <input name="phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} data-testid="phone" />
          </div>
        </label>

        <fieldset className="field">
          <legend>{t('forms.gender')} *</legend>
          <div className="row">
            {(['female', 'male', 'other'] as const).map((g) => (
              <label key={g} className="check">
                <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={() => set('gender', g)} />
                {t(`forms.gender.${g}`)}
              </label>
            ))}
          </div>
          {err('gender')}
        </fieldset>

        <fieldset className="field">
          <legend>{t('forms.interests')}</legend>
          <div className="row">
            {(['sports', 'music', 'tech'] as const).map((i) => (
              <label key={i} className="check">
                <input type="checkbox" name="interests" value={i} checked={form.interests.includes(i)} onChange={() => toggleInterest(i)} />
                {t(`forms.interest.${i}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <CustomSelect
          label={t('forms.contact')}
          placeholder={t('forms.contact.placeholder')}
          value={form.contact}
          onChange={(v) => set('contact', v)}
          testId="contact-select"
          options={(['email', 'phone', 'post'] as const).map((c) => ({ value: c, label: t(`forms.contact.${c}`) }))}
        />

        <label className="field">
          <span data-testid="experience-label">{t('forms.experience', { years: form.experience })}</span>
          <input
            type="range"
            name="experience"
            min={0}
            max={30}
            step={1}
            value={form.experience}
            onChange={(e) => set('experience', Number(e.target.value))}
            data-testid="experience"
          />
        </label>

        <div className="field">
          <span id="newsletter-label">{t('forms.newsletter')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={form.newsletter}
            aria-labelledby="newsletter-label"
            className={form.newsletter ? 'switch switch--on' : 'switch'}
            onClick={() => set('newsletter', !form.newsletter)}
            data-testid="newsletter"
          >
            <span className="switch__thumb" />
          </button>
        </div>

        <label className="field">
          <span>{t('forms.cv')}</span>
          <input
            type="file"
            name="cv"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => set('cv', e.target.files?.[0]?.name ?? '')}
            data-testid="cv-upload"
          />
          <span className="muted small" data-testid="cv-name">
            {form.cv || t('forms.noFile')}
          </span>
        </label>

        {/* Intentionally no data-testid: locate it by its label. */}
        <label className="field field--wide">
          <span>{t('forms.comments')}</span>
          <textarea name="comments" rows={3} maxLength={500} value={form.comments} onChange={(e) => set('comments', e.target.value)} />
          <span className="muted small">{form.comments.length}/500</span>
        </label>

        <div className="field field--wide">
          <label className="check">
            <input type="checkbox" name="terms" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} data-testid="terms" />
            {t('forms.terms')} *
          </label>
          {err('terms')}
        </div>

        <div className="row field--wide">
          <button type="submit" className="btn" data-testid="submit">
            {t('forms.submit')}
          </button>
          <button type="reset" className="btn btn--ghost" data-testid="reset">
            {t('forms.reset')}
          </button>
        </div>
      </form>

      {result && (
        <div className="card" data-testid="form-success">
          <p className="alert alert--success" role="status">
            {t('forms.success')}
          </p>
          <pre data-testid="form-result">{result}</pre>
        </div>
      )}
    </section>
  );
}
