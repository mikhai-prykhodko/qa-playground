import type { ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMarket } from '../../context/MarketContext';
import { NotFoundPage } from '../NotFoundPage';
import { TOPICS } from './topics';

/**
 * Accessibility lab: pages with DELIBERATE accessibility defects (?mode=broken, the default)
 * and their corrected versions (?mode=fixed). The rest of the site stays accessible.
 *
 * Every example is a <section data-defect="…" data-wcag="…" data-mode="…">; the demo itself is
 * inside [data-demo]. Only the demos contain defects — the lab chrome around them is accessible,
 * so tests can scan a demo and expect exactly its defects (broken) or none (fixed).
 * English only, marked lang="en" like other untranslated content.
 */
export type Mode = 'broken' | 'fixed';

export interface LabExample {
  id: string;
  /** WCAG 2.2 success criteria, e.g. ["1.4.3"] */
  wcag: string[];
  title: string;
  /** What is wrong in the broken version */
  problem: string;
  /** What the fixed version does */
  fix: string;
  Broken: () => ReactNode;
  Fixed: () => ReactNode;
}

export interface LabTopic {
  slug: string;
  title: string;
  intro: string;
  examples: LabExample[];
}

function useMode(): Mode {
  const [params] = useSearchParams();
  return params.get('mode') === 'fixed' ? 'fixed' : 'broken';
}

function ModeSwitch({ slug, mode }: { slug: string; mode: Mode }) {
  const { to } = useMarket();
  return (
    <nav className="lab-modes" aria-label="Lab mode">
      {(['broken', 'fixed'] as const).map((m) => (
        <Link key={m} to={`${to(`a11y/${slug}`)}?mode=${m}`} className={m === mode ? 'chip chip--active' : 'chip'} aria-current={m === mode ? 'page' : undefined}>
          {m === 'broken' ? 'Broken version' : 'Fixed version'}
        </Link>
      ))}
    </nav>
  );
}

function Example({ example, mode }: { example: LabExample; mode: Mode }) {
  const Demo = mode === 'broken' ? example.Broken : example.Fixed;
  return (
    <section className="lab-example card" data-defect={example.id} data-wcag={example.wcag.join(' ')} data-mode={mode} aria-labelledby={`ex-${example.id}`}>
      <div className="lab-example__head">
        <h2 id={`ex-${example.id}`}>{example.title}</h2>
        <span className="lab-wcag">WCAG {example.wcag.join(', ')}</span>
      </div>
      <p className="lab-example__note">
        <strong>{mode === 'broken' ? 'Problem: ' : 'Fix: '}</strong>
        {mode === 'broken' ? example.problem : example.fix}
      </p>
      {/* a focusable starting point for keyboard tests, right before the demo */}
      <button type="button" className="lab-start">
        Start of example: {example.title}
      </button>
      <div className="lab-demo" data-demo>
        <Demo />
      </div>
    </section>
  );
}

export function A11yLabPage() {
  const { topic } = useParams();
  const mode = useMode();
  const data = TOPICS.find((t) => t.slug === topic);
  if (!data) return <NotFoundPage />;

  return (
    <article className="lab" lang="en" data-a11y-lab={data.slug} data-mode={mode}>
      <LabBreadcrumb title={data.title} />
      <h1 data-testid="page-title">Accessibility lab: {data.title}</h1>
      <p className="lead">{data.intro}</p>
      <ModeSwitch slug={data.slug} mode={mode} />
      <div className="lab-examples">
        {data.examples.map((e) => (
          <Example key={e.id} example={e} mode={mode} />
        ))}
      </div>
    </article>
  );
}

function LabBreadcrumb({ title }: { title?: string }) {
  const { to } = useMarket();
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol>
        <li>
          <Link to={to()}>Home</Link>
        </li>
        <li>{title ? <Link to={to('a11y')}>Accessibility lab</Link> : <span aria-current="page">Accessibility lab</span>}</li>
        {title && <li aria-current="page">{title}</li>}
      </ol>
    </nav>
  );
}

export function A11yLabOverview() {
  const { to } = useMarket();
  const count = TOPICS.reduce((n, t) => n + t.examples.length, 0);
  return (
    <article className="lab" lang="en" data-a11y-lab="overview">
      <LabBreadcrumb />
      <h1 data-testid="page-title">Accessibility lab</h1>
      <p className="lead">
        {count} common accessibility defects on {TOPICS.length} pages, each with a corrected version. The rest of the shop is built to pass
        WCAG 2.2 AA; these pages break it on purpose.
      </p>
      <ul className="grid lab-topics">
        {TOPICS.map((t) => (
          <li key={t.slug} className="card">
            <h2>{t.title}</h2>
            <p>{t.intro}</p>
            <p className="muted small">{t.examples.length} examples</p>
            <p className="row">
              <Link to={`${to(`a11y/${t.slug}`)}?mode=broken`}>{t.title}: broken version</Link>
              <Link to={`${to(`a11y/${t.slug}`)}?mode=fixed`}>{t.title}: fixed version</Link>
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}
