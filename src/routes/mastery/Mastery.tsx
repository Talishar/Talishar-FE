import React, { useMemo, useState } from 'react';
import { useGetHeroMasteryQuery } from 'features/api/apiSlice';
import { HEROES_OF_RATHE } from 'routes/index/components/filter/constants';
import { generateCroppedImageUrl } from 'utils/cropImages';
import MasteryFrame from 'features/mastery/MasteryFrame';
import PageBanner from 'components/PageBanner/PageBanner';
import {
  MASTERY_MILESTONES,
  emptyMastery,
  masteryTitle,
  progressStart
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

const Mastery = () => {
  const { data, isLoading, error } = useGetHeroMasteryQuery();
  const [filter, setFilter] = useState<Filter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('rank');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expandedHero, setExpandedHero] = useState<string | null>(null);
  const progress = useMemo(() => {
    const result = new Map(
      (data?.heroes ?? []).map((hero) => [hero.heroId, hero])
    );

    if (import.meta.env.DEV) {
      const milestones = data?.milestones ?? MASTERY_MILESTONES;
      (data?.heroGroups?.classicConstructed ?? []).forEach((heroId, index) => {
        const qualifyingGames = devGamesForHero(heroId, index, milestones);
        const level = milestones.filter(
          (threshold) => qualifyingGames >= threshold
        ).length;
        const nextThreshold = milestones[level] ?? null;
        result.set(heroId, {
          heroId,
          qualifyingGames,
          level,
          asset: null,
          nextThreshold,
          gamesToNext:
            nextThreshold === null ? null : nextThreshold - qualifyingGames
        });
      });
    }

    return result;
  }, [data]);

  const groups = useMemo(() => {
    const makeGroup = (name: string, heroIds: string[] = []) => {
      const legalIds = new Set(heroIds);
      return {
        name,
        heroes: HEROES_OF_RATHE.filter((hero) => legalIds.has(hero.value))
      };
    };

    return [
      makeGroup('Classic Constructed', data?.heroGroups?.classicConstructed),
      makeGroup('Silver Age', data?.heroGroups?.silverAge),
      makeGroup('Living Legend', data?.heroGroups?.livingLegend)
    ];
  }, [data?.heroGroups]);

  const availableHeroes = useMemo(() => {
    const unique = new Map(
      groups.flatMap((group) => group.heroes).map((hero) => [hero.value, hero])
    );
    return [...unique.values()];
  }, [groups]);

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

  const playedCount = availableHeroes.filter(
    (hero) => (progress.get(hero.value)?.qualifyingGames ?? 0) > 0
  ).length;

  return (
    <main className={styles.page}>
      <PageBanner
        title="Hero Mastery"
        subtitle="Every qualifying game adds to your story with that hero."
      />
      <div className={styles.content}>
        <p className={styles.betaNotice} role="note">
          <strong>Beta:</strong> Mastery frames are placeholders and will change
          as this feature develops.
        </p>
        <div className={styles.toolbar}>
          <p className={styles.collectionSummary}>
            <span>{playedCount}</span> of {availableHeroes.length} heroes played
          </p>
          <div className={styles.toolbarControls}>
            <label className={styles.sortControl}>
              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as SortOrder)
                }
                aria-label="Sort heroes"
              >
                <option value="rank">Rank / games played</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </label>
            <div
              className={styles.filters}
              role="group"
              aria-label="Filter heroes"
            >
              {(['all', 'played', 'mastered'] as Filter[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                  className={filter === value ? styles.activeFilter : ''}
                >
                  {value === 'all'
                    ? 'All heroes'
                    : value[0].toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading && <p className={styles.status}>Gathering your heroes…</p>}
        {error && (
          <p className={styles.status}>Hero Mastery could not be loaded.</p>
        )}

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
                </button>
                {!collapsed[group.name] &&
                  (heroes.length ? (
                    <div className={styles.grid}>
                      {heroes.map((hero) => {
                        const item =
                          progress.get(hero.value) ?? emptyMastery(hero.value);
                        const start = progressStart(
                          item.level,
                          data?.milestones
                        );
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
                        const nextMastery = masteryTitle(item.level + 1);
                        const gamesUntil =
                          item.gamesToNext === 1
                            ? `1 game until ${nextMastery}`
                            : `${item.gamesToNext} games until ${nextMastery}`;
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
                            onClick={() =>
                              setExpandedHero((current) =>
                                current === hero.value ? null : hero.value
                              )
                            }
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
                              {item.qualifyingGames.toLocaleString()}{' '}
                              {item.qualifyingGames === 1 ? 'game' : 'games'}
                            </span>
                            <div
                              className={styles.detail}
                              id={detailId}
                              role="tooltip"
                              data-maximum={isMaximum}
                            >
                              <strong>{hero.label}</strong>
                              <b>{masteryTitle(item.level)}</b>
                              {isMaximum ? (
                                <>
                                  <span className={styles.detailGames}>
                                    {item.qualifyingGames.toLocaleString()}{' '}
                                    games played
                                  </span>
                                  <em className={styles.maximumMessage}>
                                    Maximum Mastery reached
                                  </em>
                                </>
                              ) : (
                                <>
                                  <span className={styles.detailGames}>
                                    {item.qualifyingGames.toLocaleString()} /{' '}
                                    {item.nextThreshold?.toLocaleString()} games
                                  </span>
                                  <div
                                    className={styles.detailProgress}
                                    aria-label={`${item.qualifyingGames} of ${item.nextThreshold} games`}
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
                    <p className={styles.empty}>No heroes match this filter.</p>
                  ))}
              </section>
            );
          })}
      </div>
    </main>
  );
};

export default Mastery;
