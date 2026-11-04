import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import { useSetReplayNoteMutation } from 'features/api/apiSlice';
import { SAVE_NOTE_MAX_LENGTH } from 'interface/API/GetSavedReplays.php';
import styles from 'components/ReasonNoteModal/ReasonNoteModal.module.css';

interface SaveNoteModalProps {
  replayNumber: number | null;
  title: string;
  intro: React.ReactNode;
  initialNote?: string;
  cancelLabel: string;
  onClose: () => void;
}

export default function SaveNoteModal({
  replayNumber,
  title,
  intro,
  initialNote = '',
  cancelLabel,
  onClose
}: SaveNoteModalProps) {
  const { t } = useTranslation();
  const [note, setNote] = useState(initialNote);
  const [openedFor, setOpenedFor] = useState<number | null>(null);
  const [setReplayNote, { isLoading }] = useSetReplayNoteMutation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteId = useId();
  const isOpen = replayNumber !== null;

  if (replayNumber !== openedFor) {
    setOpenedFor(replayNumber);
    setNote(initialNote);
  }

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!isOpen || !textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [isOpen]);

  const trimmedNote = note.trim();
  const unchanged = trimmedNote === initialNote.trim();

  const saveNote = async () => {
    if (replayNumber === null || unchanged || isLoading) return;
    try {
      const result = await setReplayNote({
        replayNumber,
        note: trimmedNote
      }).unwrap();
      if (!result.success) throw new Error(result.error);
      toast.success(t(trimmedNote ? 'SAVE_NOTE.SAVED' : 'SAVE_NOTE.REMOVED'));
      onClose();
    } catch (error) {
      const apiError = error as { data?: { error?: string } };
      toast.error(apiError.data?.error || t('SAVE_NOTE.ERROR'));
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={title}
      confirmLabel={t('SAVE_NOTE.SAVE')}
      cancelLabel={cancelLabel}
      confirmDisabled={isLoading || unchanged}
      onCancel={onClose}
      onConfirm={saveNote}
    >
      <p>{intro}</p>
      <label className={styles.label} htmlFor={noteId}>
        {t('SAVE_NOTE.LABEL')}
      </label>
      <textarea
        ref={textareaRef}
        id={noteId}
        className={styles.textarea}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            saveNote();
          }
        }}
        placeholder={t('SAVE_NOTE.PLACEHOLDER')}
        maxLength={SAVE_NOTE_MAX_LENGTH}
        rows={5}
      />
      <div className={styles.footnote}>
        <span>{t('SAVE_NOTE.PRIVACY')}</span>
        <span aria-live="polite">
          {note.length}/{SAVE_NOTE_MAX_LENGTH}
        </span>
      </div>
    </ConfirmModal>
  );
}
