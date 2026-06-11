import React from 'react';
import classNames from 'classnames';
import CardPopUp from '../../cardPopUp/CardPopUp';
import CardImage from '../../cardImage/CardImage';
import { CARD_BACK, PLAYMATS, PLAYMAT_DISPLAY_NAMES, TALISHAR_CARD_BACK_IDS, TALISHAR_PLAYMAT_IDS } from 'features/options/cardBacks';
import {
  CARD_SQUARES_PATH,
  DEFAULT_LANGUAGE,
  getCollectionCardImagePath
} from 'utils';
import * as optConst from 'features/options/constants';
import { Setting } from 'features/options/optionsSlice';
import styles from './OptionsSettings.module.css';

interface CosmeticsData {
  cardBacks?: Array<{ id: string; name?: string }>;
  playmats?: Array<{ id: string; name?: string }>;
}

interface CosmeticsSectionProps {
  data: CosmeticsData | undefined;
  selectedCardBack: string;
  selectedPlaymat: string;
  onSettingsChange: (setting: Setting) => void;
}

export const CosmeticsSection: React.FC<CosmeticsSectionProps> = ({
  data,
  selectedCardBack,
  selectedPlaymat,
  onSettingsChange
}) => {
  const getPlaymatImagePath = (playmatId: string) =>
    `/playmats/${PLAYMATS[playmatId]}.webp`;

  const getPlaymatDisplayName = (playmatId: string) =>
    PLAYMAT_DISPLAY_NAMES[playmatId] || PLAYMATS[playmatId] || playmatId;

  const normalizedCardBacks = (data?.cardBacks ?? []).map((cb) => ({
    ...cb,
    id: String(cb.id)
  }));
  const normalizedPlaymats = (data?.playmats ?? []).map((pm) => ({
    ...pm,
    id: String(pm.id)
  }));

  const unlockedCardBackIds = new Set(normalizedCardBacks.map((cb) => cb.id));
  const lockedTalisharCardBackIds = TALISHAR_CARD_BACK_IDS.filter(
    (id) => !unlockedCardBackIds.has(id)
  );
  const unlockedNonDefaultCardBacks = normalizedCardBacks.filter(
    (cb) => cb.id !== '0'
  );

  const unlockedPlaymatIds = new Set(normalizedPlaymats.map((pm) => pm.id));
  const lockedTalisharPlaymatIds = TALISHAR_PLAYMAT_IDS.filter(
    (id) => !unlockedPlaymatIds.has(id)
  );
  const unlockedTalisharPlaymats = normalizedPlaymats.filter((pm) =>
    TALISHAR_PLAYMAT_IDS.includes(pm.id)
  );
  const otherUnlockedPlaymats = normalizedPlaymats.filter(
    (pm) => pm.id !== '0' && !TALISHAR_PLAYMAT_IDS.includes(pm.id)
  );

  const renderPlaymatThumb = (id: string) => (
    <div
      key={`playmat${id}`}
      className={styles.playmatThumbWrapper}
      title={getPlaymatDisplayName(id)}
      onClick={() => onSettingsChange({ name: optConst.MY_PLAYMAT, value: id })}
    >
      <img
        src={getPlaymatImagePath(id)}
        alt={getPlaymatDisplayName(id)}
        draggable={false}
        loading="lazy"
        decoding="async"
        className={classNames(styles.playmatThumb, {
          [styles.playmatThumbSelected]: selectedPlaymat === id
        })}
      />
      <span className={styles.playmatLabel}>{getPlaymatDisplayName(id)}</span>
    </div>
  );

  const renderCardBackThumb = (id: string) => (
    <CardPopUp
      key={`cardBack${id}`}
      onClick={() => onSettingsChange({ name: optConst.CARD_BACK, value: id })}
      cardNumber={CARD_BACK[id]}
    >
      <CardImage
        src={getCollectionCardImagePath({
          path: CARD_SQUARES_PATH,
          locale: DEFAULT_LANGUAGE,
          cardNumber: CARD_BACK[id]
        })}
        draggable={false}
        className={classNames(styles.cardBack, {
          [styles.selected]: selectedCardBack === id
        })}
      />
    </CardPopUp>
  );

  return (
    <>
      <label className={styles.cardBackTitle}>
        <strong>Playmat</strong>
        {!data?.playmats?.length && (
          <p>Log in to customise your playmat</p>
        )}
        <div className={styles.playmatListContainer}>
          {renderPlaymatThumb('0')}
          {lockedTalisharPlaymatIds.map((id) => (
            <div
              key={`lockedPlaymat${id}`}
              className={styles.lockedCardBackWrapper}
              title="Support us on Metafy to unlock Talishar exclusive playmats"
            >
              <img
                src={getPlaymatImagePath(id)}
                alt={getPlaymatDisplayName(id)}
                draggable={false}
                loading="lazy"
                decoding="async"
                className={classNames(styles.playmatThumb, styles.lockedCardBack)}
              />
              <span className={classNames(styles.playmatLabel, styles.lockedPlaymatLabel)}>
                {getPlaymatDisplayName(id)}
              </span>
              <div className={styles.lockOverlay}>
                <span className={styles.lockIcon}>&#128274;</span>
              </div>
            </div>
          ))}
          {unlockedTalisharPlaymats.map((pm) => renderPlaymatThumb(pm.id))}
          {otherUnlockedPlaymats.map((pm) => renderPlaymatThumb(pm.id))}
        </div>
      </label>
      <label className={styles.cardBackTitle}>
        <strong>Card Back</strong>
        {!data?.cardBacks?.length && (
          <p>
            Link your Metafy account on your profile page to unlock Talishar exclusive card backs
          </p>
        )}
        <div className={styles.cardBackListContainer}>
          {renderCardBackThumb('0')}
          {unlockedNonDefaultCardBacks.map((cardBack) =>
            renderCardBackThumb(cardBack.id)
          )}
          {lockedTalisharCardBackIds.map((id) => (
            <div
              key={`lockedCardBack${id}`}
              className={styles.lockedCardBackWrapper}
              title="Support us on Metafy to unlock Talishar exclusive card backs"
            >
              <CardImage
                src={getCollectionCardImagePath({
                  path: CARD_SQUARES_PATH,
                  locale: DEFAULT_LANGUAGE,
                  cardNumber: CARD_BACK[id]
                })}
                draggable={false}
                className={classNames(styles.cardBack, styles.lockedCardBack)}
              />
              <div className={styles.lockOverlay}>
                <span className={styles.lockIcon}>&#128274;</span>
              </div>
            </div>
          ))}
        </div>
      </label>
    </>
  );
};
