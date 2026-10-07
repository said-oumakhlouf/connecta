import { SITE } from '@/data/site';
import styles from './BrandName.module.css';

/** Inline wordmark: follows the surrounding text size and color. */
export default function BrandName() {
  return <span className={styles.wordmark} role="img" aria-label={SITE.name} />;
}
