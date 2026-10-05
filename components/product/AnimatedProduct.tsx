'use client';

import { Pause, Play } from 'lucide-react';
import { useState } from 'react';

import styles from './AnimatedProduct.module.css';
import productStyles from './ProductVisual.module.css';

export default function AnimatedProduct() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className={`${styles.animatedProduct} ${isPaused ? styles.isPaused : ''}`}
    >
      <p className={styles.caption}>
        Ouvrez. Connectez. <span>Profitez.</span>
      </p>

      <div
        className={styles.animationStage}
        role="img"
        aria-label="Animation illustrative : le boîtier s’ouvre et les deux écouteurs s’élèvent doucement."
      >
        <div className={styles.glow} />

        <div className={styles.lid}>
          <span />
        </div>

        <div className={styles.well}>
          <i />
          <i />
        </div>

        <div
          className={`${productStyles.earbud} ${styles.animatedBud} ${styles.animatedLeft}`}
        >
          <div className={productStyles.budHead}>
            <i />
            <span />
          </div>

          <div className={productStyles.budStem}>
            <i />
          </div>
        </div>

        <div
          className={`${productStyles.earbud} ${styles.animatedBud} ${styles.animatedRight}`}
        >
          <div className={productStyles.budHead}>
            <i />
            <span />
          </div>

          <div className={productStyles.budStem}>
            <i />
          </div>
        </div>

        <div className={styles.body}>
          <i />
        </div>

        <div className={styles.shadow} />
      </div>

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setIsPaused((current) => !current)}
        aria-label={
          isPaused
            ? 'Reprendre l’animation produit'
            : 'Mettre l’animation produit en pause'
        }
        aria-pressed={isPaused}
      >
        {isPaused ? (
          <Play size={12} aria-hidden="true" />
        ) : (
          <Pause size={12} aria-hidden="true" />
        )}

        <span>{isPaused ? 'Reprendre' : 'Pause'}</span>
      </button>
    </div>
  );
}
