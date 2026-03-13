import React, { useContext } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { IOpenGame } from '../gameList/GameList';
import styles from './OpenGame.module.css';
import { generateCroppedImageUrl } from '../../../../utils/cropImages';
import FriendBadge from '../gameList/FriendBadge';
import QuickJoinContext from '../quickJoin/QuickJoinContext';
import { isDeckCompatibleWithGameFormat } from '../../../../appConstants';

const OpenGame = ({
  ix,
  entry,
  isOther,
  isFriendsGame = false
}: {
  ix: number;
  entry: IOpenGame;
  isOther?: boolean;
  isFriendsGame?: boolean;
}) => {
  const navigate = useNavigate();
  const quickJoinCtx = useContext(QuickJoinContext);
  const hasDeckReady = !!quickJoinCtx?.hasDeckConfigured;

  const selectedDeckRawFormat = quickJoinCtx?.selectedDeckRawFormat ?? null;
  const isFormatCompatible =
    !hasDeckReady ||
    !selectedDeckRawFormat ||
    isDeckCompatibleWithGameFormat(selectedDeckRawFormat, entry.format);
  const canQuickJoin = hasDeckReady && isFormatCompatible;

  const selectedHeroImageUrl =
    canQuickJoin && quickJoinCtx?.selectedFavoriteDeck
      ? quickJoinCtx.favoriteDeckOptions.find(
          (o) => o.value === quickJoinCtx.selectedFavoriteDeck
        )?.imageUrl
      : undefined;

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canQuickJoin && quickJoinCtx) {
      quickJoinCtx.quickJoin(entry.gameName);
    } else {
      navigate(`/game/join/${entry.gameName}`);
    }
  };

  const buttonClass = classNames(styles.button, 'secondary', {
    [styles.buttonIncompatible]: hasDeckReady && !isFormatCompatible
  });

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
      <div className={styles.description}>{entry.description}</div>
      {isOther && <div className={styles.formatName}>{entry.formatName}</div>}
      <FriendBadge isFriendsGame={isFriendsGame} size="small" />
      <div>
        <a
          className={buttonClass}
          href={`/game/join/${entry.gameName}`}
          role="button"
          onClick={handleJoin}
          aria-busy={canQuickJoin ? quickJoinCtx?.isJoining : undefined}
          title={
            !hasDeckReady
              ? 'Select a deck in the panel above to join instantly'
              : !isFormatCompatible
                ? 'Your selected deck format is not compatible with this game'
                : 'Join using your pre-configured deck'
          }
        >
          {selectedHeroImageUrl && (
            <img
              src={selectedHeroImageUrl}
              alt=""
              className={styles.joinHeroIcon}
              aria-hidden="true"
            />
          )}
          Join
        </a>
      </div>
    </div>
  );
};

export default OpenGame;
