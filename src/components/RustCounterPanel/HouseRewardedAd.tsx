import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import talisharBanner from 'img/Talishar-Banner-Ad-1.webp';
import { METAFY_TIER_MAP } from 'utils/patronIcons';
import styles from './HouseRewardedAd.module.css';

type HouseRewardedAdProps = {
  onRewardEarned: () => void;
};

type Tier = {
  name: string;
  image: string;
  monthlyPrice: number;
  annualPrice: number;
  savings: number;
};

const AD_DURATION_MS = 15_000;
const UPDATE_INTERVAL_MS = 250;

const TIERS: Tier[] = [
  {
    name: 'Fyendal Supporters',
    image: METAFY_TIER_MAP['Fyendal Supporters'].image,
    monthlyPrice: 5,
    annualPrice: 57,
    savings: 5
  },
  {
    name: 'Seers of Ophidia',
    image: METAFY_TIER_MAP['Seers of Ophidia'].image,
    monthlyPrice: 10,
    annualPrice: 108,
    savings: 10
  },
  {
    name: 'Arknight Shards',
    image: METAFY_TIER_MAP['Arknight Shards'].image,
    monthlyPrice: 15,
    annualPrice: 153,
    savings: 15
  }
];

const HouseRewardedAd = ({ onRewardEarned }: HouseRewardedAdProps) => {
  const [remainingMs, setRemainingMs] = useState(AD_DURATION_MS);
  const remainingMsRef = useRef(AD_DURATION_MS);
  const visibleSinceRef = useRef<number | null>(null);

  useEffect(() => {
    const updateRemainingTime = () => {
      if (visibleSinceRef.current === null) return;

      const now = Date.now();
      const elapsed = now - visibleSinceRef.current;
      visibleSinceRef.current = now;
      remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
      setRemainingMs(remainingMsRef.current);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateRemainingTime();
        visibleSinceRef.current = null;
        return;
      }

      visibleSinceRef.current = Date.now();
    };

    if (document.visibilityState === 'visible') {
      visibleSinceRef.current = Date.now();
    }

    const interval = window.setInterval(
      updateRemainingTime,
      UPDATE_INTERVAL_MS
    );
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const secondsRemaining = Math.ceil(remainingMs / 1000);
  const rewardReady = remainingMs <= 0;

  const handleClose = () => {
    if (!rewardReady) return;
    onRewardEarned();
  };

  return createPortal(
    <div className={styles.backdrop}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="house-ad-title"
        aria-describedby="house-ad-description"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          disabled={!rewardReady}
          aria-label={
            rewardReady
              ? 'Close and clear rust counters'
              : `Ad can be closed in ${secondsRemaining} seconds`
          }
        >
          {rewardReady ? <FaTimes aria-hidden="true" /> : secondsRemaining}
        </button>

        <a
          className={styles.bannerLink}
          href={TALISHAR_METAFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Become a Talishar member on Metafy"
        >
          <img
            className={styles.banner}
            src={talisharBanner}
            alt="Join Talishar on Metafy to remove ads"
          />
        </a>

        <div className={styles.content}>
          <header className={styles.header}>
            <h2 id="house-ad-title">Support Talishar</h2>
          </header>

          <ul className={styles.benefits} aria-label="Premium benefits">
            <li>Unlimited games anytime</li>
            <li>No rust counters</li>
            <li>No advertisements</li>
            <li>Extra customization</li>
          </ul>

          <div className={styles.tiers} aria-label="Membership options">
            {TIERS.map((tier) => (
              <a
                key={tier.name}
                className={styles.tier}
                href={TALISHAR_METAFY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.tierName}>
                  <img
                    className={styles.tierIcon}
                    src={tier.image}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{tier.name}</span>
                </span>
                <span className={styles.monthlyPrice}>
                  ${tier.monthlyPrice}
                  <small>/month</small>
                </span>
                <span className={styles.annualPrice}>
                  ${tier.annualPrice}/year
                </span>
                <span className={styles.savings}>
                  {tier.savings}% annual savings
                </span>
              </a>
            ))}
          </div>

          <button
            type="button"
            className={styles.rewardButton}
            onClick={handleClose}
            disabled={!rewardReady}
          >
            {rewardReady
              ? 'Continue - Clear Your Rust Counters!'
              : `Continue in ${secondsRemaining}s`}
          </button>
        </div>
      </section>
    </div>,
    document.getElementById('root') ?? document.body
  );
};

export default HouseRewardedAd;
