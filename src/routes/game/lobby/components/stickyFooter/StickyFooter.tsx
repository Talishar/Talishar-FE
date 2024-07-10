import React from 'react';
import { useFormikContext } from 'formik';
import { FaExclamationCircle } from 'react-icons/fa';
import { DeckResponse } from 'interface/API/GetLobbyInfo.php';
import styles from './StickyFooter.module.css';
import classNames from 'classnames';
import { HiClipboardCopy } from 'react-icons/hi';

export type DeckSize = {
  deckSize: number;
  submitSideboard: boolean;
  isWidescreen: boolean;
  handleLeave: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const StickyFooter = ({
  deckSize,
  submitSideboard,
  isWidescreen,
  handleLeave
}: DeckSize) => {
  const { errors, values, isValid } = useFormikContext<DeckResponse>();
  let errorArray = [] as string[];
  for (const [key, value] of Object.entries(errors)) {
    errorArray.push(String(value));
  }

  const handleClipboardCopy = () => {
    navigator.clipboard.writeText(
      window.location.href.replace('lobby', 'join')
    );
  };

  const dynamicContainer = classNames(styles.dynamicContainer, 'container');
  const leaveLobby = classNames(styles.buttonClassLeave, 'outline secondary');

  return (
    <div className={styles.stickyFooter}>
      <div className={dynamicContainer}>
        <div className={styles.footerStart}>Copy invite link</div>
        <div className={styles.clipboardButtonHolder}>
          <button
            className={styles.buttonClass}
            onClick={handleClipboardCopy}
            type="button"
          >
            <div className={styles.icon}>
              <HiClipboardCopy />
            </div>
          </button>
        </div>
        <div className={styles.footerAlarm}>
          {!isValid && (
            <div className={styles.alarm}>
              <FaExclamationCircle /> {errorArray[0]}
            </div>
          )}
        </div>
        <div className={styles.footerContent}>
          <div>
            Deck {values.deck.length}/{deckSize}
          </div>
        </div>
        <div className={styles.buttonHolder}>
          <button
            className={styles.buttonClass}
            type="submit"
            disabled={!errors || !submitSideboard}
            data-tooltip="Once submitted you can't change your deck!"
            data-placement="right"
          >
            Submit Deck
          </button>
          {isWidescreen && (
            <button className={leaveLobby} onClick={handleLeave}>
              Leave
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyFooter;
