import { useEffect, useId, useRef, useState } from 'react';
import { Icons } from './icons';

export interface Option {
  value: string;
  label: string;
}

/**
 * A div-based dropdown (not a native <select>) — like the ones UI libraries ship.
 * Tests cannot use selectOption() here; they must click the trigger and an option.
 * Accessible via ARIA: role=combobox / listbox / option.
 */
export function CustomSelect({
  label,
  options,
  value,
  placeholder,
  onChange,
  testId,
}: {
  label: string;
  options: Option[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  testId: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const labelId = useId();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="field" ref={ref}>
      <span id={labelId}>{label}</span>
      <div className="custom-select" data-testid={testId}>
        <div
          role="combobox"
          tabIndex={0}
          aria-labelledby={labelId}
          aria-expanded={open}
          aria-controls={listId}
          className="custom-select__trigger"
          data-testid={`${testId}-trigger`}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen((o) => !o);
            }
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          {selected ? selected.label : <span className="muted">{placeholder}</span>}
          <Icons.expand fontSize="small" className={open ? 'rotate-180' : undefined} />
        </div>
        {open && (
          <ul role="listbox" id={listId} className="custom-select__list" aria-labelledby={labelId}>
            {options.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className="custom-select__option"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
