import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { fetchProducts, isSoldIn, priceIn, type Product } from '../data/products';

let catalogPromise: Promise<Product[]> | null = null;
const loadCatalog = () => (catalogPromise ??= fetchProducts().catch((e) => ((catalogPromise = null), Promise.reject(e))));

/**
 * Header search: an ARIA combobox with a listbox of suggestions (WAI-ARIA 1.2 pattern).
 * Deliberately NO data-testid — tests find it by role, label and placeholder, like on most real sites.
 */
export function SearchBox() {
  const { market, lang, t, money, to } = useMarket();
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const boxRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250); // debounce typing
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => boxRef.current && !boxRef.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const suggestions = useMemo(() => {
    if (debounced.length < 2) return [];
    const q = debounced.toLowerCase();
    return catalog.filter((p) => isSoldIn(p, market) && p.name[lang].toLowerCase().includes(q)).slice(0, 5);
  }, [debounced, catalog, market, lang]);

  useEffect(() => setActive(-1), [debounced]);

  const goTo = (product: Product) => {
    setOpen(false);
    setQuery('');
    navigate(to(`shop/${product.id}`));
  };

  const submit = () => {
    if (active >= 0 && suggestions[active]) return goTo(suggestions[active]);
    if (!query.trim()) return;
    setOpen(false);
    navigate(`${to('shop')}?q=${encodeURIComponent(query.trim())}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(suggestions.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  const showList = open && debounced.length >= 2;

  return (
    <form
      ref={boxRef}
      role="search"
      aria-label={t('search.label')}
      className="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        type="search"
        className="search__input"
        placeholder={t('search.placeholder')}
        aria-label={t('search.label')}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        value={query}
        onFocus={() => {
          setOpen(true);
          loadCatalog().then(setCatalog, () => setCatalog([]));
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {showList && (
        <ul id={listId} role="listbox" aria-label={t('search.suggestions')} className="search__list">
          {suggestions.length === 0 ? (
            <li role="presentation" className="search__empty muted small">
              {t('search.noResults', { q: debounced })}
            </li>
          ) : (
            suggestions.map((p, i) => (
              <li
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? 'search__option is-active' : 'search__option'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goTo(p)}
              >
                <span translate="no">{p.name[lang]}</span>
                <span className="muted small">{money(priceIn(p, market).price)}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </form>
  );
}
