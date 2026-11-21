import { useMarket } from '../context/MarketContext';
import { Icons } from './icons';

/**
 * − [ 2 ] +  control. Reused on the product page, in the mini-cart and on the cart page,
 * so the same test ids appear in several containers and tests must scope by container.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  const { t } = useMarket();
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="stepper" role="group" aria-label={label ?? t('product.quantity')} data-testid="quantity-stepper">
      <button
        type="button"
        className="stepper__btn"
        aria-label={t('product.decrease')}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        data-testid="quantity-decrease"
      >
        <Icons.minus fontSize="inherit" />
      </button>
      <input
        className="stepper__input"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={t('product.quantity')}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        data-testid="quantity-input"
      />
      <button
        type="button"
        className="stepper__btn"
        aria-label={t('product.increase')}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        data-testid="quantity-increase"
      >
        <Icons.plus fontSize="inherit" />
      </button>
    </div>
  );
}
