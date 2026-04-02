import React, { useEffect, useState } from 'react';
import styles from './ContributorLeaderboard.module.css';

interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

interface MergedContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  totalContributions: number;
  backendContributions: number;
  frontendContributions: number;
}

const BACKEND_REPO = 'Talishar/Talishar';
const FRONTEND_REPO = 'Talishar/Talishar-FE';
const PER_PAGE = 100;
const CACHE_KEY = 'talishar_contributors_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ContributorCache {
  timestamp: number;
  contributors: MergedContributor[];
}

function loadCache(): MergedContributor[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: ContributorCache = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.contributors;
  } catch {
    return null;
  }
}

function saveCache(contributors: MergedContributor[]): void {
  try {
    const cache: ContributorCache = { timestamp: Date.now(), contributors };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage may be unavailable (private browsing quota)
  }
}

async function fetchContributors(repo: string): Promise<GitHubContributor[]> {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contributors?per_page=${PER_PAGE}&anon=false`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) return [];
  return res.json();
}

function mergeContributors(
  backend: GitHubContributor[],
  frontend: GitHubContributor[]
): MergedContributor[] {
  const map = new Map<string, MergedContributor>();

  for (const c of backend) {
    if (c.type === 'Bot') continue;
    map.set(c.login, {
      login: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      totalContributions: c.contributions,
      backendContributions: c.contributions,
      frontendContributions: 0,
    });
  }

  for (const c of frontend) {
    if (c.type === 'Bot') continue;
    if (map.has(c.login)) {
      const existing = map.get(c.login)!;
      existing.totalContributions += c.contributions;
      existing.frontendContributions = c.contributions;
    } else {
      map.set(c.login, {
        login: c.login,
        avatar_url: c.avatar_url,
        html_url: c.html_url,
        totalContributions: c.contributions,
        backendContributions: 0,
        frontendContributions: c.contributions,
      });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.totalContributions - a.totalContributions
  );
}

const MEDAL = ['🥇', '🥈', '🥉'];

const ContributorLeaderboard: React.FC = () => {
  const [contributors, setContributors] = useState<MergedContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const cached = loadCache();
    if (cached) {
      setContributors(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    Promise.all([
      fetchContributors(BACKEND_REPO),
      fetchContributors(FRONTEND_REPO),
    ])
      .then(([backend, frontend]) => {
        if (cancelled) return;
        const merged = mergeContributors(backend, frontend);
        saveCache(merged);
        setContributors(merged);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const INITIAL_DISPLAY = 20;
  const displayed = showAll ? contributors : contributors.slice(0, INITIAL_DISPLAY);

  if (loading) {
    return (
      <div className={styles.leaderboardContainer}>
        <div className={styles.loadingState}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>Loading contributors…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.leaderboardContainer}>
        <p className={styles.errorState}>
          Could not load contributor data — GitHub API may be rate-limited. Try again later.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.grid}>
        {displayed.map((c, index) => (
          <a
            key={c.login}
            href={c.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
            title={`${c.login} — ${c.totalContributions.toLocaleString()} total commits`}
          >
            <div className={styles.rankBadge}>
              {index < 3 ? (
                <span className={styles.medal} aria-label={`Rank ${index + 1}`}>
                  {MEDAL[index]}
                </span>
              ) : (
                <span className={styles.rankNumber}>#{index + 1}</span>
              )}
            </div>
            <img
              src={c.avatar_url}
              alt={`${c.login}'s avatar`}
              className={styles.avatar}
              loading="lazy"
              width={56}
              height={56}
            />
            <div className={styles.info}>
              <span className={styles.username}>{c.login}</span>
              <span className={styles.contributions}>
                {c.totalContributions.toLocaleString()} commits
              </span>
              {c.backendContributions > 0 && c.frontendContributions > 0 && (
                <span className={styles.breakdown}>
                  BE: {c.backendContributions.toLocaleString()} · FE: {c.frontendContributions.toLocaleString()}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>

      {contributors.length > INITIAL_DISPLAY && (
        <button
          className={styles.showMoreButton}
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll
            ? 'Show fewer contributors'
            : `Show all ${contributors.length} contributors`}
        </button>
      )}

      <p className={styles.footnote}>Contributions combined from{' '}
        <a
          href={`https://github.com/${BACKEND_REPO}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Talishar (backend)
        </a>{' '}
        and{' '}
        <a
          href={`https://github.com/${FRONTEND_REPO}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Talishar-FE (frontend)
        </a>
        . Data fetched from the GitHub API.
      </p>
    </div>
  );
};

export default ContributorLeaderboard;
