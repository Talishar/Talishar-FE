import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useGetHeroMasteryQuery } from 'features/api/apiSlice';
import { HEROES_OF_RATHE } from 'routes/index/components/filter/constants';
import { generateCroppedImageUrl } from 'utils/cropImages';
import MasteryFrame from 'features/mastery/MasteryFrame';
import PageBanner from 'components/PageBanner/PageBanner';
import {
  MASTERY_MILESTONES,
  emptyMastery,
  masteryLevel,
  progressStart,
  ROMAN_LEVELS
} from 'features/mastery/mastery';
import styles from './Mastery.module.css';

type Filter = 'all' | 'played' | 'mastered';
type SortOrder = 'rank' | 'alphabetical';

const seededNumber = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const devGamesForHero = (
  heroId: string,
  index: number,
  milestones: number[]
) => {
  const rankBand = index % (milestones.length + 1);
  const minimum = rankBand === 0 ? 0 : milestones[rankBand - 1];
  const maximum = milestones[rankBand] ?? minimum + 500;
  return minimum + (seededNumber(heroId) % Math.max(1, maximum - minimum));
};

/* Keep a hero's detail popup inside the grid; edge columns would otherwise
   centre it off the side of the screen. */
const alignDetail = (card: HTMLElement) => {
  const detail = card.querySelector<HTMLElement>(`.${styles.detail}`);
  const grid = card.parentElement;
  if (!detail || !grid) return;

  card.style.setProperty('--detail-shift', '0px');
  const bounds = grid.getBoundingClientRect();
  const rect = detail.getBoundingClientRect();
  const overflowLeft = bounds.left - rect.left;
  const overflowRight = rect.right - bounds.right;
  const shift =
    overflowLeft > 0 ? overflowLeft : overflowRight > 0 ? -overflowRight : 0;
  card.style.setProperty('--detail-shift', `${Math.round(shift)}px`);
};

const Mastery = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetHeroMasteryQuery();
  const [filter, setFilter] = useState<Filter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('rank');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedHero, setExpandedHero] = useState<string | null>(null);
  const milestones = import.meta.env.DEV
    ? MASTERY_MILESTONES
    : data?.milestones ?? MASTERY_MILESTONES;
  const progress = useMemo(() => {
    const result = new Map(
      (data?.heroes ?? []).map((hero) => [hero.heroId, hero])
    );

    if (import.meta.env.DEV) {
      (data?.heroGroups?.classicConstructed ?? []).forEach((heroId, index) => {
        const qualifyingGames = devGamesForHero(heroId, index, milestones);
        const level = masteryLevel(qualifyingGames, milestones);
        const nextThreshold = milestones[level] ?? null;
        result.set(heroId, {
          heroId,
          qualifyingGames,
          level,
          displayLevel: null,
          frameLevel: level,
          asset: null,
          nextThreshold,
          gamesToNext:
            nextThreshold === null ? null : nextThreshold - qualifyingGames
        });
      });
    }

    return result;
  }, [data, milestones]);

  const groups = useMemo(() => {
    const makeGroup = (name: string, heroIds: string[] = []) => {
      const legalIds = new Set(heroIds);
      return {
        name,
        heroes: HEROES_OF_RATHE.filter((hero) => legalIds.has(hero.value))
      };
    };

    return [
      makeGroup(
        t('MASTERY.GROUPS.CLASSIC_CONSTRUCTED'),
        data?.heroGroups?.classicConstructed
      ),
      makeGroup(t('MASTERY.GROUPS.SILVER_AGE'), data?.heroGroups?.silverAge),
      makeGroup(
        t('MASTERY.GROUPS.LIVING_LEGEND'),
        data?.heroGroups?.livingLegend
      )
    ];
  }, [data?.heroGroups, t]);

  const playedCount = (heroes: { value: string }[]) =>
    heroes.filter(
      (hero) => (progress.get(hero.value)?.qualifyingGames ?? 0) > 0
    ).length;

  const visible = (heroId: string) => {
    const games = progress.get(heroId)?.qualifyingGames ?? 0;
    if (filter === 'played') return games > 0;
    if (filter === 'mastered') return (progress.get(heroId)?.level ?? 0) > 0;
    return true;
  };

  const sortHeroes = <T extends { value: string; label: string }>(
    heroes: T[]
  ) =>
    [...heroes].sort((left, right) => {
      if (sortOrder === 'alphabetical') {
        return left.label.localeCompare(right.label);
      }

      const gamesDifference =
        (progress.get(right.value)?.qualifyingGames ?? 0) -
        (progress.get(left.value)?.qualifyingGames ?? 0);
      return gamesDifference || left.label.localeCompare(right.label);
    });

  const filterLabels: Record<Filter, string> = {
    all: t('MASTERY.FILTER.ALL'),
    played: t('MASTERY.FILTER.PLAYED'),
    mastered: t('MASTERY.FILTER.MASTERED')
  };

  return (
    <main className={styles.page}>
      <PageBanner title={t('MASTERY.TITLE')} subtitle={t('MASTERY.SUBTITLE')} />
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <p className={styles.betaNotice} role="note">
            <Trans
              i18nKey="MASTERY.BETA_NOTICE"
              components={{ strong: <strong /> }}
            />
          </p>
          <div className={styles.toolbarControls}>
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

        {isLoading && <p className={styles.status}>{t('MASTERY.LOADING')}</p>}
        {error && <p className={styles.status}>{t('MASTERY.LOAD_ERROR')}</p>}

        {!isLoading &&
          !error &&
          groups.map((group) => {
            const heroes = sortHeroes(
              group.heroes.filter((hero) => visible(hero.value))
            );
            return (
              <section className={styles.group} key={group.name}>
                <button
                  type="button"
                  className={styles.groupHeading}
                  onClick={() =>
                    setCollapsed((current) => ({
                      ...current,
                      [group.name]: !current[group.name]
                    }))
                  }
                  aria-expanded={!collapsed[group.name]}
                >
                  <svg
                    className={styles.collapseIcon}
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M4 8h8" />
                    {collapsed[group.name] && <path d="M8 4v8" />}
                  </svg>
                  <b>{group.name}</b> <small>({heroes.length})</small>
                  <span className={styles.groupSummary}>
                    <Trans
                      i18nKey="MASTERY.COLLECTION_SUMMARY"
                      values={{
                        played: playedCount(group.heroes),
                        total: group.heroes.length
                      }}
                      components={{ count: <span /> }}
                    />
                  </span>
                </button>
                {!collapsed[group.name] &&
                  (heroes.length ? (
                    <div className={styles.grid}>
                      {heroes.map((hero) => {
                        const item =
                          progress.get(hero.value) ?? emptyMastery(hero.value);
                        const start = progressStart(item.level, milestones);
                        const end = item.nextThreshold ?? item.qualifyingGames;
                        const percent =
                          end === start
                            ? 100
                            : Math.min(
                                100,
                                ((item.qualifyingGames - start) /
                                  (end - start)) *
                                  100
                              );
                        const nextMastery = t('MASTERY.LEVEL', {
                          level: ROMAN_LEVELS[item.level + 1]
                        });
                        const gamesUntil =
                          item.gamesToNext === 1
                            ? t('MASTERY.GAMES_UNTIL', {
                                count: 1,
                                mastery: nextMastery
                              })
                            : t('MASTERY.GAMES_UNTIL', {
                                count: item.gamesToNext,
                                mastery: nextMastery
                              });
                        const isMaximum = item.nextThreshold === null;
                        const detailId = `mastery-detail-${hero.value}`;
                        return (
                          <article
                            className={styles.heroCard}
                            key={hero.value}
                            tabIndex={0}
                            data-played={item.qualifyingGames > 0}
                            data-mastered={item.level > 0}
                            data-expanded={expandedHero === hero.value}
                            aria-describedby={detailId}
                            aria-expanded={expandedHero === hero.value}
                            onMouseEnter={(event) =>
                              alignDetail(event.currentTarget)
                            }
                            onFocus={(event) => alignDetail(event.currentTarget)}
                            onClick={(event) => {
                              alignDetail(event.currentTarget);
                              setExpandedHero((current) =>
                                current === hero.value ? null : hero.value
                              );
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Escape') setExpandedHero(null);
                            }}
                          >
                            <MasteryFrame
                              level={item.level}
                              className={styles.portraitFrame}
                            >
                              <img
                                src={generateCroppedImageUrl(hero.value)}
                                alt={hero.label}
                                loading="lazy"
                              />
                            </MasteryFrame>
                            <strong title={hero.label}>{hero.label}</strong>
                            <span className={styles.gameCount}>
                              {t('MASTERY.GAME_COUNT', {
                                count: item.qualifyingGames,
                                formattedCount:
                                  item.qualifyingGames.toLocaleString()
                              })}
                            </span>
                            <div
                              className={styles.detail}
                              id={detailId}
                              role="tooltip"
                              data-maximum={isMaximum}
                            >
                              <strong>{hero.label}</strong>
                              <b>
                                {item.level > 0
                                  ? t('MASTERY.LEVEL', {
                                      level: ROMAN_LEVELS[item.level]
                                    })
                                  : t('MASTERY.TITLE')}
                              </b>
                              {isMaximum ? (
                                <>
                                  <span className={styles.detailGames}>
                                    {t('MASTERY.GAMES_PLAYED', {
                                      count: item.qualifyingGames,
                                      formattedCount:
                                        item.qualifyingGames.toLocaleString()
                                    })}
                                  </span>
                                  <em className={styles.maximumMessage}>
                                    {t('MASTERY.MAXIMUM_REACHED')}
                                  </em>
                                </>
                              ) : (
                                <>
                                  <span className={styles.detailGames}>
                                    {t('MASTERY.GAMES_PROGRESS', {
                                      games:
                                        item.qualifyingGames.toLocaleString(),
                                      threshold:
                                        item.nextThreshold?.toLocaleString()
                                    })}
                                  </span>
                                  <div
                                    className={styles.detailProgress}
                                    aria-label={t(
                                      'MASTERY.GAMES_PROGRESS_LABEL',
                                      {
                                        games: item.qualifyingGames,
                                        threshold: item.nextThreshold
                                      }
                                    )}
                                  >
                                    <i style={{ width: `${percent}%` }} />
                                  </div>
                                  <em className={styles.milestoneMessage}>
                                    {gamesUntil}
                                  </em>
                                </>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.empty}>{t('MASTERY.EMPTY')}</p>
                  ))}
              </section>
            );
          })}
      </div>
    </main>
  );
};

export default Mastery;
