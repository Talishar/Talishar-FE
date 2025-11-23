import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './PlayerNoteModal.module.css';

interface PlayerNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  initialNote: string;
  playerName: string;
}

export default function PlayerNoteModal({
  isOpen,
  onClose,
  onSave,
  initialNote,
  playerName
}: PlayerNoteModalProps) {
  const [noteText, setNoteText] = useState(initialNote);

  useEffect(() => {
    setNoteText(initialNote);
  }, [initialNote]);

  const handleSave = () => {
    onSave(noteText);
    onClose();
  };

  const handleCancel = () => {
    setNoteText(initialNote);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Note for {playerName}</h2>
          <button 
            className={styles.closeButton}
            onClick={handleCancel}
            title="Close"
          >
            ✕
          </button>
        </div>

        <textarea
          className={styles.textarea}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a personal note about this opponent..."
          maxLength={200}
        />

        <div className={styles.charCount}>
          {noteText.length}/200
        </div>

        <div className={styles.footer}>
          <button
            className={styles.buttonCancel}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className={styles.buttonSave}
            onClick={handleSave}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
