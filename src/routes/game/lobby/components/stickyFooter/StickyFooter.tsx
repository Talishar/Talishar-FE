import React, { useRef, useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { FaExclamationCircle } from 'react-icons/fa';
import { DeckResponse } from 'interface/API/GetLobbyInfo.php';
import styles from './StickyFooter.module.css';
import classNames from 'classnames';
import { HiClipboardCopy, HiClipboardCheck } from 'react-icons/hi';
import { MdGames } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

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
  syncEnabled?: boolean;
  syncStatusText?: string;
  syncLearnMoreUrl?: string;
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
  onIsValidChange,
  syncEnabled = false,
  syncStatusText,
  syncLearnMoreUrl
}: DeckSize) => {
  const { errors, values, isValid } = useFormikContext<DeckResponse>();
  const footerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  let errorArray = [] as string[];
  for (const [key, value] of Object.entries(errors)) {
    errorArray.push(String(value));
  }

  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();

			    
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

    const observer = footerRef.current
      ? new ResizeObserver(updateFooterHeight)
      : null;
    if (observer && footerRef.current) observer.observe(footerRef.current);

    window.addEventListener('resize', updateFooterHeight);
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener('resize', updateFooterHeight);
    };
  }, []);

  // Call the callback when isValid changes
  useEffect(() => {
    onIsValidChange?.(isValid);
  }, [isValid, onIsValidChange]);

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

  const dynamicContainer = classNames(styles.dynamicContainer, 'container');
  const leaveLobby = classNames(styles.buttonClassLeave, 'outline secondary');

  return (
    <div className={styles.stickyFooter} ref={footerRef}>
      <div className={dynamicContainer}>
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
            flex: 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className={styles.clipboardButtonHolder}>
              <button
                className={classNames(styles.iconButton, { [styles.iconButtonCopied]: copied })}
                onClick={handleClipboardCopy}
                type="button"
                title={copied ? 'Copied!' : t("GAME_LOBBY.COPY_INVITE")}
              >
                {copied ? <HiClipboardCheck /> : <HiClipboardCopy />}
              </button>
            </div>
          </div>
          {onSendInviteClick && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span
                style={{ whiteSpace: 'nowrap' }}
                className={styles.labelTextLong}
              >
		{t("GAME_LOBBY.SEND_FRIEND_INVITE")}                
              </span>
              <span
                style={{ whiteSpace: 'nowrap' }}
                className={styles.labelTextShort}
              >
		{t("GAME_LOBBY.SEND_INVITE")}                 
              </span>
              <button
                className={styles.buttonClass}
                onClick={onSendInviteClick}
                type="button"
                title={t("GAME_LOBBY.SEND_INVITE_FRIEND")}
              >
                <div className={styles.icon}>
                  <MdGames />
                </div>
              </button>
            </div>
          )}
        </div>
        <div className={styles.footerContent}>
          <div className={styles.deckCount}>
            {!isValid && errorArray.length > 0 && (
              <span className={styles.deckErrorIcon}>
                <FaExclamationCircle />
                <span className={styles.deckErrorTooltip}>{errorArray[0]}</span>
              </span>
            )}
            {t("GAME_LOBBY.DECK")}{' '}{values.deck.length}/{deckSize}
          </div>
        </div>
        <div className={styles.buttonHolder}>
          {canUnreadySideboard ? (
            <button
              className={styles.buttonClass}
              type="button"
              disabled={isUnreadyLoading || needToDoDisclaimer}
              onClick={onUnreadySideboard}
            >
              {t("GAME_LOBBY.EDIT_DECK")}
            </button>
          ) : (
            <button
              className={styles.buttonClass}
              type="submit"
              aria-busy={isSubmitting}
              disabled={
                isValid === false || !submitSideboard || needToDoDisclaimer || isSubmitting
              }
            >
              {isSubmitting ? t("GAME_LOBBY.SUBMITTING") : t("GAME_LOBBY.CONFIRM_DECK")}
            </button>
          )}
          {isWidescreen && (
            <button className={leaveLobby} onClick={handleLeave}>
              {t("GAME_LOBBY.LEAVE")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyFooter;
