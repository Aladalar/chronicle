import styles from "./Modal.module.css";

export default function Modal({ open, title, onClose, children, width = 560 }) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h3 className={styles.title}>{title}</h3>
          <button className={`btn-ghost ${styles.closeBtn}`} onClick={onClose} aria-label="Close">&#10005;</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
