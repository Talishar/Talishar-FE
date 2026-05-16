import React, { useContext } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { IOpenGame } from '../gameList/GameList';
import styles from './OpenGame.module.css';
import { generateCroppedImageUrl } from '../../../../utils/cropImages';
import FriendBadge from '../gameList/FriendBadge';
import QuickJoinContext from '../quickJoin/QuickJoinContext';
import { GAME_FORMAT } from '../../../../appConstants';
import { useTranslation } from 'react-i18next';

const decodeHtmlEntities = (text: string): string => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.documentElement.textContent ?? text;
};

const DESCRIPTION_KEY_MAP: Record<string, string> = {
  'Looking for best deck in the format': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.BEST_DECK',
  'Looking for meta heroes': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.META_HEROES',
  'Meme / fun decks only': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.MEME',
  'Off-meta / experimental decks': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.SPICY_BREWS',
  'Looking to play against a specific class': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.SPECIFIC_CLASS',
  'Looking to play against a specific hero': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.SPECIFIC_HERO',
  'No interest in playing against specific hero': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.NOT_SPECIFIC_HERO',
  'Prefer fast decks (aggro)': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.AGGRO',
  'Prefer slow decks (control)': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.CONTROL',
  'Casual / relaxed play': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.CASUAL',
  'Looking for a quick game': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.QUICK',
  'New player learning the game': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.NEW_PLAYER',
  'Practicing a new hero': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.NEW_HERO',
  'Slow play OK': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.SLOW_PLAY',
};

// Keys that were incorrectly stored verbatim due to missing translations
const BROKEN_KEY_MAP: Record<string, string> = {
  'MENU.CREATE_GAME.GAME_DESCRIPTIONS.NOT_SPECIFIC_CLASS': 'MENU.CREATE_GAME.GAME_DESCRIPTIONS.NOT_SPECIFIC_HERO',
};

const FORMAT_DISPLAY_NAMES: Record<string, string> = {
  [GAME_FORMAT.DRAFT]: 'Limited',
  [GAME_FORMAT.SEALED]: 'Limited',
};

const OpenGame = ({
  ix,
  entry,
  isOther,
  isFriendsGame = false,
  formatLabel
}: {
  ix: number;
  entry: IOpenGame;
  isOther?: boolean;
  isFriendsGame?: boolean;
  formatLabel?: string;
}) => {
  const navigate = useNavigate();
  const quickJoinCtx = useContext(QuickJoinContext);
  const hasDeckReady = !!quickJoinCtx?.hasDeckConfigured;
  const UNKNOWN_HERO_URL =
    'https://images.talishar.net/public/crops/UNKNOWNHERO_cropped.webp';
  const selectedHeroImageUrl =
    (quickJoinCtx?.selectedFavoriteDeck
      ? quickJoinCtx.favoriteDeckOptions.find(
          (o) => o.value === quickJoinCtx.selectedFavoriteDeck
        )?.imageUrl
      : undefined) ??
    UNKNOWN_HERO_URL;
  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasDeckReady && quickJoinCtx) {
      quickJoinCtx.quickJoin(entry.gameName);
    } else {
      navigate(`/game/join/${entry.gameName}`);
    }
  };
  const { t, i18n, ready } = useTranslation();

  const translateDescription = (description: string | undefined): string => {
    if (!description) return description ?? '';
    const decoded = decodeHtmlEntities(description);

    if (decoded.startsWith('MENU.CREATE_GAME.GAME_DESCRIPTIONS.')) {
      const fixedKey = BROKEN_KEY_MAP[decoded] ?? decoded;
      const translated = t(fixedKey);
      return translated !== fixedKey ? translated : decoded;
    }

    const mappedKey = DESCRIPTION_KEY_MAP[decoded];
    if (mappedKey) return t(mappedKey);

    const heroPrefix = 'Looking to play against ';
    if (decoded.startsWith(heroPrefix) && decoded.includes(',')) {
      const names = decoded.slice(heroPrefix.length);
      return `${t('MENU.CREATE_GAME.GAME_DESCRIPTIONS.SPECIFIC_HERO')}: ${names}`;
    }

    const notHeroPrefix = 'No interest in playing against ';
    if (decoded.startsWith(notHeroPrefix) && decoded.includes(',')) {
      const names = decoded.slice(notHeroPrefix.length);
      return `${t('MENU.CREATE_GAME.GAME_DESCRIPTIONS.NOT_SPECIFIC_HERO')}: ${names}`;
    }

    return decoded;
  };

  const buttonClass = classNames(styles.button, styles.buttonWithIcon, 'secondary');

  return (
    <div key={ix} className={styles.gameItem} onClick={handleJoin}>
      <div>
        {!!entry.p1Hero ? (
          <img
            className={styles.heroImg}
            src={generateCroppedImageUrl(entry.p1Hero)}
          />
        ) : (
          <img
            className={styles.heroImg}
            src="https://images.talishar.net/public/crops/UNKNOWNHERO_cropped.webp"
          />
        )}
      </div>
      <div className={styles.descriptionBlock} title={entry.description}>
        {formatLabel && <span className={styles.formatLabel}>{formatLabel}</span>}
        <span className={styles.description}>{translateDescription(entry.description)}</span>
      </div>
      {isOther && !formatLabel && (
        <div className={styles.formatName}>
          {entry.formatName || FORMAT_DISPLAY_NAMES[entry.format] || ''}
        </div>
      )}
      <FriendBadge isFriendsGame={isFriendsGame} size="small" />
      <div
        className={styles.buttonWrapper}
        aria-busy={quickJoinCtx?.isJoining}
      >
        <a
          className={buttonClass}
          href={`/game/join/${entry.gameName}`}
          role="button"
          onClick={handleJoin}
          title={
            hasDeckReady
              ? t("OPEN_GAME.JOIN_DECK_READY")
              : t("OPEN_GAME.JOIN_DECK_NOT_READY")
          }
        >
          <img
              src={selectedHeroImageUrl}
              alt=""
              className={styles.joinHeroIcon}
              aria-hidden="true"
            />
          <span className={styles.joinLabel}>
            {hasDeckReady && (
              <span className={styles.joinMicroLabel}></span>
            )}
            {t("OPEN_GAME.JOIN")}
          </span>
        </a>
      </div>
    </div>
  );
};

export default OpenGame;
