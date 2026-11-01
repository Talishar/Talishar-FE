import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaLock } from 'react-icons/fa';
import { useGetHeroMasteryQuery } from 'features/api/apiSlice';
import { HEROES_OF_RATHE } from 'routes/index/components/filter/constants';
import { generateCroppedImageUrl } from 'utils/cropImages';
import MasteryFrame from 'features/mastery/MasteryFrame';
import PageBanner from 'components/PageBanner/PageBanner';
import useAdScript from 'hooks/useAdScript';
import useSupporterStatus from 'hooks/useSupporterStatus';
import {
  MASTERY_MILESTONES,
  emptyMastery,
  progressStart,
  ROMAN_LEVELS
} from 'features/mastery/mastery';
import { HeroMasteryProgress } from 'interface/API/HeroMastery';
import styles from './Mastery.module.css';

type Filter = 'all' | 'played' | 'mastered';
type SortOrder = 'rank' | 'alphabetical';
type Hero = (typeof HEROES_OF_RATHE)[number];

const UNPLAYED_PREVIEW_COUNT = 8;
const CLOSEST_COUNT = 4;

const progressPercent = (item: HeroMasteryProgress, milestones: number[]) => {
  const start = progressStart(item.level, milestones);
  const end = item.nextThreshold ?? item.qualifyingGames;
  return end === start
    ? 100
    : Math.min(100, ((item.qualifyingGames - start) / (end - start)) * 100);
};

const Mastery = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetHeroMasteryQuery();
  const { showAds } = useSupporterStatus();
  useAdScript(showAds);
  const [filter, setFilter] = useState<Filter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('rank');
  const [activeGroupKey, setActiveGroupKey] = useState('classicConstructed');
  const [query, setQuery] = useState('');
  const [showUnplayed, setShowUnplayed] = useState(false);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [previewLevel, setPreviewLevel] = useState<number | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const milestones = data?.milestones ?? MASTERY_MILESTONES;
  const progress = useMemo(() => {
    return new Map((data?.heroes ?? []).map((hero) => [hero.heroId, hero]));
  }, [data?.heroes]);
  const mastery = (heroId: string) =>
    progress.get(heroId) ?? emptyMastery(heroId);

  const groups = useMemo(() => {
    const makeGroup = (key: string, name: string, heroIds: string[] = []) => {
      const legalIds = new Set(heroIds);
      return {
        key,
        name,
        heroes: HEROES_OF_RATHE.filter((hero) => legalIds.has(hero.value))
      };
    };

    return [
      makeGroup(
        'classicConstructed',
        t('MASTERY.GROUPS.CLASSIC_CONSTRUCTED'),
        data?.heroGroups?.classicConstructed
      ),
      makeGroup(
        'silverAge',
        t('MASTERY.GROUPS.SILVER_AGE'),
        data?.heroGroups?.silverAge
      ),
      makeGroup(
        'livingLegend',
        t('MASTERY.GROUPS.LIVING_LEGEND'),
        data?.heroGroups?.livingLegend
      )
    ].filter((group) => group.heroes.length > 0);
  }, [data?.heroGroups, t]);

  const heroById = useMemo(
    () => new Map(HEROES_OF_RATHE.map((hero) => [hero.value, hero])),
    []
  );

  const summary = useMemo(() => {
    const heroes = data?.heroes ?? [];
    const played = heroes.filter((hero) => hero.qualifyingGames > 0);
    const highest = played.reduce<HeroMasteryProgress | null>(
      (best, hero) =>
        hero.level > 0 &&
        (!best ||
          hero.level > best.level ||
          (hero.level === best.level &&
            hero.qualifyingGames > best.qualifyingGames))
          ? hero
          : best,
      null
    );
    const closest = played
      .filter((hero) => hero.gamesToNext !== null && heroById.has(hero.heroId))
      .sort(
        (left, right) =>
          (left.gamesToNext ?? 0) - (right.gamesToNext ?? 0) ||
          right.qualifyingGames - left.qualifyingGames
      )
      .slice(0, CLOSEST_COUNT);
    const groupTotals = groups.map((group) => {
      const groupHeroes = group.heroes.map(
        (hero) => progress.get(hero.value) ?? emptyMastery(hero.value)
      );
      return {
        key: group.key,
        name: group.name,
        total: group.heroes.length,
        played: groupHeroes.filter((hero) => hero.qualifyingGames > 0).length,
        games: groupHeroes.reduce((sum, hero) => sum + hero.qualifyingGames, 0)
      };
    });

    return {
      totalGames: played.reduce((sum, hero) => sum + hero.qualifyingGames, 0),
      heroesPlayed: played.length,
      highest,
      closest,
      groupTotals
    };
  }, [data?.heroes, groups, heroById, progress]);

  const groupOf = (heroId: string) =>
    groups.find((group) => group.heroes.some((hero) => hero.value === heroId));

  const activeGroup =
    groups.find((group) => group.key === activeGroupKey) ?? groups[0];
  const normalizedQuery = query.trim().toLowerCase();

  const sortHeroes = (heroes: Hero[]) =>
    [...heroes].sort((left, right) => {
      if (sortOrder === 'alphabetical') {
        return left.label.localeCompare(right.label);
      }

      const gamesDifference =
        mastery(right.value).qualifyingGames -
        mastery(left.value).qualifyingGames;
      return gamesDifference || left.label.localeCompare(right.label);
    });

  const matchingHeroes = sortHeroes(
    (activeGroup?.heroes ?? []).filter(
      (hero) =>
        !normalizedQuery || hero.label.toLowerCase().includes(normalizedQuery)
    )
  );
  const playedHeroes = matchingHeroes.filter((hero) => {
    const item = mastery(hero.value);
    if (item.qualifyingGames === 0) return false;
    return filter !== 'mastered' || item.level > 0;
  });
  const unplayedHeroes =
    filter === 'all'
      ? matchingHeroes.filter(
          (hero) => mastery(hero.value).qualifyingGames === 0
        )
      : [];
  const unplayedOpen = showUnplayed || normalizedQuery !== '';

  const selectedId =
    selectedHero &&
    activeGroup?.heroes.some((hero) => hero.value === selectedHero)
      ? selectedHero
      : playedHeroes[0]?.value ?? matchingHeroes[0]?.value ?? null;
  const selected = selectedId ? heroById.get(selectedId) : undefined;

  const selectHero = (heroId: string) => {
    setSelectedHero(heroId);
    setPreviewLevel(null);
    if (window.matchMedia('(max-width: 1000px)').matches) {
      detailRef.current?.scrollIntoView({ block: 'nearest' });
    }
  };

  const changeGroup = (key: string) => {
    setActiveGroupKey(key);
    setShowUnplayed(false);
    setPreviewLevel(null);
  };

  const gamesUntilLabel = (item: HeroMasteryProgress) =>
    t('MASTERY.GAMES_UNTIL', {
      count: item.gamesToNext ?? 0,
      mastery: t('MASTERY.LEVEL', { level: ROMAN_LEVELS[item.level + 1] })
    });

  const filterLabels: Record<Filter, string> = {
    all: t('MASTERY.FILTER.ALL'),
    played: t('MASTERY.FILTER.PLAYED'),
    mastered: t('MASTERY.FILTER.MASTERED')
  };

  const renderHero = (hero: Hero) => {
    const item = mastery(hero.value);
    const isSelected = hero.value === selectedId;
    return (
      <button
        type="button"
        className={styles.heroCard}
        key={hero.value}
        data-played={item.qualifyingGames > 0}
        data-mastered={item.level > 0}
        aria-pressed={isSelected}
        onClick={() => selectHero(hero.value)}
      >
        <MasteryFrame level={item.level} className={styles.portraitFrame}>
          <img
            src={generateCroppedImageUrl(hero.value)}
            alt=""
            loading="lazy"
          />
        </MasteryFrame>
        <strong>{hero.label}</strong>
        <span className={styles.gameCount}>
          {t('MASTERY.GAME_COUNT', {
            count: item.qualifyingGames,
            formattedCount: item.qualifyingGames.toLocaleString()
          })}
        </span>
        {item.qualifyingGames > 0 && item.nextThreshold !== null && (
          <span className={styles.tileProgress} aria-hidden="true">
            <i style={{ width: `${progressPercent(item, milestones)}%` }} />
          </span>
        )}
      </button>
    );
  };

  const renderDetail = () => {
    if (!selected) return null;
    const item = mastery(selected.value);
    const shownLevel = previewLevel ?? item.level;
    const isMaximum = item.nextThreshold === null;
    const portrait = generateCroppedImageUrl(selected.value);

    return (
      <aside
        ref={detailRef}
        className={styles.detailPanel}
        aria-label={t('MASTERY.DETAIL_LABEL')}
      >
        <div className={styles.detailHeader}>
          <MasteryFrame level={shownLevel} className={styles.detailPortrait}>
            <img src={portrait} alt="" />
          </MasteryFrame>
          <div className={styles.detailTitle}>
            <h2>{selected.label}</h2>
            <b>
              {item.level > 0
                ? t('MASTERY.LEVEL', { level: ROMAN_LEVELS[item.level] })
                : t('MASTERY.NO_FRAME_YET')}
            </b>
            <span className={styles.detailGames}>
              {t('MASTERY.GAMES_PLAYED', {
                count: item.qualifyingGames,
                formattedCount: item.qualifyingGames.toLocaleString()
              })}
            </span>
          </div>
        </div>

        {isMaximum ? (
          <em className={styles.maximumMessage}>
            {t('MASTERY.MAXIMUM_REACHED')}
          </em>
        ) : (
          <div>
            <div
              className={styles.detailProgress}
              aria-label={t('MASTERY.GAMES_PROGRESS_LABEL', {
                games: item.qualifyingGames,
                threshold: item.nextThreshold
              })}
            >
              <i style={{ width: `${progressPercent(item, milestones)}%` }} />
            </div>
            <div className={styles.detailProgressText}>
              <em className={styles.milestoneMessage}>
                {gamesUntilLabel(item)}
              </em>
              <span>
                {t('MASTERY.GAMES_PROGRESS', {
                  games: item.qualifyingGames.toLocaleString(),
                  threshold: item.nextThreshold?.toLocaleString()
                })}
              </span>
            </div>
          </div>
        )}

        <div className={styles.frameLadderHeader}>
          <h3>{t('MASTERY.FRAMES')}</h3>
          {previewLevel !== null && previewLevel !== item.level && (
            <button type="button" onClick={() => setPreviewLevel(null)}>
              {t('MASTERY.SHOW_CURRENT')}
            </button>
          )}
        </div>
        <p className={styles.frameHint}>
          {previewLevel !== null && previewLevel !== item.level
            ? t('MASTERY.PREVIEWING', { level: ROMAN_LEVELS[previewLevel] })
            : t('MASTERY.FRAMES_HINT')}
        </p>
        <div className={styles.frameLadder}>
          {milestones.map((threshold, index) => {
            const level = index + 1;
            const unlocked = item.level >= level;
            return (
              <button
                type="button"
                key={level}
                className={styles.frameOption}
                data-unlocked={unlocked}
                aria-pressed={shownLevel === level}
                aria-label={t('MASTERY.FRAME_OPTION', {
                  level: ROMAN_LEVELS[level],
                  count: threshold
                })}
                onClick={() =>
                  setPreviewLevel(level === item.level ? null : level)
                }
              >
                <MasteryFrame level={level} className={styles.previewFrame}>
                  <img src={portrait} alt="" loading="lazy" />
                </MasteryFrame>
                <span className={styles.frameLevel}>{ROMAN_LEVELS[level]}</span>
                <span className={styles.frameThreshold}>
                  {unlocked ? (
                    <FaCheck aria-hidden="true" />
                  ) : (
                    <FaLock aria-hidden="true" />
                  )}
                  {threshold.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    );
  };

  const highestHero = summary.highest
    ? heroById.get(summary.highest.heroId)
    : undefined;

  return (
    <main className={styles.page}>
      <PageBanner title={t('MASTERY.TITLE')} subtitle={t('MASTERY.SUBTITLE')} />
      <div className={styles.content}>
        {isLoading && <p className={styles.status}>{t('MASTERY.LOADING')}</p>}
        {error && <p className={styles.status}>{t('MASTERY.LOAD_ERROR')}</p>}

        {!isLoading && !error && (
          <>
            <div className={styles.summary}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>
                  {t('MASTERY.SUMMARY.GAMES_PLAYED')}
                </span>
                <strong className={styles.statValue}>
                  {summary.totalGames.toLocaleString()}
                </strong>
                <span className={styles.statNote}>
                  {summary.groupTotals
                    .filter((group) => group.games > 0)
                    .map((group) =>
                      t('MASTERY.SUMMARY.GROUP_GAMES', {
                        games: group.games.toLocaleString(),
                        group: group.name
                      })
                    )
                    .join(' · ')}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>
                  {t('MASTERY.SUMMARY.HEROES_PLAYED')}
                </span>
                <strong className={styles.statValue}>
                  {summary.heroesPlayed.toLocaleString()}
                </strong>
                <span className={styles.statNote}>
                  {summary.groupTotals
                    .map((group) =>
                      t('MASTERY.SUMMARY.GROUP_PLAYED', {
                        played: group.played,
                        total: group.total,
                        group: group.name
                      })
                    )
                    .join(' · ')}
                </span>
              </div>
              <div className={`${styles.stat} ${styles.highestStat}`}>
                {summary.highest && highestHero ? (
                  <>
                    <MasteryFrame
                      level={summary.highest.level}
                      className={styles.summaryFrame}
                    >
                      <img
                        src={generateCroppedImageUrl(highestHero.value)}
                        alt=""
                      />
                    </MasteryFrame>
                    <div>
                      <span className={styles.statLabel}>
                        {t('MASTERY.SUMMARY.HIGHEST_FRAME')}
                      </span>
                      <strong className={styles.statTitle}>
                        {t('MASTERY.LEVEL', {
                          level: ROMAN_LEVELS[summary.highest.level]
                        })}
                      </strong>
                      <span className={styles.statNote}>
                        {t('MASTERY.SUMMARY.HIGHEST_HERO', {
                          hero: highestHero.label,
                          count: summary.highest.qualifyingGames,
                          formattedCount:
                            summary.highest.qualifyingGames.toLocaleString()
                        })}
                      </span>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className={styles.statLabel}>
                      {t('MASTERY.SUMMARY.HIGHEST_FRAME')}
                    </span>
                    <strong className={styles.statTitle}>
                      {t('MASTERY.NO_FRAME_YET')}
                    </strong>
                    <span className={styles.statNote}>
                      {t('MASTERY.SUMMARY.FIRST_FRAME', {
                        count: milestones[0]
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {summary.closest.length > 0 && (
              <div className={styles.closest}>
                <h2>{t('MASTERY.SUMMARY.CLOSEST_TITLE')}</h2>
                <div className={styles.closestList}>
                  {summary.closest.map((item) => {
                    const hero = heroById.get(item.heroId);
                    if (!hero) return null;
                    const group = groupOf(item.heroId);
                    return (
                      <button
                        type="button"
                        key={item.heroId}
                        className={styles.closestItem}
                        onClick={() => {
                          if (group) changeGroup(group.key);
                          selectHero(item.heroId);
                        }}
                      >
                        <MasteryFrame
                          level={item.level}
                          className={styles.closestFrame}
                        >
                          <img
                            src={generateCroppedImageUrl(item.heroId)}
                            alt=""
                            loading="lazy"
                          />
                        </MasteryFrame>
                        <span className={styles.closestText}>
                          <span className={styles.closestName}>
                            <strong>{hero.label}</strong>
                            {group && <small>{group.name}</small>}
                          </span>
                          <span
                            className={styles.detailProgress}
                            aria-hidden="true"
                          >
                            <i
                              style={{
                                width: `${progressPercent(item, milestones)}%`
                              }}
                            />
                          </span>
                          <span className={styles.closestMeta}>
                            <em>{gamesUntilLabel(item)}</em>
                            <span>
                              {item.qualifyingGames.toLocaleString()} /{' '}
                              {item.nextThreshold?.toLocaleString()}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.toolbar}>
              <div
                className={styles.formatTabs}
                role="group"
                aria-label={t('MASTERY.FORMAT_LABEL')}
              >
                {summary.groupTotals.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    aria-pressed={group.key === activeGroup?.key}
                    className={
                      group.key === activeGroup?.key ? styles.activeTab : ''
                    }
                    onClick={() => changeGroup(group.key)}
                  >
                    {group.name}
                    <small>
                      {group.played} / {group.total}
                    </small>
                  </button>
                ))}
              </div>
              <div className={styles.toolbarControls}>
                <input
                  type="search"
                  className={styles.searchControl}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('MASTERY.SEARCH_PLACEHOLDER')}
                  aria-label={t('MASTERY.SEARCH_LABEL')}
                />
                <label className={styles.sortControl}>
                  <select
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value as SortOrder)
                    }
                    aria-label={t('MASTERY.SORT.LABEL')}
                  >
                    <option value="rank">{t('MASTERY.SORT.RANK')}</option>
                    <option value="alphabetical">
                      {t('MASTERY.SORT.ALPHABETICAL')}
                    </option>
                  </select>
                </label>
                <div
                  className={styles.filters}
                  role="group"
                  aria-label={t('MASTERY.FILTER.LABEL')}
                >
                  {(['all', 'played', 'mastered'] as Filter[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={filter === value}
                      onClick={() => setFilter(value)}
                      className={filter === value ? styles.activeFilter : ''}
                    >
                      {filterLabels[value]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.layout}>
              <div className={styles.heroes}>
                {playedHeroes.length > 0 ? (
                  <div className={styles.grid}>
                    {playedHeroes.map(renderHero)}
                  </div>
                ) : (
                  <p className={styles.empty}>
                    {normalizedQuery || filter !== 'all'
                      ? t('MASTERY.EMPTY')
                      : t('MASTERY.NONE_PLAYED', {
                          group: activeGroup?.name
                        })}
                  </p>
                )}

                {unplayedHeroes.length > 0 &&
                  (unplayedOpen ? (
                    <>
                      <div className={styles.unplayedHeading}>
                        <span>
                          {t('MASTERY.UNPLAYED', {
                            count: unplayedHeroes.length
                          })}
                        </span>
                        {!normalizedQuery && (
                          <button
                            type="button"
                            onClick={() => setShowUnplayed(false)}
                            aria-expanded="true"
                          >
                            {t('MASTERY.HIDE_UNPLAYED')}
                          </button>
                        )}
                      </div>
                      <div className={styles.grid}>
                        {unplayedHeroes.map(renderHero)}
                      </div>
                    </>
                  ) : (
                    <div className={styles.unplayedStrip}>
                      <span
                        className={styles.unplayedPortraits}
                        aria-hidden="true"
                      >
                        {unplayedHeroes
                          .slice(0, UNPLAYED_PREVIEW_COUNT)
                          .map((hero) => (
                            <img
                              key={hero.value}
                              src={generateCroppedImageUrl(hero.value)}
                              alt=""
                              loading="lazy"
                            />
                          ))}
                      </span>
                      <span className={styles.unplayedLabel}>
                        {t('MASTERY.UNPLAYED', {
                          count: unplayedHeroes.length
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowUnplayed(true)}
                        aria-expanded="false"
                      >
                        {t('MASTERY.SHOW_UNPLAYED')}
                      </button>
                    </div>
                  ))}
              </div>
              {renderDetail()}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Mastery;
