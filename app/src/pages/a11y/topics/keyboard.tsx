import { useState, type KeyboardEvent } from 'react';
import type { LabTopic } from '../lab';

function TrapInput({ trap }: { trap: boolean }) {
  return (
    <label className="lab-field">
      Search the help center
      <input
        type="text"
        data-action
        onKeyDown={(e) => {
          // BROKEN: swallowing Tab keeps keyboard focus here forever
          if (trap && e.key === 'Tab') e.preventDefault();
        }}
      />
    </label>
  );
}

function Dropdown({ keyboard }: { keyboard: boolean }) {
  const options = ['Standard', 'Express', 'Pick-up'];
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);

  const onKeyDown = (e: KeyboardEvent) => {
    if (!keyboard) return; // BROKEN: only mouse clicks work
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((o) => !o);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setValue((v) => Math.min(options.length - 1, v + 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setValue((v) => Math.max(0, v - 1));
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="lab-dropdown">
      <span id={`dd-label-${keyboard}`}>Shipping method</span>
      <div
        role="combobox"
        tabIndex={0}
        aria-labelledby={`dd-label-${keyboard}`}
        aria-expanded={open}
        aria-controls={`dd-list-${keyboard}`}
        className="lab-dropdown__trigger"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        data-action
        data-value={options[value]}
      >
        {options[value]}
      </div>
      {open && (
        <ul role="listbox" id={`dd-list-${keyboard}`} aria-labelledby={`dd-label-${keyboard}`} className="lab-dropdown__list">
          {options.map((o, i) => (
            <li
              key={o}
              role="option"
              aria-selected={i === value}
              onClick={() => {
                setValue(i);
                setOpen(false);
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const keyboard: LabTopic = {
  slug: 'keyboard',
  title: 'Keyboard & focus',
  intro: 'Controls a keyboard cannot reach, focus that gets stuck, jumps around or is invisible.',
  examples: [
    {
      id: 'div-button',
      wcag: ['2.1.1', '4.1.2'],
      title: 'Clickable div',
      problem: 'A <div> with a click handler looks like a button, but cannot be reached or used with the keyboard.',
      fix: 'A real <button>.',
      Broken: () => (
        <div className="lab-btn" onClick={() => undefined} data-action>
          Add to wishlist
        </div>
      ),
      Fixed: () => (
        <button type="button" className="lab-btn" data-action>
          Add to wishlist
        </button>
      ),
    },
    {
      id: 'keyboard-trap',
      wcag: ['2.1.2'],
      title: 'Keyboard trap',
      problem: 'Once focus is in this field, Tab does nothing: keyboard users cannot leave.',
      fix: 'Tab moves on as usual.',
      Broken: () => <TrapInput trap />,
      Fixed: () => <TrapInput trap={false} />,
    },
    {
      id: 'focus-order',
      wcag: ['2.4.3'],
      title: 'Illogical focus order',
      problem: 'Positive tabindex values make focus jump: Step 3 → Step 1 → Step 2.',
      fix: 'No positive tabindex: focus follows the visual order.',
      Broken: () => (
        <div className="row">
          {[1, 2, 3].map((n) => (
            <button key={n} type="button" className="lab-btn" tabIndex={n === 1 ? 2 : n === 2 ? 3 : 1} data-action data-order={n}>
              Step {n}
            </button>
          ))}
        </div>
      ),
      Fixed: () => (
        <div className="row">
          {[1, 2, 3].map((n) => (
            <button key={n} type="button" className="lab-btn" data-action data-order={n}>
              Step {n}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'focus-not-visible',
      wcag: ['2.4.7'],
      title: 'Focus not visible',
      problem: 'outline: none removes the focus indicator — keyboard users cannot see where they are.',
      fix: 'A clear focus ring.',
      Broken: () => (
        <p className="row">
          <a href="#size-guide" className="lab-no-outline" data-action>
            Size guide
          </a>
          <a href="#care" className="lab-no-outline" data-action>
            Care instructions
          </a>
        </p>
      ),
      Fixed: () => (
        <p className="row">
          <a href="#size-guide" className="lab-focus-ok" data-action>
            Size guide
          </a>
          <a href="#care" className="lab-focus-ok" data-action>
            Care instructions
          </a>
        </p>
      ),
    },
    {
      id: 'dropdown-no-keyboard',
      wcag: ['2.1.1'],
      title: 'Custom dropdown without keyboard support',
      problem: 'The dropdown can be focused but ignores Enter and the arrow keys.',
      fix: 'Enter opens it, arrow keys change the value, Escape closes it.',
      Broken: () => <Dropdown keyboard={false} />,
      Fixed: () => <Dropdown keyboard />,
    },
    {
      id: 'broken-skip-link',
      wcag: ['2.4.1'],
      title: 'Skip link that goes nowhere',
      problem: '"Skip to results" points to #lab-results, but no element has that id — focus stays put.',
      fix: 'The target exists and can receive focus.',
      Broken: () => (
        <div>
          <a href="#lab-results" className="lab-skip" data-action>
            Skip to results
          </a>
          <div className="lab-filters">Filters …</div>
          <div className="lab-results">12 results</div>
        </div>
      ),
      Fixed: () => (
        <div>
          <a href="#lab-results" className="lab-skip" data-action>
            Skip to results
          </a>
          <div className="lab-filters">Filters …</div>
          <div id="lab-results" className="lab-results" tabIndex={-1}>
            12 results
          </div>
        </div>
      ),
    },
  ],
};
