import { Link, useNavigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { FaPlay, FaSave } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import NavigationPage from 'routes/NavigationPage';
import useAdScript from 'hooks/useAdScript';
import { usePageTitle } from 'hooks/usePageTitle';
import useSupporterStatus from 'hooks/useSupporterStatus';
import {
  useGetMatchHistoryQuery,
  useLoadReplayMutation
} from 'features/api/apiSlice';
import { setReplayStart } from 'features/game/GameSlice';
import { selectCurrentUser } from 'features/auth/authSlice';
import { GAME_FORMAT, normalizeFormat } from 'appConstants';
import { GameLocationState } from 'interface/GameLocationState';
import { MatchHistoryGame } from 'interface/API/GetMatchHistory.php';
import { generateCroppedImageUrl, heroCropFocusStyle } from 'utils/cropImages';
import styles from './MatchHistory.module.css';

const UNKNOWN_HERO_CROP = generateCroppedImageUrl('UNKNOWNHERO');

const HeroCrop = ({ heroId }: { heroId: string }) => (
  <img
    src={heroId ? generateCroppedImageUrl(heroId) : UNKNOWN_HERO_CROP}
    style={heroCropFocusStyle(heroId)}
    alt=""
    loading="lazy"
    onError={(event) => {
      const image = event.currentTarget;
      if (image.src !== UNKNOWN_HERO_CROP) image.src = UNKNOWN_HERO_CROP;
    }}
  />
);

const MatchHistory = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t('HEADER.MATCH_HISTORY'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showAds } = useSupporterStatus();
  useAdScript(showAds);
  const accountId = useAppSelector(selectCurrentUser);
  const { currentData: data, isError } = useGetMatchHistoryQuery(
    accountId ? String(accountId) : skipToken,
    { refetchOnMountOrArgChange: true }
  );
  const [loadReplay, { isLoading: isLoadingReplay }] = useLoadReplayMutation();
  const games = data?.games ?? [];

  const formatLabels: Record<string, string> = {
    [GAME_FORMAT.CLASSIC_CONSTRUCTED]: t('GAME_LIST.FORMATS.CC'),
    [GAME_FORMAT.COMPETITIVE_CC]: t('GAME_LIST.FORMATS.COMPETITIVE_CC'),
    [GAME_FORMAT.BLITZ]: t('GAME_LIST.FORMATS.BLITZ'),
    [GAME_FORMAT.COMPETITIVE_BLITZ]: t('GAME_LIST.FORMATS.COMPETITIVE_BLITZ'),
    [GAME_FORMAT.LLCC]: t('GAME_LIST.FORMATS.LL'),
    [GAME_FORMAT.COMPETITIVE_LL]: t('GAME_LIST.FORMATS.COMPETITIVE_LL'),
    [GAME_FORMAT.SAGE]: t('GAME_LIST.FORMATS.SAGE'),
    [GAME_FORMAT.COMPETITIVE_SAGE]: t('GAME_LIST.FORMATS.COMPETITIVE_SAGE'),
    [GAME_FORMAT.OPEN_CC]: t('GAME_LIST.FORMATS.FUTURE_CC'),
    [GAME_FORMAT.OPEN_SAGE]: t('GAME_LIST.FORMATS.FUTURE_SAGE'),
    [GAME_FORMAT.OPEN_LL_CC]: t('MENU.CREATE_GAME.FORMATS.FUTURE_LL'),
    [GAME_FORMAT.OPEN_BLITZ]: t('MATCH_HISTORY.FORMATS.OPEN_BLITZ'),
    [GAME_FORMAT.GAGE]: t('GAME_LIST.FORMATS.GAGE'),
    [GAME_FORMAT.DRAFT]: t('MENU.CREATE_GAME.FORMATS.DRAFT'),
    [GAME_FORMAT.SEALED]: t('MATCH_HISTORY.FORMATS.SEALED'),
    [GAME_FORMAT.COMMONER]: t('MATCH_HISTORY.FORMATS.COMMONER'),
    [GAME_FORMAT.CLASH]: t('MATCH_HISTORY.FORMATS.CLASH'),
    [GAME_FORMAT.BRAWL]: t('MATCH_HISTORY.FORMATS.BRAWL'),
    [GAME_FORMAT.OPEN]: t('MENU.CREATE_GAME.FORMATS.OPEN'),
    [GAME_FORMAT.PRECON]: t('MENU.CREATE_GAME.FORMATS.PRECON')
  };

  const formatLabel = (format: string) => {
    const normalized = normalizeFormat(format) ?? '';
    return formatLabels[normalized] ?? normalized;
  };

  const playedLabel = (game: MatchHistoryGame) =>
    [
      new Intl.DateTimeFormat(i18n.resolvedLanguage || i18n.language, {
        dateStyle: 'medium'
      }).format(new Date(game.endedAt * 1000)),
      formatLabel(game.format),
      game.turns > 0 ? t('MATCH_HISTORY.TURNS', { count: game.turns }) : ''
    ]
      .filter(Boolean)
      .join(' · ');

  const watch = async (replayNumber: number) => {
    try {
      const response = await loadReplay({ replayNumber }).unwrap();
      if (
        response.error ||
        !response.playerID ||
        !response.gameName ||
        !response.authKey
      ) {
        throw new Error(response.error || t('MATCH_HISTORY.WATCH_ERROR'));
      }
      dispatch(
        setReplayStart({
          playerID: response.playerID,
          gameID: response.gameName,
          authKey: response.authKey,
          replayNumber
        })
      );
      navigate(`/game/play/${response.gameName}`, {
        state: { playerID: response.playerID } as GameLocationState
      });
    } catch (error) {
      toast.error(
        typeof error === 'string'
          ? error
          : error instanceof Error
          ? error.message
          : t('MATCH_HISTORY.WATCH_ERROR'),
        { position: 'top-center' }
      );
    }
  };

  return (
    <NavigationPage className={styles.page} title={t('MATCH_HISTORY.TITLE')}>
      <div className={styles.content}>
        {isError || data?.loggedIn === false ? (
          <p className={styles.status}>{t('MATCH_HISTORY.LOAD_ERROR')}</p>
        ) : data?.loggedIn && games.length === 0 ? (
          <p className={styles.status}>{t('MATCH_HISTORY.EMPTY')}</p>
        ) : null}
        <div className={styles.list}>
          {games.map((game, index) => {
            const opponent =
              game.opponentName || t('MATCH_HISTORY.UNKNOWN_OPPONENT');
            const heroes =
              game.heroName && game.opponentHeroName
                ? t('MATCH_HISTORY.HEROES', {
                    hero: game.heroName,
                    opponentHero: game.opponentHeroName
                  })
                : game.heroName || game.opponentHeroName;
            const savedReplayNumber = game.savedReplayNumber;
            return (
              <div key={`${game.endedAt}-${index}`} className={styles.row}>
                <span
                  className={`${styles.result} ${
                    game.won ? styles.win : styles.loss
                  }`}
                  title={
                    game.won
                      ? t('MATCH_HISTORY.WIN_LABEL')
                      : t('MATCH_HISTORY.LOSS_LABEL')
                  }
                >
                  {game.won ? t('MATCH_HISTORY.WIN') : t('MATCH_HISTORY.LOSS')}
                </span>
                <div className={styles.portraits} aria-hidden="true">
                  <HeroCrop heroId={game.heroCardId} />
                  <HeroCrop heroId={game.opponentHeroCardId} />
                </div>
                <div className={styles.info}>
                  <span className={styles.opponent}>
                    {t('MATCH_HISTORY.OPPONENT', { name: opponent })}
                  </span>
                  {heroes && (
                    <span className={styles.heroes} title={heroes}>
                      {heroes}
                    </span>
                  )}
                  <span className={styles.meta}>{playedLabel(game)}</span>
                </div>
                {savedReplayNumber ? (
                  <button
                    type="button"
                    className={styles.action}
                    onClick={() => watch(savedReplayNumber)}
                    disabled={isLoadingReplay}
                  >
                    <FaPlay aria-hidden="true" />
                    {t('MATCH_HISTORY.WATCH', {
                      number: savedReplayNumber
                    })}
                  </button>
                ) : game.canSaveReplay ? (
                  <Link to="/game/load" className={styles.action}>
                    <FaSave aria-hidden="true" />
                    {t('MATCH_HISTORY.SAVE_REPLAY')}
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </NavigationPage>
  );
};

export default MatchHistory;
