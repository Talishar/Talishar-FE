import React, { useRef, useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { FaExclamationCircle } from 'react-icons/fa';
import { DeckResponse } from 'interface/API/GetLobbyInfo.php';
import styles from './StickyFooter.module.css';
import classNames from 'classnames';
import { HiClipboardCopy, HiClipboardCheck } from 'react-icons/hi';
import { MdGames } from 'react-icons/md';

export type DeckSize = {
  deckSize: number;
  submitSideboard: boolean;
  canUnreadySideboard?: boolean;
  isUnreadyLoading?: boolean;
  isSubmitting?: boolean;
  isWidescreen: boolean;
  needToDoDisclaimer: boolean;
  handleLeave: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onUnreadySideboard?: () => void;
  onSendInviteClick?: () => void;
  onIsValidChange?: (isValid: boolean) => void;
};

const StickyFooter = ({
  deckSize,
  submitSideboard,
  canUnreadySideboard = false,
  isUnreadyLoading = false,
  isSubmitting = false,
  isWidescreen,
  needToDoDisclaimer,
  handleLeave,
  onUnreadySideboard,
  onSendInviteClick,
  onIsValidChange
}: DeckSize) => {
  const { errors, values, isValid } = useFormikContext<DeckResponse>();
  const footerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  let errorArray = [] as string[];
  for (const [, value] of Object.entries(errors)) {
    errorArray.push(String(value));
  }

  const needed = deckSize - values.deck.length;
  const isConfirmEnabled = isValid && submitSideboard && !needToDoDisclaimer;

  // Update CSS custom property with footer height
  useEffect(() => {
    const updateFooterHeight = () => {
      if (footerRef.current) {
        const height = footerRef.current.offsetHeight;
        if (height > 0) {
          document.documentElement.style.setProperty(
            '--sticky-footer-height',
            `${height}px`
          );
        }
      }
    };

    updateFooterHeight();
    const timer = setTimeout(updateFooterHeight, 100);
    window.addEventListener('resize', updateFooterHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateFooterHeight);
    };
  }, []);

  useEffect(() => {
    onIsValidChange?.(isValid);
  }, [isValid, onIsValidChange]);

  const triggerCopiedFeedback = () => {
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleClipboardCopy = () => {
    const text = window.location.href.replace('lobby', 'join');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(triggerCopiedFeedback)
        .catch(() => {
          fallbackCopyToClipboard(text);
          triggerCopiedFeedback();
        });
    } else {
      fallbackCopyToClipboard(text);
      triggerCopiedFeedback();
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const wrapperClass = classNames(styles.dynamicContainer, 'container');
  const leaveClass = classNames(styles.leaveButton, 'outline secondary');

  const deckMetaText = isConfirmEnabled
    ? `/${deckSize}\u00a0\u00b7\u00a0\u2713\u00a0ready`
    : needed > 0
    ? `/${deckSize}\u00a0\u00b7\u00a0need\u00a0${needed}\u00a0more`
    : `/${deckSize}`;

  return (
    <div className={styles.stickyFooter} ref={footerRef}>
      <div className={wrapperClass}>
        {/* Main action row: sync | deck count | confirm */}
        <div className={styles.mainRow}>
          {/* Left: copy + sync status */}
          <div className={styles.syncSection}>
            <button
              className={classNames(styles.iconButton, { [styles.iconButtonCopied]: copied })}
              onClick={handleClipboardCopy}
              type="button"
              title={copied ? 'Copied!' : 'Copy invite link'}
            >
              {copied ? <HiClipboardCheck /> : <HiClipboardCopy />}
            </button>
            {onSendInviteClick && isWidescreen && (
              <button
                className={styles.iconButton}
                onClick={onSendInviteClick}
                type="button"
                title="Send invite to friend"
              >
                <MdGames />
              </button>
            )}
          </div>

          {/* Center: deck count */}
          <div
            className={`${styles.deckSection} ${
              isConfirmEnabled ? styles.deckReady : ''
            }`}
          >
            <span className={styles.deckNumber}>{values.deck.length}</span>
            <span className={styles.deckMeta}>{deckMetaText}</span>
          </div>

          {/* Right: confirm / edit + optional leave */}
          <div className={styles.actionSection}>
            {canUnreadySideboard ? (
              <button
                className={styles.editButton}
                type="button"
                disabled={isUnreadyLoading || needToDoDisclaimer}
                onClick={onUnreadySideboard}
              >
                Edit Deck
              </button>
            ) : (
              <button
                className={`${styles.confirmButton} ${
                  isConfirmEnabled
                    ? styles.confirmReady
                    : styles.confirmDisabled
                }`}
                type="submit"
                aria-busy={isSubmitting}
                disabled={!isConfirmEnabled || isSubmitting}
              >
                {isSubmitting
                  ? 'Submitting\u2026'
                  : isWidescreen
                  ? 'Confirm Deck'
                  : 'Confirm'}
              </button>
            )}
            {isWidescreen && (
              <button className={leaveClass} onClick={handleLeave}>
                Leave
              </button>
            )}
          </div>
        </div>

        {/* Alarm row — slides in only when deck is invalid */}
        {!isValid && errorArray[0] && (
          <div className={styles.alarmRow}>
            <FaExclamationCircle className={styles.alarmIcon} />
            <span>{errorArray[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyFooter;
