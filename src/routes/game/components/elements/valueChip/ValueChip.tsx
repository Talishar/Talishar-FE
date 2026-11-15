import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Card } from 'features/Card';
import { useCookieString } from 'utils/cookieStore';
import attackSymbol from '../../../../../img/symbols/symbol-attack.png';
import defSymbol from '../../../../../img/symbols/symbol-defense.png';
import { HIDE_EQUIPMENT_VALUES_COOKIE } from './equipmentValuePreference';
import { VALUE_GLYPHS } from './valueGlyphs';
import styles from './ValueChip.module.css';

const TAB = 'M0 -36.7H171.4L240.8 38.8L195.9 85.7H0Z';

export const ValueChip = ({ card }: { card?: Card }) => {
  const { t } = useTranslation();
  const hidden = useCookieString(HIDE_EQUIPMENT_VALUES_COOKIE) === 'true';
  if (hidden || !card || card.facing === 'DOWN') return null;
  const isPower = card.powerValue !== undefined;
  const printed = isPower ? card.powerValue : card.blockValue;
  if (printed === undefined) return null;
  const text = String(printed);
  const scale = text === '*' ? 0.144 : text.length > 1 ? 0.085 : 0.12;
  const centre = isPower ? 147 : -147;
  const symbol = isPower
    ? t('CURRENT_ATTACK.ATTACK_SYMBOL')
    : t('CURRENT_ATTACK.DEFENSE_SYMBOL');
  return (
    <div className={styles.frame}>
      <svg
        className={classNames(
          styles.piece,
          isPower ? styles.power : styles.block
        )}
        viewBox={isPower ? '-100 -100 358.8 200' : '-258.8 -100 358.8 200'}
        role="img"
        aria-label={`${symbol} ${text}`}
      >
        <path
          className={styles.tab}
          d={TAB}
          transform={isPower ? undefined : 'scale(-1 1)'}
        />
        {text.split('').map((char, index) => (
          <path
            key={index}
            className={styles.digit}
            d={VALUE_GLYPHS[char]}
            transform={`translate(${
              centre + (index - (text.length - 1) / 2) * 500 * scale
            } 24.5) scale(${scale})`}
          />
        ))}
        <image
          href={isPower ? attackSymbol : defSymbol}
          x={-100}
          y={-100}
          width={200}
          height={200}
        />
      </svg>
    </div>
  );
};

export default ValueChip;
