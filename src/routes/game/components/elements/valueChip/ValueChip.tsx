import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Card } from 'features/Card';
import attackSymbol from '../../../../../img/symbols/symbol-attack.png';
import defSymbol from '../../../../../img/symbols/symbol-defense.png';
import styles from './ValueChip.module.css';

export const ValueChip = ({ card }: { card?: Card }) => {
  const { t } = useTranslation();
  if (!card || card.facing === 'DOWN') return null;
  const isPower = card.powerValue !== undefined;
  const printed = isPower ? card.powerValue : card.blockValue;
  if (printed === undefined) return null;
  const counters =
    Number(card.countersMap?.[isPower ? 'attack' : 'defense']) || 0;
  return (
    <div className={styles.frame}>
      <div
        className={classNames(styles.chip, {
          [styles.lowered]: counters < 0,
          [styles.raised]: counters > 0
        })}
      >
        <img
          className={styles.icon}
          src={isPower ? attackSymbol : defSymbol}
          alt={
            isPower
              ? t('CURRENT_ATTACK.ATTACK_SYMBOL')
              : t('CURRENT_ATTACK.DEFENSE_SYMBOL')
          }
        />
        <span>{Math.max(0, printed + counters)}</span>
      </div>
    </div>
  );
};

export default ValueChip;
