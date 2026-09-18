import React from 'react';
import classNames from 'classnames';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import CardPopUp from 'routes/game/components/elements/cardPopUp/CardPopUp';
import { DeckResponse } from 'interface/API/GetLobbyInfo.php';
import { ArenaLoadout } from 'interface/API/GetLobbyRefresh.php';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import styles from './Loadout.module.css';

const EQUIPMENT_SLOTS = [
  { slot: 'head', label: 'GAME_LOBBY.HEAD' },
  { slot: 'chest', label: 'GAME_LOBBY.CHEST' },
  { slot: 'arms', label: 'GAME_LOBBY.ARMS' },
  { slot: 'legs', label: 'GAME_LOBBY.LEGS' }
] as const;

export interface LoadoutProps {
  loadout: ArenaLoadout;
  mirrored?: boolean;
  isOpponent?: boolean;
}

const Loadout = ({ loadout, mirrored, isOpponent }: LoadoutProps) => {
  const { getLanguage } = useLanguageSelector();
  const { t } = useTranslation();
  const locale = getLanguage();

  const weapons = loadout.weapons ?? [];
  const hasAnything =
    weapons.length > 0 || EQUIPMENT_SLOTS.some(({ slot }) => loadout[slot]);

  if (!hasAnything) return null;

  const renderSlot = (card: string | undefined, label: string, key: string) => (
    <div
      className={classNames(styles.slot, { [styles.slotEmpty]: !card })}
      key={key}
      aria-label={label}
    >
      {card && (
        <CardPopUp
          cardNumber={card}
          isOpponent={isOpponent}
          disableTilt
          disableTapToPreview
        >
          <CardImage
            src={getCollectionCardImagePath({
              path: CARD_SQUARES_PATH,
              locale,
              cardNumber: card
            })}
            isOpponent={isOpponent}
            draggable={false}
            className={styles.slotImage}
          />
        </CardPopUp>
      )}
    </div>
  );

  return (
    <div
      className={classNames(styles.mat, { [styles.matMirrored]: mirrored })}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.rail}>
        {EQUIPMENT_SLOTS.map(({ slot, label }) =>
          renderSlot(loadout[slot], t(label), slot)
        )}
      </div>
      {weapons.length > 0 && (
        <div className={classNames(styles.rail, styles.railWeapons)}>
          {weapons.map((card, ix) =>
            renderSlot(card, t('GAME_LOBBY.WEAPONS'), `weapon-${ix}`)
          )}
        </div>
      )}
    </div>
  );
};

export const MyLoadout = () => {
  const { values } = useFormikContext<DeckResponse>();

  const loadout = React.useMemo<ArenaLoadout>(() => {
    const equipped = (card: string | undefined) =>
      card && card !== 'NONE00' ? card : undefined;
    return {
      head: equipped(values.head),
      chest: equipped(values.chest),
      arms: equipped(values.arms),
      legs: equipped(values.legs),
      weapons: (values.weapons ?? [])
        .map((weapon) => weapon.img)
        .filter((img) => img && img !== 'NONE00')
    };
  }, [values.weapons, values.head, values.chest, values.arms, values.legs]);

  return <Loadout loadout={loadout} />;
};

export default Loadout;
