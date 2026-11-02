import classNames from 'classnames';
import { IGameInProgress } from '../gameList/GameList';
import styles from './InProgressGame.module.scss';
import { RiSwordLine, RiEyeLine } from 'react-icons/ri';
import { generateCroppedImageUrl } from '../../../../utils/cropImages';
import FriendBadge from '../gameList/FriendBadge';
import { useTranslation } from 'react-i18next';
import { HEROES_OF_RATHE } from '../filter/constants';

const HERO_NAMES = new Map(
  HEROES_OF_RATHE.map((hero) => [hero.value, hero.label])
);

const HeroPortrait = ({ hero }: { hero?: string }) => {
  const name = hero ? HERO_NAMES.get(hero) ?? hero : '';
  return hero ? (
    <img
      className={styles.heroImg}
      src={generateCroppedImageUrl(hero)}
      alt={name}
      title={name}
      loading="lazy"
    />
  ) : (
    <div className={styles.heroImg} />
  );
};

export const InProgressGame = ({
  entry,
  isFriendsGame = false,
  friendName,
  formatLabel,
  isFeatured = false,
  masteryLevel
}: {
  entry: IGameInProgress;
  isFriendsGame?: boolean;
  friendName?: string;
  formatLabel?: string;
  isFeatured?: boolean;
  masteryLevel?: number;
}) => {
  const spectatorCount = entry.spectatorCount ?? 0;
  const hasLife = entry.p1Life !== undefined && entry.p2Life !== undefined;
  const buttonClass = classNames(styles.button, {
    [styles.buttonFeatured]: isFeatured
  });
  const gameItemClass = classNames(styles.gameItem, {
    [styles.gameItemFeatured]: isFeatured
  });
  // Initial stuff to allow the lang to change
  const { t } = useTranslation();

  return (
    <div key={entry.gameName} className={gameItemClass}>
      <div className={styles.heroRow}>
        <HeroPortrait hero={entry.p1Hero} />
        {hasLife ? (
          <span className={styles.score} title={t('IN_PROGRESS_GAME.LIFE')}>
            <span>{entry.p1Life}</span>
            <RiSwordLine className={styles.versus} aria-hidden="true" />
            <span>{entry.p2Life}</span>
          </span>
        ) : (
          <RiSwordLine className={styles.versus} />
        )}
        <HeroPortrait hero={entry.p2Hero} />
      </div>
      <div className={styles.info}>
        {formatLabel && (
          <span className={styles.formatLabel}>{formatLabel}</span>
        )}
        <span className={styles.meta}>
          {entry.turn !== undefined && (
            <span>{t('IN_PROGRESS_GAME.TURN', { turn: entry.turn })}</span>
          )}
          {spectatorCount > 0 && (
            <span
              className={styles.spectatorCount}
              title={t('IN_PROGRESS_GAME.SPECTATOR_COUNT', {
                count: spectatorCount
              })}
            >
              <RiEyeLine aria-hidden="true" />
              {spectatorCount}
            </span>
          )}
          {isFeatured && !!masteryLevel && (
            <span>
              {t('IN_PROGRESS_GAME.MASTERY_LEVEL', { level: masteryLevel })}
            </span>
          )}
        </span>
      </div>
      <FriendBadge
        isFriendsGame={isFriendsGame}
        friendName={friendName}
        size="small"
      />
      <a
        className={buttonClass}
        href={`/game/play/${entry.gameName}`}
        role="button"
      >
        {t('IN_PROGRESS_GAME.SPECTATE')}
      </a>
    </div>
  );
};

export default InProgressGame;
