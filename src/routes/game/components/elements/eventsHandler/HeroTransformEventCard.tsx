import React from 'react';
import classNames from 'classnames';
import styles from './HeroTransformEventCard.module.css';

export type HeroTransformTheme = 'mechanologist' | 'shadow' | 'chaos';

export const getHeroTransformTheme = (
  cardNumber: string
): HeroTransformTheme => {
  const normalizedCardNumber = cardNumber.toLowerCase();

  if (
    normalizedCardNumber.startsWith('teklovossen_') ||
    normalizedCardNumber.startsWith('evo010') ||
    normalizedCardNumber.startsWith('evo410')
  ) {
    return 'mechanologist';
  }

  if (
    normalizedCardNumber.startsWith('levia_') ||
    normalizedCardNumber.startsWith('dtd164') ||
    normalizedCardNumber.startsWith('dtd564')
  ) {
    return 'shadow';
  }

  return 'chaos';
};

interface HeroTransformEventCardProps {
  cardNumber: string;
  children: React.ReactNode;
}

export default function HeroTransformEventCard({
  cardNumber,
  children
}: HeroTransformEventCardProps) {
  const theme = getHeroTransformTheme(cardNumber);

  return (
    <div
      className={classNames(styles.transformEffect, styles[theme])}
      data-transform-theme={theme}
    >
      <div className={styles.aura} aria-hidden="true" />
      <div className={styles.accents} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className={styles.cardFrame}>{children}</div>
    </div>
  );
}
