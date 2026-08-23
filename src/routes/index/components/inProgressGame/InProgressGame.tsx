import classNames from 'classnames';
import { IGameInProgress } from '../gameList/GameList';
import styles from './InProgressGame.module.scss';
import { RiSwordLine, RiEyeLine } from 'react-icons/ri';
import { generateCroppedImageUrl } from '../../../../utils/cropImages';
import FriendBadge from '../gameList/FriendBadge';
import { useTranslation } from 'react-i18next';

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
  const hasFormatLabel = !!formatLabel;
  const spectatorCount = entry.spectatorCount ?? 0;
  const buttonClass = classNames(styles.button, {
    [styles.buttonFeatured]: isFeatured
  });
  const gameItemClass = classNames(styles.gameItem, {
    [styles.gameItemNoFormat]: !hasFormatLabel,
    [styles.gameItemFeatured]: isFeatured
  });
  const matchupBlockClass = classNames(styles.matchupBlock, {
    [styles.matchupBlockNoFormat]: !hasFormatLabel
  });
  const heroRowClass = classNames(styles.heroRow, {
    [styles.heroRowNoFormat]: !hasFormatLabel
  });
  // Initial stuff to allow the lang to change
  const { t } = useTranslation();

  return (
    <div key={entry.gameName} className={gameItemClass}>
      <div className={matchupBlockClass}>
        <div className={heroRowClass}>
          <div>
            {!!entry.p1Hero && (
              <img
                className={styles.heroImg}
                src={generateCroppedImageUrl(entry.p1Hero)}
                alt={entry.p1Hero}
                loading="lazy"
              />
            )}
          </div>
          <RiSwordLine />
          <div>
            {!!entry.p2Hero && (
              <img
                className={styles.heroImg}
                src={generateCroppedImageUrl(entry.p2Hero)}
                alt={entry.p2Hero}
                loading="lazy"
              />
            )}
          </div>
        </div>
        {formatLabel && (
          <span className={styles.formatLabel}>{formatLabel}</span>
        )}
        {isFeatured && spectatorCount > 0 && (
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
          <span className={styles.masteryLevel}>
            {t('IN_PROGRESS_GAME.MASTERY_LEVEL', { level: masteryLevel })}
          </span>
        )}
      </div>
      <FriendBadge
        isFriendsGame={isFriendsGame}
        friendName={friendName}
        size="small"
      />
      <div>
        <a
          className={buttonClass}
          href={`/game/play/${entry.gameName}`}
          role="button"
        >
          {t('IN_PROGRESS_GAME.SPECTATE')}
        </a>
      </div>
    </div>
  );
};

export default InProgressGame;
