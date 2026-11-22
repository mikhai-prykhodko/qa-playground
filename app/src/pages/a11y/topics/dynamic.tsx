import { useEffect, useState } from 'react';
import type { LabTopic } from '../lab';

function SaveStatus({ announced }: { announced: boolean }) {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <button type="button" className="lab-btn" onClick={() => setSaved(true)} data-action>
        Save address
      </button>
      {announced ? (
        <p role="status" className="lab-status">
          {saved ? <span data-message>Address saved</span> : null}
        </p>
      ) : (
        saved && (
          <p className="lab-status">
            <span data-message>Address saved</span>
          </p>
        )
      )}
    </div>
  );
}

const SLIDES = ['Free shipping from CHF 100', 'New: merino beanies', 'Autumn sale: −20%'];

function Carousel({ pausable }: { pausable: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 2000);
    return () => clearInterval(id);
  }, [paused]);
  return (
    <div className="lab-carousel" aria-roledescription="carousel" aria-label="Promotions">
      <p className="lab-carousel__slide" data-slide={index}>
        {SLIDES[index]}
      </p>
      {pausable && (
        <button type="button" className="lab-btn" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? 'Play' : 'Pause'} promotions
        </button>
      )}
    </div>
  );
}

function SessionTimeout({ warns }: { warns: boolean }) {
  const [phase, setPhase] = useState<'active' | 'warning' | 'expired'>('active');
  const [draft, setDraft] = useState('Bahnhofstrasse 1');
  const [round, setRound] = useState(0);
  useEffect(() => {
    const warn = warns ? setTimeout(() => setPhase('warning'), 20_000) : undefined;
    const expire = setTimeout(() => {
      setPhase('expired');
      setDraft('');
    }, 30_000);
    return () => {
      clearTimeout(warn);
      clearTimeout(expire);
    };
  }, [warns, round]);
  return (
    <div>
      <label className="lab-field">
        Delivery address
        <input value={draft} onChange={(e) => setDraft(e.target.value)} data-field />
      </label>
      {phase === 'warning' && (
        <div role="alertdialog" aria-labelledby="lab-timeout-title" className="lab-timeout">
          <p id="lab-timeout-title">Your session expires in 10 seconds.</p>
          <button
            type="button"
            className="lab-btn"
            onClick={() => {
              setPhase('active');
              setRound((r) => r + 1);
            }}
          >
            Extend session
          </button>
        </div>
      )}
      {phase === 'expired' && <p className="lab-status">Session expired. Your input was cleared.</p>}
    </div>
  );
}

export const dynamic: LabTopic = {
  slug: 'dynamic',
  title: 'Dynamic content',
  intro: 'Messages nobody hears, content that moves on its own, and time limits without warning.',
  examples: [
    {
      id: 'status-not-announced',
      wcag: ['4.1.3'],
      title: 'Status message not announced',
      problem: '"Address saved" appears on screen, but outside a live region — screen readers stay silent.',
      fix: 'The message appears inside role="status".',
      Broken: () => <SaveStatus announced={false} />,
      Fixed: () => <SaveStatus announced />,
    },
    {
      id: 'carousel-no-pause',
      wcag: ['2.2.2'],
      title: 'Auto-rotating carousel without pause',
      problem: 'Slides change every 2 seconds and cannot be stopped.',
      fix: 'A pause button.',
      Broken: () => <Carousel pausable={false} />,
      Fixed: () => <Carousel pausable />,
    },
    {
      id: 'ignores-reduced-motion',
      wcag: ['2.3.3'],
      title: 'Animation ignores "reduce motion"',
      problem: 'A bouncing badge keeps animating even when the user asked the system to reduce motion.',
      fix: 'The animation stops under prefers-reduced-motion.',
      Broken: () => <span className="lab-bounce">New</span>,
      Fixed: () => <span className="lab-bounce lab-bounce--respectful">New</span>,
    },
    {
      id: 'timeout-without-warning',
      wcag: ['2.2.1'],
      title: 'Time limit without warning',
      problem: 'After 30 seconds the form is silently cleared.',
      fix: 'A warning after 20 seconds with an "Extend session" button.',
      Broken: () => <SessionTimeout warns={false} />,
      Fixed: () => <SessionTimeout warns />,
    },
  ],
};
