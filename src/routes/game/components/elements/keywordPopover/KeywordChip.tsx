import KeywordPopover from './KeywordPopover';
import styles from './KeywordPopover.module.css';

export default function KeywordChip({ id, label }: { id: string; label?: string }) {
  return <KeywordPopover id={id}><button type="button" className={styles.chip}>{label ?? id}</button></KeywordPopover>;
}
