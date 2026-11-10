import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import { ImageSelect, ImageSelectOption } from 'components/ImageSelect';
import {
  useGetFavoriteDecksQuery,
  useJoinGameMutation
} from 'features/api/apiSlice';
import { FavoriteDeck } from 'interface/API/GetFavoriteDecks.php';
import useAuth from 'hooks/useAuth';
import { isPreconFormat, PRECON_DECKS } from 'appConstants';
import { generateCroppedImageUrl, getHeroCropFocusX } from 'utils/cropImages';
import { filterDecksForFormat, formatDeckLabel } from 'utils/formatUtils';
import styles from './ChangeDeckModal.module.css';

interface ChangeDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChanged: () => void;
  gameID: number;
  playerID: number;
  authKey: string;
  format: string;
}

const ChangeDeckModal = ({
  isOpen,
  onClose,
  onChanged,
  gameID,
  playerID,
  authKey,
  format
}: ChangeDeckModalProps) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { data: favorites } = useGetFavoriteDecksQuery(undefined, {
    skip: !isOpen || !isLoggedIn
  });
  const [joinGame, { isLoading }] = useJoinGameMutation();
  const [favoriteKey, setFavoriteKey] = useState('');
  const [deckUrl, setDeckUrl] = useState('');
  const [preconLink, setPreconLink] = useState(PRECON_DECKS.LINKS[0]);
  const [saveToFavorites, setSaveToFavorites] = useState(false);
  const isPrecon = isPreconFormat(format);

  const favoriteOptions: ImageSelectOption[] = useMemo(
    () =>
      filterDecksForFormat(favorites?.favoriteDecks ?? [], format).map(
        (deck: FavoriteDeck) => ({
          value: deck.key,
          label: formatDeckLabel(deck.name, deck.format),
          imageUrl: generateCroppedImageUrl(deck.hero),
          imageFocusX: getHeroCropFocusX(deck.hero)
        })
      ),
    [favorites?.favoriteDecks, format]
  );

  const preconOptions: ImageSelectOption[] = useMemo(
    () =>
      PRECON_DECKS.LINKS.map((link, index) => ({
        value: link,
        label: PRECON_DECKS.NAMES[index],
        imageUrl: generateCroppedImageUrl(PRECON_DECKS.HEROES[index]),
        imageFocusX: getHeroCropFocusX(PRECON_DECKS.HEROES[index])
      })),
    []
  );

  const trimmedUrl = deckUrl.trim();
  const hasChoice = isPrecon ? !!preconLink : !!trimmedUrl || !!favoriteKey;

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (!hasChoice || isLoading) return;
    try {
      const response = await joinGame({
        gameName: gameID,
        playerID,
        authKey,
        changeDeck: true,
        fabdb: isPrecon ? preconLink : trimmedUrl,
        favoriteDecks: !isPrecon && !trimmedUrl ? favoriteKey : '0',
        favoriteDeck: !isPrecon && !!trimmedUrl && saveToFavorites
      }).unwrap();
      if (response.error) throw new Error(response.error);
      toast.success(t('GAME_LOBBY.DECK_CHANGED'), { position: 'top-center' });
      setDeckUrl('');
      setFavoriteKey('');
      setSaveToFavorites(false);
      onChanged();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t('GAME_LOBBY.SOME_ERROR'),
        { position: 'top-center' }
      );
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={t('GAME_LOBBY.CHANGE_DECK')}
      confirmLabel={
        isLoading ? t('GAME_LOBBY.CHANGING_DECK') : t('GAME_LOBBY.CHANGE_DECK')
      }
      cancelLabel={t('GAME_LOBBY.CANCEL')}
      onConfirm={handleConfirm}
      onCancel={handleClose}
      confirmDisabled={!hasChoice || isLoading}
    >
      <div className={styles.form} role="group">
        <p className={styles.hint}>{t('GAME_LOBBY.CHANGE_DECK_HINT')}</p>
        {isPrecon ? (
          <label className={styles.field}>
            {t('JOIN.PRECON')}
            <ImageSelect
              id="changeDeckPrecon"
              options={preconOptions}
              value={preconLink}
              onChange={setPreconLink}
              placeholder={t('JOIN.SELECT_DECK')}
              aria-label={t('JOIN.PRECON')}
            />
          </label>
        ) : (
          <>
            {isLoggedIn && favoriteOptions.length > 0 && (
              <label className={styles.field}>
                {t('JOIN.SELECTED_DECK')}
                <ImageSelect
                  id="changeDeckFavorite"
                  options={favoriteOptions}
                  value={favoriteKey}
                  onChange={(value) => {
                    setFavoriteKey(value);
                    setDeckUrl('');
                  }}
                  placeholder={t('JOIN.SELECTED_DECK_PLACEHOLDER')}
                  aria-label={t('JOIN.SELECTED_DECK')}
                />
              </label>
            )}
            <label className={styles.field}>
              {t('JOIN.DECK_URL_LABEL')}
              <input
                type="text"
                className={styles.input}
                value={deckUrl}
                placeholder={t('JOIN.DECK_URL_PLACEHOLDER')}
                onChange={(e) => {
                  setDeckUrl(e.target.value);
                  if (e.target.value.trim()) setFavoriteKey('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
              />
            </label>
            {isLoggedIn && !!trimmedUrl && (
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  role="switch"
                  checked={saveToFavorites}
                  onChange={(e) => setSaveToFavorites(e.target.checked)}
                />
                {t('JOIN.SAVE_DECK_FAVORITES')}
              </label>
            )}
          </>
        )}
      </div>
    </ConfirmModal>
  );
};

export default ChangeDeckModal;
