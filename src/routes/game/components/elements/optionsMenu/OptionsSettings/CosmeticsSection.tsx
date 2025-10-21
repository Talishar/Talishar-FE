import React from 'react';
import classNames from 'classnames';
import CardPopUp from '../../cardPopUp/CardPopUp';
import CardImage from '../../cardImage/CardImage';
import { CARD_BACK, PLAYMATS } from 'features/options/cardBacks';
import {
  CARD_SQUARES_PATH,
  DEFAULT_LANGUAGE,
  getCollectionCardImagePath
} from 'utils';
import * as optConst from 'features/options/constants';
import { Setting } from 'features/options/optionsSlice';
import styles from './OptionsSettings.module.css';

interface CosmeticsData {
  cardBacks?: Array<{ id: string }>;
  playmats?: Array<{ id: string }>;
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
  return (
    <>
        <label className={styles.cardBackTitle}>
        <strong>Playmat</strong>
        {!!data?.playmats?.length ? (
          <select
            defaultValue={selectedPlaymat}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onSettingsChange({
                name: optConst.MY_PLAYMAT,
                value: e.target.value
              })
            }
          >
            {data?.playmats?.map((playmatKey) => {
              return (
                <option key={playmatKey.id} value={playmatKey.id}>
                  {PLAYMATS[playmatKey.id]}
                </option>
              );
            })}
          </select>
        ) : (
          <p>Log in to customise your playmat</p>
        )}
      </label>
      <label className={styles.cardBackTitle}>
        <strong>Card Back</strong>
        {!data?.cardBacks?.length && (
          <p>Link your patreon on your profile page to unlock card backs</p>
        )}
        <div className={styles.cardBackListContainer}>
          {data?.cardBacks?.map((cardBack) => {
            const cardClass = classNames(styles.cardBack, {
              [styles.selected]: selectedCardBack === cardBack.id
            });
            return (
              <CardPopUp
                key={`cardBack${cardBack.id}`}
                onClick={() =>
                  onSettingsChange({
                    name: optConst.CARD_BACK,
                    value: cardBack.id
                  })
                }
                cardNumber={CARD_BACK[cardBack.id]}
              >
                <CardImage
                  src={getCollectionCardImagePath({
                    path: CARD_SQUARES_PATH,
                    locale: DEFAULT_LANGUAGE,
                    cardNumber: CARD_BACK[cardBack.id]
                  })}
                  draggable={false}
                  className={cardClass}
                />
              </CardPopUp>
            );
          })}
        </div>
      </label>
    </>
  );
};
