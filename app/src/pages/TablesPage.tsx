import { useMemo, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { generateOrders, type Order } from '../data/orders';
import type { TranslationKey } from '../i18n';
import { Icons } from '../components/icons';

type SortKey = keyof Order;
type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: TranslationKey }[] = [
  { key: 'id', label: 'tables.col.id' },
  { key: 'customer', label: 'tables.col.customer' },
  { key: 'city', label: 'tables.col.city' },
  { key: 'date', label: 'tables.col.date' },
  { key: 'amount', label: 'tables.col.amount' },
  { key: 'status', label: 'tables.col.status' },
];

export function TablesPage() {
  const { t, money, date, locale } = useMarket();
  const [orders, setOrders] = useState<Order[]>(() => generateOrders());
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'id', dir: 'asc' });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const rows = q ? orders.filter((o) => o.customer.toLowerCase().includes(q) || o.city.toLowerCase().includes(q)) : orders;
    const sorted = [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), locale);
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [orders, filter, sort, locale]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allVisibleSelected = visible.length > 0 && visible.every((o) => selected.has(o.id));
  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((o) => (allVisibleSelected ? next.delete(o.id) : next.add(o.id)));
      return next;
    });

  const remove = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <section>
      <h1 data-testid="page-title">{t('tables.title')}</h1>

      <div className="toolbar">
        <input
          type="search"
          className="toolbar__search"
          placeholder={t('tables.filter')}
          aria-label={t('tables.filter')}
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          data-testid="table-filter"
        />
        <span className="muted" data-testid="table-total">
          {t('tables.total', { count: filtered.length })}
        </span>
        <span className="muted" data-testid="table-selected">
          {t('tables.selected', { count: selected.size })}
        </span>
      </div>

      <div className="table-wrap">
        <table className="table" data-testid="orders-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" aria-label={t('tables.selectAll')} checked={allVisibleSelected} onChange={toggleAllVisible} data-testid="select-all" />
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  aria-sort={sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  data-testid={`col-${c.key}`}
                >
                  <button type="button" className="th-button" onClick={() => toggleSort(c.key)}>
                    {t(c.label)}
                    {sort.key === c.key && (sort.dir === 'asc' ? <Icons.sortAsc fontSize="inherit" /> : <Icons.sortDesc fontSize="inherit" />)}
                  </button>
                </th>
              ))}
              <th>{t('tables.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="center muted" data-testid="table-empty">
                  {t('tables.empty')}
                </td>
              </tr>
            ) : (
              visible.map((o) => (
                <tr key={o.id} data-testid="order-row" data-order-id={o.id} className={selected.has(o.id) ? 'is-selected' : ''}>
                  <td>
                    <input type="checkbox" aria-label={t('tables.selectRow', { id: o.id })} checked={selected.has(o.id)} onChange={() => toggleRow(o.id)} />
                  </td>
                  <td data-col="id" translate="no">
                    {o.id}
                  </td>
                  <td data-col="customer" translate="no">
                    {o.customer}
                  </td>
                  <td data-col="city" translate="no">
                    {o.city}
                  </td>
                  <td data-col="date" data-value={o.date}>
                    {date(o.date)}
                  </td>
                  <td data-col="amount" data-value={o.amount} className="num">
                    {money(o.amount)}
                  </td>
                  <td data-col="status" data-value={o.status}>
                    <span className={`status status--${o.status}`}>{t(`tables.status.${o.status}` as TranslationKey)}</span>
                  </td>
                  <td>
                    <button type="button" className="btn btn--small btn--danger" onClick={() => remove(o.id)} aria-label={`${t('tables.delete')} ${o.id}`}>
                      <Icons.delete fontSize="inherit" /> {t('tables.delete')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination" data-testid="pagination">
        <label className="inline-field">
          <span>{t('tables.rowsPerPage')}</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            data-testid="page-size"
          >
            {[5, 10, 25].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn--ghost" disabled={current <= 1} onClick={() => setPage(current - 1)} data-testid="page-prev">
          {t('tables.prev')}
        </button>
        <span data-testid="page-info">{t('tables.pageInfo', { page: current, pages })}</span>
        <button type="button" className="btn btn--ghost" disabled={current >= pages} onClick={() => setPage(current + 1)} data-testid="page-next">
          {t('tables.next')}
        </button>
      </div>
    </section>
  );
}
