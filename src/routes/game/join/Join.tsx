import React, { useEffect, useMemo } from 'react';
import { useAppDispatch } from 'app/Hooks';
import {
  useGetFavoriteDecksQuery,
  useJoinGameMutation,
  useGetGameListQuery,
  useGetGameInfoQuery,
  useGetMatchmakingStatusQuery
} from 'features/api/apiSlice';
import { MatchmakingBlocker } from 'interface/API/GetMatchmakingStatus.php';
import DeckLegality from 'components/DeckLegality';
import { JoinGameAPI } from 'interface/API/JoinGame.php';
import {
  IOpenGame,
  IGameInProgress
} from 'routes/index/components/gameList/GameList';
import { FavoriteDeck } from 'interface/API/GetFavoriteDecks.php';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styles from './Join.module.css';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { setGameStart } from 'features/game/GameSlice';
import { FaQuestionCircle } from 'react-icons/fa';
import Notice, { ServerErrorNotice } from 'components/Notice';
import {
  describeThrownError,
  ServerError,
  toServerError
} from 'utils/serverError';
import useAuth from 'hooks/useAuth';
import useSupporterStatus from 'hooks/useSupporterStatus';
import useAdScript from 'hooks/useAdScript';
import { AdUnit } from 'components/ads/AdUnit';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { generateCroppedImageUrl, getHeroCropFocusX } from 'utils/cropImages';
import { ImageSelect, ImageSelectOption } from 'components/ImageSelect';
import { isPreconFormat, PRECON_DECKS } from 'appConstants';
import {
  filterDecksForFormat,
  formatDeckLabel,
  getReadableFormatName
} from 'utils/formatUtils';
import { useTranslation, Trans } from 'react-i18next';
import PageBanner from 'components/PageBanner/PageBanner';

// Hero legality is shown by DeckLegality, so it isn't repeated here.
const LOBBY_BLOCKERS: MatchmakingBlocker[] = [
  'own',
  'kicked',
  'theyRejectHero'
];

const JoinGame = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [joinGame] = useJoinGameMutation();
  const { data, isLoading, isSuccess } = useGetFavoriteDecksQuery(undefined);
  const { isLoggedIn } = useAuth();
  const { showAds } = useSupporterStatus();
  useAdScript(showAds);

  // Initial stuff to allow the lang to change
  const { t } = useTranslation();

  const [{ gameName: searchGameName = '0', playerID = '2' }] =
    useKnownSearchParams();

  const { gameID } = useParams();
  const finalGameName = gameID ?? searchGameName;

  // Fetch game list to get the format for this specific game
  const { data: gameListData, isLoading: gameListLoading } =
    useGetGameListQuery(undefined);

  // Check if game is found in public list
  const gameFoundInPublicList = React.useMemo(() => {
    if (!gameListData) return false;
    const gameNameStr = finalGameName;
    const openGame = gameListData.openGames?.find(
      (g: IOpenGame) => String(g.gameName) === gameNameStr
    );
    const inProgressGame = gameListData.gamesInProgress?.find(
      (g: IGameInProgress) => String(g.gameName) === gameNameStr
    );
    return !!(openGame || inProgressGame);
  }, [gameListData, finalGameName]);

  // Fallback: fetch game info directly if not in public list
  const { data: gameInfoData } = useGetGameInfoQuery(finalGameName, {
    skip: gameFoundInPublicList // Only skip if game was found in public list
  });

  const {
    formState: { isSubmitting, errors },
    register,
    handleSubmit,
    reset,
    setValue
  } = useForm<JoinGameAPI>({ mode: 'onBlur' });
  const [serverError, setServerError] = React.useState<ServerError | null>(
    null
  );

  const [selectedFavoriteDeck, setSelectedFavoriteDeck] =
    React.useState<string>('');
  const [selectedPreconDeck, setSelectedPreconDeck] = React.useState<string>(
    PRECON_DECKS.LINKS[0]
  );
  const [gameFormat, setGameFormat] = React.useState<string | null>(null);

  const initialValues: JoinGameAPI = useMemo(() => {
    return {
      deck: '',
      fabdb: '',
      deckTestMode: false,
      decksToTry: '',
      favoriteDeck: false,
      favoriteDecks:
        data?.lastUsedDeckIndex !== undefined
          ? data.favoriteDecks.find(
              (deck: FavoriteDeck) => deck.index === data.lastUsedDeckIndex
            )?.key
          : '',
      gameDescription: ''
    };
  }, [isSuccess, isLoggedIn]);

  useEffect(() => {
    reset(initialValues);
    setSelectedFavoriteDeck(initialValues.favoriteDecks || '');
    setSelectedPreconDeck(PRECON_DECKS.LINKS[0]);
    // Only set fabdb to precon deck if format is precon
    if (isPreconFormat(gameFormat)) {
      setValue('fabdb', PRECON_DECKS.LINKS[0]);
    }
  }, [initialValues, reset, gameFormat, setValue]);

  // Update gameFormat when game list loads - find this game in the list
  useEffect(() => {
    if (gameListData) {
      const gameNameStr = finalGameName;

      const openGame = gameListData.openGames?.find(
        (g: IOpenGame) => String(g.gameName) === gameNameStr
      );
      const inProgressGame = gameListData.gamesInProgress?.find(
        (g: IGameInProgress) => String(g.gameName) === gameNameStr
      );
      const foundGame = openGame || inProgressGame;

      if (foundGame?.format) {
        setGameFormat(foundGame.format);
        return; // Found in public list, don't need private API
      }
    }

    // Fallback: use gameInfoData if game not found in public list (private/friends-only game)
    if (gameInfoData?.format) {
      setGameFormat(gameInfoData.format);
    }
  }, [gameListData, gameInfoData, finalGameName]);

  // Sync selectedPreconDeck with form field for precon formats
  useEffect(() => {
    if (isPreconFormat(gameFormat)) {
      setValue('fabdb', selectedPreconDeck);
    }
  }, [selectedPreconDeck, gameFormat, setValue]);

  // Convert favorite decks to ImageSelect options
  const favoriteDeckOptions: ImageSelectOption[] = React.useMemo(() => {
    if (!data?.favoriteDecks) return [];
    const filtered = filterDecksForFormat(data.favoriteDecks, gameFormat);
    return filtered.map((deck: FavoriteDeck) => ({
      value: deck.key,
      label: formatDeckLabel(deck.name, deck.format),
      imageUrl: generateCroppedImageUrl(deck.hero),
      imageFocusX: getHeroCropFocusX(deck.hero)
    }));
  }, [data?.favoriteDecks, gameFormat]);

  // Convert precon decks to ImageSelect options
  const preconDeckOptions: ImageSelectOption[] = React.useMemo(() => {
    return PRECON_DECKS.LINKS.map((link, index) => ({
      value: link,
      label: PRECON_DECKS.NAMES[index],
      imageUrl: generateCroppedImageUrl(PRECON_DECKS.HEROES[index]),
      imageFocusX: getHeroCropFocusX(PRECON_DECKS.HEROES[index])
    }));
  }, []);

  const isPrecon = isPreconFormat(gameFormat);

  const selectedDeckHero = data?.favoriteDecks.find(
    (deck: FavoriteDeck) => deck.key === selectedFavoriteDeck
  )?.hero;
  const { currentData: matchmaking } = useGetMatchmakingStatusQuery(
    { hero: selectedDeckHero ?? '', preference: '', format: '' },
    { skip: !isLoggedIn || !selectedDeckHero || isPrecon }
  );
  const lobbyBlocker = LOBBY_BLOCKERS.find((code) =>
    matchmaking?.blockers?.[finalGameName]?.includes(code)
  );

  // Debug logging
  React.useEffect(() => {}, [isPrecon, gameFormat, gameListLoading]);

  const onSubmit: SubmitHandler<JoinGameAPI> = async (values: JoinGameAPI) => {
    values.playerID = parseInt(playerID);
    values.gameName = parseInt(finalGameName);
    setServerError(null);

    try {
      const response = await joinGame(values).unwrap();
      if (response.error) {
        setServerError(toServerError(response.error, response.errorCards));
      } else {
        dispatch(
          setGameStart({
            playerID: response.playerID ?? 0,
            gameID: response.gameName ?? 0,
            authKey: response.authKey ?? ''
          })
        );
        navigate(`/game/lobby/${response.gameName}`, {
          state: {
            playerID: response.playerID ?? 0,
            authKey: response.authKey ?? ''
          }
        });
      }
    } catch (error) {
      console.warn(error);
      setServerError({
        title: describeThrownError(error, t('NOTICE.JOIN_FAILED'))
      });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <PageBanner
        title={t('JOIN.TITLE', 'Join Game')}
        subtitle={t('JOIN.SUBTITLE', 'Choose your deck and enter the game')}
      />
      <main className={styles.LoginPageContainer}>
        {showAds && (
          <aside className={styles.leftRail}>
            <AdUnit placement="left-rail-1" />
          </aside>
        )}
        <article className={styles.formContainer}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formInner}>
              {isPrecon ? (
                <label>
                  {t('JOIN.PRECON')}
                  <ImageSelect
                    id="preconDecks"
                    options={preconDeckOptions}
                    value={selectedPreconDeck}
                    onChange={(value) => {
                      setSelectedPreconDeck(value);
                      setValue('fabdb', value);
                    }}
                    placeholder={t('JOIN.SELECT_DECK')}
                    aria-label={t('JOIN.PRECON')}
                    aria-invalid={errors.deck?.message ? 'true' : undefined}
                  />
                  <input
                    type="hidden"
                    {...register('fabdb')}
                    value={selectedPreconDeck}
                  />
                  <ErrorMessage
                    errors={errors}
                    name="fabdb"
                    render={({ message }) => <p>{message}</p>}
                  />
                </label>
              ) : (
                <>
                  {isLoggedIn && !isLoading && (
                    <label>
                      {t('JOIN.SELECTED_DECK')}
                      <ImageSelect
                        id="favoriteDecks"
                        options={favoriteDeckOptions}
                        value={selectedFavoriteDeck}
                        onChange={(value) => {
                          setSelectedFavoriteDeck(value);
                          setValue('favoriteDecks', value);
                        }}
                        placeholder={t('JOIN.SELECTED_DECK_PLACEHOLDER')}
                        aria-label={t('JOIN.SELECTED_DECK')}
                        aria-busy={isLoading}
                        aria-invalid={
                          errors.favoriteDecks?.message ? 'true' : undefined
                        }
                      />
                      {selectedFavoriteDeck && (
                        <DeckLegality
                          heroId={selectedDeckHero}
                          format={gameFormat}
                        />
                      )}
                      {selectedFavoriteDeck && lobbyBlocker && (
                        <Notice
                          tone="warning"
                          title={t(`MATCHMAKING.BLOCKER_${lobbyBlocker}`, {
                            hero:
                              matchmaking?.heroShortName ??
                              t('MATCHMAKING.YOUR_HERO')
                          })}
                        />
                      )}
                      <input
                        type="hidden"
                        {...register('favoriteDecks')}
                        value={selectedFavoriteDeck}
                      />
                    </label>
                  )}
                  <ErrorMessage
                    errors={errors}
                    name="favoriteDecks"
                    render={({ message }) => (
                      <Notice tone="error" title={message} />
                    )}
                  />
                  <fieldset>
                    <label>
                      <>
                        {t('JOIN.IMPORT_DECK')}
                        {''}
                        <span
                          title={t('JOIN.IMPORT_TITLE')}
                          style={{
                            cursor: 'help',
                            display: 'inline-flex',
                            alignItems: 'center',
                            marginLeft: '4px'
                          }}
                        >
                          <FaQuestionCircle size={14} />
                        </span>
                        <input
                          type="text"
                          id="fabdb"
                          aria-label={t('JOIN.IMPORT_HELP')}
                          {...register('fabdb')}
                          aria-invalid={
                            errors.deck?.message ? 'true' : undefined
                          }
                        />
                      </>
                      <ErrorMessage
                        errors={errors}
                        name="fabdb"
                        render={({ message }) => (
                          <Notice tone="error" title={message} />
                        )}
                      />
                    </label>
                    {isLoggedIn && (
                      <label>
                        <input
                          type="checkbox"
                          role="switch"
                          id="favoriteDeck"
                          {...register('favoriteDeck')}
                        />
                        {t('JOIN.SAVE_DECK_FAVORITES')}
                      </label>
                    )}
                    <label style={{ marginTop: '1rem' }}>
                      {t('JOIN.GAME_FORMAT')}
                      <input
                        type="text"
                        id="gameFormat"
                        aria-label={t('JOIN.GAME_FORMAT')}
                        value={getReadableFormatName(gameFormat || '')}
                        disabled
                        readOnly
                      />
                    </label>
                  </fieldset>
                </>
              )}
            </div>
            {!isLoggedIn && (
              <p>
                <small>
                  <Trans i18nKey="LOGIN_REQUIRED">
                    You must be <Link to="/user/login">logged in</Link> to join
                    public lobbies.
                  </Trans>
                </small>
              </p>
            )}
            <button
              type="submit"
              className={styles.buttonClass}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              style={{ marginTop: '18px' }}
            >
              {isSubmitting ? t('JOIN.JOINING_GAME') : t('JOIN.JOIN')}
            </button>
            {serverError && <ServerErrorNotice error={serverError} />}
          </form>
          <hr />
          <button
            className={styles.backButton}
            type="button"
            onClick={(e) => {
              e.stopPropagation;
              navigate(-1);
            }}
          >
            {t('JOIN.BACK')}
          </button>
        </article>
        {showAds && (
          <aside className={styles.rightRail}>
            <AdUnit placement="right-rail-1" />
          </aside>
        )}
        {showAds && (
          <div className={styles.mobileAd}>
            <AdUnit placement="mobile-unit-4" />
          </div>
        )}
      </main>
    </div>
  );
};

export default JoinGame;
