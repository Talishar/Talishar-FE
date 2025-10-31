import React, { useState, useRef, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { FaExclamationCircle } from 'react-icons/fa';
import { DeckResponse } from 'interface/API/GetLobbyInfo.php';
import styles from './StickyFooter.module.css';
import classNames from 'classnames';
import { HiClipboardCopy } from 'react-icons/hi';
import { MdGames } from 'react-icons/md';

export type DeckSize = {
  deckSize: number;
  submitSideboard: boolean;
  isWidescreen: boolean;
  handleLeave: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onSendInviteClick?: () => void;
};

const StickyFooter = ({
  deckSize,
  submitSideboard,
  isWidescreen,
  handleLeave,
  onSendInviteClick
}: DeckSize) => {
  const { errors, values, isValid } = useFormikContext<DeckResponse>();
  const footerRef = useRef<HTMLDivElement>(null);
  let errorArray = [] as string[];
  for (const [key, value] of Object.entries(errors)) {
    errorArray.push(String(value));
  }

  const [sideboardSubmitted, setSideboardSubmitted] = useState(false);

  // Update CSS custom property with footer height
  useEffect(() => {
    const updateFooterHeight = () => {
      if (footerRef.current) {
        const height = footerRef.current.offsetHeight;
        if (height > 0) {
          document.documentElement.style.setProperty('--sticky-footer-height', `${height}px`);
        }
      }
    };

    // Initial update
    updateFooterHeight();
    
    // Small delay to ensure DOM is fully rendered on mobile
    const timer = setTimeout(updateFooterHeight, 100);
    
    window.addEventListener('resize', updateFooterHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateFooterHeight);
    };
  }, []);

  const handleClipboardCopy = () => {
    navigator.clipboard.writeText(
      window.location.href.replace('lobby', 'join')
    );
  };

  const dynamicContainer = classNames(styles.dynamicContainer, 'container');
  const leaveLobby = classNames(styles.buttonClassLeave, 'outline secondary');

  return (
    <div className={styles.stickyFooter} ref={footerRef}>
      <div className={dynamicContainer}>
        <div style={{display: 'flex', gap: '2rem', alignItems: 'center', flex: 1}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span style={{whiteSpace: 'nowrap'}}>Copy Invite Link</span>
            <div className={styles.clipboardButtonHolder}>
              <button
                className={styles.buttonClass}
                onClick={handleClipboardCopy}
                type="button"
                title="Copy invite link"
              >
                <div className={styles.icon}>
                  <HiClipboardCopy />
                </div>
              </button>
            </div>
          </div>
          {onSendInviteClick && (
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <span style={{whiteSpace: 'nowrap'}}>Send Friends Invite</span>
              <button
                className={styles.buttonClass}
                onClick={onSendInviteClick}
                type="button"
                title="Send invite to friend"
              >
                <div className={styles.icon}>
                  <MdGames />
                </div>
              </button>
            </div>
          )}
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
            onClick={() => setSideboardSubmitted(true)}
          >
            {sideboardSubmitted ? 'Resubmit Deck' : 'Submit Deck'}
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
