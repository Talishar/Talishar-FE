import { useState } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import useAuth from 'hooks/useAuth';
import { useGetUserProfileQuery } from 'features/api/apiSlice';
import useAdScript from 'hooks/useAdScript';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import { METAFY_TIER_MAP, MetafyTierName } from 'utils/patronIcons';
import styles from './Premium.module.scss';

interface Tier {
  name: string;
  image: string;
  monthlyPrice: number;
  yearlyDiscount: number;
  recommended?: boolean;
  benefits: string[];
}

const tiers: Tier[] = [
  {
    name: 'Fyendal Supporters',
    image: METAFY_TIER_MAP['Fyendal Supporters'].image,
    monthlyPrice: 5,
    yearlyDiscount: 0.05,
    benefits: [
      '8 Free Guides',
      'General support',
      'Alt Arts on Talishar',
      'Talishar Sleeves & Playmats',
      'Custom Themes on Talishar',
      'Heart of Fyendal In-Game Badge',
      'No Ads on Talishar',
      'Exclusive access to 1 channel',
      'Discord role'
    ]
  },
  {
    name: 'Seers of Ophidia',
    image: METAFY_TIER_MAP['Seers of Ophidia'].image,
    monthlyPrice: 10,
    yearlyDiscount: 0.1,
    recommended: true,
    benefits: [
      '8 Free Guides',
      'General support',
      'Alt Arts on Talishar',
      'Talishar Sleeves & Playmats',
      'Custom Themes on Talishar',
      'Eye of Ophidia In-Game Badge',
      'Extra Leaderboard Points',
      'No Ads on Talishar',
      'Exclusive access to 1 channel',
      'Discord role'
    ]
  },
  {
    name: 'Arknight Shards',
    image: METAFY_TIER_MAP['Arknight Shards'].image,
    monthlyPrice: 15,
    yearlyDiscount: 0.15,
    benefits: [
      '8 Free Guides',
      'General support',
      'Alt Arts on Talishar',
      'Talishar Sleeves & Playmats',
      'Custom Themes on Talishar',
      'Arknight Shards In-Game Badge',
      'More Extra Leaderboard Points',
      'No Ads on Talishar',
      'Exclusive access to 2 channels',
      'Discord role'
    ]
  },
  {
    name: 'Light of Sol Gemini Circle',
    image: METAFY_TIER_MAP['Light of Sol Gemini Circle'].image,
    monthlyPrice: 20,
    yearlyDiscount: 0.15,
    benefits: [
      '8 Free Guides',
      'General support',
      'Alt Arts on Talishar',
      'Talishar Sleeves & Playmats',
      'Custom Themes on Talishar',
      'Light of Sol In-Game Badge',
      'Extra Extra Leaderboard Points',
      'No Ads on Talishar',
      'Exclusive access to 2 channels',
      'Discord role'
    ]
  },
  {
    name: 'Champion of Grandeur',
    image: METAFY_TIER_MAP['Lover of Grandeur' as MetafyTierName].image,
    monthlyPrice: 35,
    yearlyDiscount: 0.15,
    benefits: [
      '8 Free Guides',
      'General support',
      'Alt Arts on Talishar',
      'Talishar Sleeves & Playmats',
      'Custom Themes on Talishar',
      'Grandeur of Valahai In-Game Badge',
      'Even More Extra Leaderboard Points',
      '50% off Events',
      'Access to weekly Group Classes and Office Hour',
      'No Ads on Talishar',
      'Exclusive access to 2 channels',
      'Discord role'
    ]
  },
  {
    name: 'Sponsors of Trōpal-Dhani',
    image: METAFY_TIER_MAP['Sponsors of Trōpal-Dhani'].image,
    monthlyPrice: 50,
    yearlyDiscount: 0.20,
    benefits: [
      '8 Free Guides',
      'General support',
      'Alt Arts on Talishar',
      'Talishar Sleeves & Playmats',
      'Custom Themes on Talishar',
      'Riches of Trōpal-Dhani In-Game Badge',
      'Tons of Extra Leaderboard Points',
      '50% off Events',
      'Access to weekly Group Classes and Office Hour',
      'No Ads on Talishar',
      'Exclusive access to 2 channels',
      'Discord role'
    ]
  }
];

const comparisonFeatures = [
  { label: 'Play games online', free: true, premium: true },
  { label: 'Alt Arts on Talishar', free: false, premium: true },
  { label: 'Talishar Sleeves & Playmats', free: false, premium: true },
  { label: 'In-Game Badge', free: false, premium: true },
  { label: 'Custom Themes on Talishar', free: false, premium: true },
  { label: 'No Ads', free: false, premium: true },
  { label: 'Discord role', free: false, premium: true },
  { label: 'Exclusive channels & posts', free: false, premium: true },
  { label: 'Free Guides', free: false, premium: true },
  { label: 'Extra Leaderboard Points', free: false, premium: '$10+' },
  { label: 'Weekly Group Classes & Office Hour', free: false, premium: '$35+' }
];

const Premium = () => {
  usePageTitle('Premium');
  const { isLoggedIn, isLoading } = useAuth();
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery(
    undefined,
    { skip: !isLoggedIn }
  );
  const isSupporter = isLoggedIn
    ? isProfileLoading
      ? true
      : (profileData?.isMetafySupporter ?? false)
    : false;
  const showAds = !isLoading && !isSupporter;
  useAdScript(showAds);

  const [yearly, setYearly] = useState(false);

  const formatPrice = (tier: Tier) => {
    if (yearly) {
      const yearlyTotal = tier.monthlyPrice * 12;
      const discounted = Math.round(yearlyTotal * (1 - tier.yearlyDiscount));
      return { display: `$${discounted}`, interval: '/year', original: `$${yearlyTotal}` };
    }
    return { display: `$${tier.monthlyPrice}`, interval: '/month', original: null };
  };

  return (
    <div className={styles.premiumPage}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1>Support Talishar</h1>
          <p>Unlock more features and get the most advanced experience!</p>
        </div>

        <div className={styles.billingToggle}>
          <span className={!yearly ? styles.activeLabel : undefined}>Monthly</span>
          <button
            className={styles.toggleTrack}
            onClick={() => setYearly(!yearly)}
            aria-label="Toggle yearly billing"
          >
            <div className={`${styles.toggleKnob} ${yearly ? styles.yearly : ''}`} />
          </button>
          <span className={yearly ? styles.activeLabel : undefined}>Yearly</span>
          <span className={styles.saveBadge}>Save up to 15%</span>
        </div>

        <div className={styles.tierGrid}>
          {tiers.map((tier) => {
            const { display, interval, original } = formatPrice(tier);
            return (
              <div
                key={tier.name}
                className={`${styles.tierCard} ${tier.recommended ? styles.recommended : ''}`}
              >
                {tier.recommended && (
                  <span className={styles.recommendedBadge}>Recommended</span>
                )}
                <div className={styles.tierHeader}>
                  <img
                    src={tier.image}
                    alt={tier.name}
                    className={styles.tierImage}
                  />
                  <div className={styles.tierName}>{tier.name}</div>
                </div>
                <div className={styles.price}>
                  <span className={styles.priceAmount}>{display}</span>
                  <span className={styles.priceInterval}>{interval}</span>
                  {original && (
                    <span className={styles.originalPriceLine}>
                      <span className={styles.originalPrice}>{original}</span>
                      <span className={styles.discountTag}>
                        -{Math.round(tier.yearlyDiscount * 100)}%
                      </span>
                    </span>
                  )}
                </div>
                <a
                  href={TALISHAR_METAFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.upgradeBtn}
                >
                  Upgrade
                </a>
                <ul className={styles.benefits}>
                  {tier.benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className={styles.comparisonSection}>
          <h2>Free vs Premium</h2>
          <p className={styles.comparisonSubtitle}>
            See what you get with a premium membership
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th className={styles.highlighted}>Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f) => (
                  <tr key={f.label}>
                    <td>{f.label}</td>
                    <td>
                      {f.free === true ? (
                        <span className={styles.check}>✓</span>
                      ) : (
                        <span className={styles.cross}>—</span>
                      )}
                    </td>
                    <td>
                      {f.premium === true ? (
                        <span className={styles.check}>✓</span>
                      ) : typeof f.premium === 'string' ? (
                        <span className={styles.check}>{f.premium}</span>
                      ) : (
                        <span className={styles.cross}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h2>Ready to upgrade?</h2>
          <p>Join hundreds of supporters keeping Talishar running and thriving.</p>
          <a
            href={TALISHAR_METAFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            Become a Supporter
          </a>
        </div>
      </div>
    </div>
  );
};

export default Premium;
