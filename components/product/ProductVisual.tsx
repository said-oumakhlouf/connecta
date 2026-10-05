import styles from './ProductVisual.module.css';
import { PRODUCTS } from '@/data/products';

const product = PRODUCTS.ew75;

type ProductVariant = 'hero' | 'case' | 'buds' | 'duo';

type ProductVisualProps = {
  variant?: ProductVariant;
  compact?: boolean;
};

type EarbudProps = {
  side: 'left' | 'right';
};

type ChargingCaseProps = {
  secondary?: boolean;
};

function Earbud({ side }: EarbudProps) {
  return (
    <div
      className={`${styles.earbud} ${
        side === 'left' ? styles.budLeft : styles.budRight
      }`}
    >
      <div className={styles.budHead}>
        <i />
        <span />
      </div>

      <div className={styles.budStem}>
        <i />
      </div>
    </div>
  );
}

function ChargingCase({ secondary = false }: ChargingCaseProps) {
  return (
    <div className={`${styles.case} ${secondary ? styles.secondCase : ''}`}>
      <span className={styles.caseSeam} />
      <i />
    </div>
  );
}

export default function ProductVisual({
  variant = 'hero',
  compact = false,
}: ProductVisualProps) {
  const showEarbuds = variant !== 'case';
  const showMainCase = variant !== 'buds';
  const showSecondCase = variant === 'duo';

  const classNames = [
    styles.productVisual,
    variant === 'duo' ? styles.duo : '',
    compact ? styles.compact : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      role="img"
      aria-label={`Illustration des ${product.name} en ${product.color.toLowerCase()} avec leur boîtier de recharge.`}
    >
      <div className={styles.productHalo} />

      {showSecondCase && <ChargingCase secondary />}

      {showEarbuds && (
        <>
          <Earbud side="left" />
          <Earbud side="right" />
        </>
      )}

      {showMainCase && <ChargingCase />}

      <div className={styles.productShadow} />
    </div>
  );
}
