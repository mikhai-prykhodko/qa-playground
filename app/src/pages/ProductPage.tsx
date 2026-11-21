import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useCart } from '../context/CartContext';
import {
  averageRating,
  isSoldIn,
  priceIn,
  stockStatus,
  useProducts,
  type ColorId,
  type ColorOption,
  type Product,
  type Review,
  type ReviewReply,
  type VariantOption,
} from '../data/products';
import type { TranslationKey } from '../i18n';
import { trackEcommerce } from '../analytics';
import { Icons, productIcon } from '../components/icons';
import { Rating } from '../components/Rating';
import { QuantityStepper } from '../components/QuantityStepper';
import { ProductCard } from '../components/ProductCard';

export function ProductPage() {
  const { productId = '' } = useParams();
  const { market, t, to } = useMarket();
  const { state } = useProducts();

  if (state.status === 'loading') {
    return (
      <section aria-busy="true" data-testid="product-loading">
        <div className="card skeleton" />
      </section>
    );
  }

  const products = state.status === 'ready' ? state.products : [];
  const product = products.find((p) => p.id === productId);

  if (!product || !isSoldIn(product, market)) {
    return (
      <section className="center card empty-state" data-testid="product-not-found">
        <h1 data-testid="page-title">{t('product.notFound')}</h1>
        <p>{t('product.notFoundText', { id: productId })}</p>
        <Link to={to('shop')} className="btn">
          {t('product.backToShop')}
        </Link>
      </section>
    );
  }

  return <ProductDetails key={product.id} product={product} related={products} />;
}

function ProductDetails({ product, related }: { product: Product; related: Product[] }) {
  const { market, lang, t, money, to } = useMarket();
  const { price, regular, discount } = priceIn(product, market);
  const name = product.name[lang];

  useEffect(() => {
    trackEcommerce('view_item', market.currency, [
      { item_id: product.id, item_name: name, item_category: product.category, price, quantity: 1, discount: discount ? regular - price : undefined },
    ]);
  }, [product.id, name, price, regular, discount, product.category, market.currency]);

  const others = related.filter((p) => p.id !== product.id && isSoldIn(p, market));
  const recommendations = [...others.filter((p) => p.category === product.category), ...others.filter((p) => p.category !== product.category)].slice(0, 4);

  return (
    <article className="product-page" data-testid="product-page" data-product-id={product.id}>
      <nav aria-label={t('product.breadcrumb')} className="breadcrumb" data-testid="breadcrumb">
        <ol>
          <li>
            <Link to={to()}>{t('nav.home')}</Link>
          </li>
          <li>
            <Link to={to('shop')}>{t('nav.shop')}</Link>
          </li>
          <li>
            <Link to={`${to('shop')}?category=${product.category}`}>{t(`category.${product.category}` as TranslationKey)}</Link>
          </li>
          <li aria-current="page">{name}</li>
        </ol>
      </nav>

      <div className="product-page__top">
        <Gallery product={product} />
        <BuyBox product={product} />
      </div>

      <ProductTabs product={product} />

      {recommendations.length > 0 && (
        <section className="related" aria-labelledby="related-title" data-testid="related-products">
          <h2 id="related-title">{t('product.related')}</h2>
          <div className="grid product-grid">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} list="related" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- Gallery */

const VIEWS = ['front', 'side', 'detail'] as const;

function Gallery({ product }: { product: Product }) {
  const { lang, t } = useMarket();
  const [active, setActive] = useState(0);
  const Icon = productIcon(product.icon);
  const view = t(`product.view.${VIEWS[active]}` as TranslationKey);
  const src = product.image ? `${import.meta.env.BASE_URL}${product.image}` : null;
  return (
    <section className="gallery" aria-label={t('product.gallery')} data-testid="gallery">
      <figure className={`gallery__main gallery__main--${VIEWS[active]}`} data-testid="gallery-main" data-image={active}>
        {src ? <img src={src} alt={`${product.name[lang]} – ${view}`} width={400} height={300} /> : <Icon fontSize="inherit" />}
        <figcaption className="gallery__caption small">{view}</figcaption>
      </figure>
      <div className="gallery__thumbs">
        {VIEWS.map((v, i) => (
          <button
            key={v}
            type="button"
            className={`gallery__thumb gallery__thumb--${v}`}
            aria-label={t('product.image', { n: i + 1, total: VIEWS.length })}
            aria-current={i === active}
            onClick={() => setActive(i)}
            data-testid="gallery-thumb"
          >
            {src ? <img src={src} alt="" width={72} height={54} /> : <Icon fontSize="inherit" />}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Buy box */

function BuyBox({ product }: { product: Product }) {
  const { market, lang, t, money } = useMarket();
  const { add } = useCart();
  const { price, regular, discount } = priceIn(product, market);
  const stock = stockStatus(product);
  const sizes = product.variants?.sizes ?? [];
  const colors = product.variants?.colors ?? [];
  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<ColorId>();
  const [qty, setQty] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [added, setAdded] = useState(0);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(0), 2500);
    return () => clearTimeout(id);
  }, [added]);

  const addToCart = () => {
    const missing: string[] = [];
    if (sizes.length && !size) missing.push(t('product.selectSize'));
    if (colors.length && !color) missing.push(t('product.selectColor'));
    setErrors(missing);
    if (missing.length) return;
    add({ productId: product.id, name: product.name[lang], category: product.category, price, variant: { size, color } }, qty);
    setAdded((n) => n + 1);
  };

  return (
    <section className="buy-box card" aria-labelledby="product-title" data-testid="buy-box">
      <div className="product__badges" data-testid="product-badges">
        {product.isNew && (
          <span className="badge-chip badge-chip--new" data-testid="product-badge" data-badge="new">
            {t('badge.new')}
          </span>
        )}
        {discount > 0 && (
          <span className="badge-chip badge-chip--sale" data-testid="product-badge" data-badge="sale">
            {t('badge.sale', { percent: discount })}
          </span>
        )}
      </div>

      <h1 id="product-title" data-testid="page-title">
        {product.name[lang]}
      </h1>
      <a href="#reviews" className="buy-box__rating">
        <Rating value={averageRating(product)} count={product.reviews.length} />
      </a>

      <p className="buy-box__price">
        <span className="price-lg" data-testid="product-price" data-amount={price} data-currency={market.currency}>
          {money(price)}
        </span>
        {discount > 0 && (
          <s className="muted" data-testid="product-regular-price" data-amount={regular} aria-label={t('product.regularPrice', { price: money(regular) })}>
            {money(regular)}
          </s>
        )}
      </p>

      <p className={`stock stock--${stock}`} data-testid="product-stock" data-stock={stock}>
        {stock === 'out' ? t('product.outOfStock') : stock === 'low' ? t('product.lowStock', { count: product.stock }) : t('product.inStock')}
      </p>

      {sizes.length > 0 && (
        <OptionGroup
          name="size"
          label={t('product.size')}
          options={sizes}
          value={size}
          onChange={setSize}
          render={(o) => <span>{o.id}</span>}
          ariaLabel={(o) => (o.available ? o.id : t('product.unavailable', { option: o.id }))}
        />
      )}

      {colors.length > 0 && (
        <OptionGroup<ColorId>
          name="color"
          label={t('product.color')}
          options={colors}
          value={color}
          onChange={setColor}
          render={(o) => <span className="swatch__dot" style={{ background: (o as ColorOption).hex }} />}
          ariaLabel={(o) => {
            const label = t(`color.${o.id}` as TranslationKey);
            return o.available ? label : t('product.unavailable', { option: label });
          }}
          swatches
        />
      )}

      <div className="buy-box__actions">
        <QuantityStepper value={qty} min={1} max={Math.max(1, Math.min(99, product.stock))} onChange={setQty} />
        <button type="button" className="btn" disabled={stock === 'out'} onClick={addToCart} data-testid="add-to-cart">
          {stock === 'out' ? (
            t('shop.outOfStock')
          ) : (
            <>
              <Icons.cart fontSize="small" /> {t('shop.add')}
            </>
          )}
        </button>
      </div>

      {errors.length > 0 && (
        <ul className="field__error buy-box__errors" role="alert" data-testid="variant-error">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      {added > 0 && (
        <div className="toast" role="status" data-testid="added-toast" key={added}>
          <Icons.success fontSize="small" /> {t('shop.added')}: {product.name[lang]}
        </div>
      )}
    </section>
  );
}

/**
 * ARIA radio group (role="radiogroup" / role="radio"): arrow keys move between options,
 * unavailable options are focusable but aria-disabled — a pattern tests must handle.
 */
function OptionGroup<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  render,
  ariaLabel,
  swatches = false,
}: {
  name: string;
  label: string;
  options: VariantOption<T>[];
  value?: T;
  onChange: (v: T) => void;
  render: (o: VariantOption<T>) => JSX.Element;
  ariaLabel: (o: VariantOption<T>) => string;
  swatches?: boolean;
}) {
  const { t } = useMarket();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.id === value);

  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    refs.current[(i + dir + options.length) % options.length]?.focus();
  };

  const selected = options[selectedIndex];
  return (
    <div className="option-group" data-testid="option-group" data-option={name}>
      <span className="option-group__label" id={`${name}-label`}>
        {label}
        {selected && (
          <strong className="option-group__value" data-testid="option-selected">
            : {swatches ? t(`color.${selected.id}` as TranslationKey) : selected.id}
          </strong>
        )}
      </span>
      <div role="radiogroup" aria-labelledby={`${name}-label`} className={swatches ? 'swatches' : 'chips'}>
        {options.map((o, i) => (
          <button
            key={o.id}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={o.id === value}
            aria-disabled={!o.available}
            aria-label={ariaLabel(o)}
            tabIndex={o.id === value || (selectedIndex === -1 && i === 0) ? 0 : -1}
            className={`${swatches ? 'swatch' : 'chip'} ${o.id === value ? 'is-selected' : ''} ${o.available ? '' : 'is-unavailable'}`}
            onClick={() => o.available && onChange(o.id)}
            onKeyDown={(e) => onKey(e, i)}
            data-testid="option"
            data-value={o.id}
            data-available={o.available}
          >
            {render(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Tabs */

type TabId = 'description' | 'specs' | 'reviews';

function ProductTabs({ product }: { product: Product }) {
  const { lang, t } = useMarket();
  const [active, setActive] = useState<TabId>(() => (window.location.hash === '#reviews' ? 'reviews' : 'description'));
  const tabs: { id: TabId; label: string }[] = [
    { id: 'description', label: t('product.tab.description') },
    { id: 'specs', label: t('product.tab.specs') },
    { id: 'reviews', label: t('product.tab.reviews', { count: product.reviews.length }) },
  ];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const onHash = () => window.location.hash === '#reviews' && setActive('reviews');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // WAI-ARIA tabs pattern: arrow keys move focus and select, Home/End jump
  const onKey = (e: KeyboardEvent, i: number) => {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = (map[e.key] + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <section className="tabs card" id="reviews" data-testid="product-tabs">
      <div role="tablist" aria-label={product.name[lang]} className="tabs__list">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className="tabs__tab"
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => onKey(e, i)}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* All panels stay in the DOM; inactive ones are hidden — visible vs attached matters in tests. */}
      <div role="tabpanel" id="panel-description" aria-labelledby="tab-description" hidden={active !== 'description'} className="tabs__panel">
        <p data-testid="product-description">{product.description[lang]}</p>
      </div>
      <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" hidden={active !== 'specs'} className="tabs__panel">
        <SpecsTable product={product} />
      </div>
      <div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews" hidden={active !== 'reviews'} className="tabs__panel">
        <ReviewList reviews={product.reviews} />
      </div>
    </section>
  );
}

function SpecsTable({ product }: { product: Product }) {
  const { t } = useMarket();
  return (
    <table className="specs" data-testid="specs-table">
      <tbody>
        {product.specs.map((s) => (
          <tr key={s.key} data-spec={s.key}>
            <th scope="row">{t(`spec.${s.key}` as TranslationKey)}</th>
            <td>{s.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------------------------------------------------------------- Reviews */

function ReviewList({ reviews }: { reviews: Review[] }) {
  const { t } = useMarket();
  if (reviews.length === 0) return <p className="muted" data-testid="no-reviews">{t('product.noReviews')}</p>;
  return (
    <ol className="reviews" data-testid="review-list">
      {reviews.map((r) => (
        <li key={r.id}>
          <ReviewCard review={r} />
        </li>
      ))}
    </ol>
  );
}

/**
 * A review and its replies use the SAME component and test id (review-card), so a
 * reply is a review-card inside a review-card: `getByTestId('review-card')` matches both levels.
 */
function ReviewCard({ review, isReply = false }: { review: Review | ReviewReply; isReply?: boolean }) {
  const { t, date } = useMarket();
  const full = 'rating' in review ? review : null;
  const [helpful, setHelpful] = useState(full?.helpful ?? 0);
  const [voted, setVoted] = useState(false);

  return (
    <article className={isReply ? 'review review--reply' : 'review'} data-testid="review-card" data-review-id={review.id} aria-label={review.author}>
      <header className="review__header">
        <strong data-testid="review-author">{review.author}</strong>
        {'staff' in review && review.staff && (
          <span className="badge-chip badge-chip--staff" data-testid="review-staff">
            <Icons.verified fontSize="inherit" /> {t('review.staff')}
          </span>
        )}
        {full && <Rating value={full.rating} />}
        <time className="muted small" dateTime={review.date} data-testid="review-date">
          {date(review.date)}
        </time>
      </header>
      <p data-testid="review-text">{review.text}</p>

      {full && (
        <>
          <button
            type="button"
            className="btn btn--small btn--ghost"
            aria-pressed={voted}
            onClick={() => {
              setHelpful((n) => (voted ? n - 1 : n + 1));
              setVoted((v) => !v);
            }}
            data-testid="helpful-button"
          >
            <Icons.thumbUp fontSize="inherit" /> {t('review.helpful', { count: helpful })}
          </button>

          {full.replies.length > 0 && (
            <section className="review__replies" aria-label={t('review.replies', { count: full.replies.length })} data-testid="review-replies">
              {full.replies.map((reply) => (
                <ReviewCard key={reply.id} review={reply} isReply />
              ))}
            </section>
          )}
        </>
      )}
    </article>
  );
}
