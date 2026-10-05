import styles from './LogoMark.module.css';

export default function LogoMark() {
  return (
    <span className={styles.mark} aria-hidden="true">
      <span className={styles.arrow}>↗</span>

      <span className={`${styles.signal} ${styles.signalOne}`} />
      <span className={`${styles.signal} ${styles.signalTwo}`} />
    </span>
  );
}
