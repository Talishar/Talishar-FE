import { useEffect, useId, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import {
  MODERATION_REASONS,
  MODERATION_REASON_LABEL_KEYS,
  ModerationReason
} from 'interface/API/ModerationAPI';
import styles from './ReasonNoteModal.module.css';

interface ReasonNoteModalProps {
  isOpen: boolean;
  title: string;
  intro: string;
  privacy: string;
  confirmLabel: string;
  noteMaxLength: number;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: (reason: ModerationReason | null, note: string) => void;
}

export default function ReasonNoteModal({
  isOpen,
  title,
  intro,
  privacy,
  confirmLabel,
  noteMaxLength,
  isSubmitting = false,
  onCancel,
  onConfirm
}: ReasonNoteModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ModerationReason | null>(null);
  const [note, setNote] = useState('');
  const reasonLabelId = useId();
  const noteId = useId();

  useEffect(() => {
    if (isOpen) {
      setReason(null);
      setNote('');
    }
  }, [isOpen]);

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={title}
      confirmLabel={confirmLabel}
      cancelLabel={t('MODERATION_NOTE.CANCEL')}
      confirmDisabled={isSubmitting}
      onCancel={onCancel}
      onConfirm={() => onConfirm(reason, note.trim())}
    >
      <p>{intro}</p>
      <div className={styles.label} id={reasonLabelId}>
        {t('MODERATION_NOTE.REASON_LABEL')}
      </div>
      <div
        className={styles.reasons}
        role="radiogroup"
        aria-labelledby={reasonLabelId}
      >
        {MODERATION_REASONS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={reason === value}
            className={classNames(styles.reason, {
              [styles.reasonSelected]: reason === value
            })}
            onClick={() => setReason(reason === value ? null : value)}
          >
            {t(MODERATION_REASON_LABEL_KEYS[value])}
          </button>
        ))}
      </div>
      <label className={styles.label} htmlFor={noteId}>
        {t('MODERATION_NOTE.NOTE_LABEL')}
      </label>
      <textarea
        id={noteId}
        className={styles.textarea}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('MODERATION_NOTE.NOTE_PLACEHOLDER')}
        maxLength={noteMaxLength}
        rows={3}
      />
      <div className={styles.footnote}>
        <span>{privacy}</span>
        <span aria-live="polite">
          {note.length}/{noteMaxLength}
        </span>
      </div>
    </ConfirmModal>
  );
}
