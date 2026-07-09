import { useState } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import useAuth from 'hooks/useAuth';
import { useGetUserProfileQuery } from 'features/api/apiSlice';
import useAdScript from 'hooks/useAdScript';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import { METAFY_TIER_MAP, MetafyTierName } from 'utils/patronIcons';
import { useTranslation } from 'react-i18next';
import styles from './Premium.module.scss';

interface Tier {
  name: string;
  image: string;
  monthlyPrice: number;
  yearlyDiscount: number;
  recommended?: boolean;
  benefits: string[];
}

const Premium = () => {
  const { t } = useTranslation();
  usePageTitle(t('PREMIUM_PAGE.PAGE_TITLE'));

  const tiers: Tier[] = [
    {
      name: t('PREMIUM_PAGE.TIERS.FYENDAL_SUPPORTERS'),
      image: METAFY_TIER_MAP['Fyendal Supporters'].image,
      monthlyPrice: 5,
      yearlyDiscount: 0.05,
      benefits: [
        t('PREMIUM_PAGE.BENEFITS.FREE_GUIDES'),
        t('PREMIUM_PAGE.BENEFITS.GENERAL_SUPPORT'),
        t('PREMIUM_PAGE.BENEFITS.NO_RUST_COUNTERS'),
        t('PREMIUM_PAGE.BENEFITS.ALT_ARTS'),
        t('PREMIUM_PAGE.BENEFITS.SLEEVES_PLAYMATS'),
        t('PREMIUM_PAGE.BENEFITS.CUSTOM_THEMES'),
        t('PREMIUM_PAGE.BENEFITS.FYENDAL_BADGE'),
        t('PREMIUM_PAGE.BENEFITS.NO_ADS'),
        t('PREMIUM_PAGE.BENEFITS.REPLAY_SAVE_SLOTS_5'),
        t('PREMIUM_PAGE.BENEFITS.EXCLUSIVE_CHANNELS_1'),
        t('PREMIUM_PAGE.BENEFITS.DISCORD_ROLE')
      ]
    },
    {
      name: t('PREMIUM_PAGE.TIERS.SEERS_OF_OPHIDIA'),
      image: METAFY_TIER_MAP['Seers of Ophidia'].image,
      monthlyPrice: 10,
      yearlyDiscount: 0.1,
      recommended: true,
      benefits: [
        t('PREMIUM_PAGE.BENEFITS.FREE_GUIDES'),
        t('PREMIUM_PAGE.BENEFITS.GENERAL_SUPPORT'),
        t('PREMIUM_PAGE.BENEFITS.NO_RUST_COUNTERS'),
        t('PREMIUM_PAGE.BENEFITS.ALT_ARTS'),
        t('PREMIUM_PAGE.BENEFITS.SLEEVES_PLAYMATS'),
        t('PREMIUM_PAGE.BENEFITS.CUSTOM_THEMES'),
        t('PREMIUM_PAGE.BENEFITS.OPHIDIA_BADGE'),
        t('PREMIUM_PAGE.BENEFITS.EXTRA_LEADERBOARD_POINTS'),
        t('PREMIUM_PAGE.BENEFITS.NO_ADS'),
        t('PREMIUM_PAGE.BENEFITS.REPLAY_SAVE_SLOTS_8'),
        t('PREMIUM_PAGE.BENEFITS.EXCLUSIVE_CHANNELS_1'),
        t('PREMIUM_PAGE.BENEFITS.DISCORD_ROLE')
      ]
    },
    {
      name: t('PREMIUM_PAGE.TIERS.ARKNIGHT_SHARDS'),
      image: METAFY_TIER_MAP['Arknight Shards'].image,
      monthlyPrice: 15,
      yearlyDiscount: 0.15,
      benefits: [
        t('PREMIUM_PAGE.BENEFITS.FREE_GUIDES'),
        t('PREMIUM_PAGE.BENEFITS.GENERAL_SUPPORT'),
        t('PREMIUM_PAGE.BENEFITS.NO_RUST_COUNTERS'),
        t('PREMIUM_PAGE.BENEFITS.ALT_ARTS'),
        t('PREMIUM_PAGE.BENEFITS.SLEEVES_PLAYMATS'),
        t('PREMIUM_PAGE.BENEFITS.CUSTOM_THEMES'),
        t('PREMIUM_PAGE.BENEFITS.ARKNIGHT_BADGE'),
        t('PREMIUM_PAGE.BENEFITS.MORE_EXTRA_LEADERBOARD'),
        t('PREMIUM_PAGE.BENEFITS.NO_ADS'),
        t('PREMIUM_PAGE.BENEFITS.REPLAY_SAVE_SLOTS_10'),
        t('PREMIUM_PAGE.BENEFITS.EXCLUSIVE_CHANNELS_2'),
        t('PREMIUM_PAGE.BENEFITS.DISCORD_ROLE')
      ]
    },
    {
      name: t('PREMIUM_PAGE.TIERS.LIGHT_OF_SOL'),
      image: METAFY_TIER_MAP['Light of Sol Gemini Circle'].image,
      monthlyPrice: 20,
      yearlyDiscount: 0.15,
      benefits: [
        t('PREMIUM_PAGE.BENEFITS.FREE_GUIDES'),
        t('PREMIUM_PAGE.BENEFITS.GENERAL_SUPPORT'),
        t('PREMIUM_PAGE.BENEFITS.NO_RUST_COUNTERS'),
        t('PREMIUM_PAGE.BENEFITS.ALT_ARTS'),
        t('PREMIUM_PAGE.BENEFITS.SLEEVES_PLAYMATS'),
        t('PREMIUM_PAGE.BENEFITS.CUSTOM_THEMES'),
        t('PREMIUM_PAGE.BENEFITS.SOL_BADGE'),
        t('PREMIUM_PAGE.BENEFITS.EVEN_MORE_EXTRA_LEADERBOARD'),
        t('PREMIUM_PAGE.BENEFITS.NO_ADS'),
        t('PREMIUM_PAGE.BENEFITS.REPLAY_SAVE_SLOTS_12'),
        t('PREMIUM_PAGE.BENEFITS.EXCLUSIVE_CHANNELS_2'),
        t('PREMIUM_PAGE.BENEFITS.DISCORD_ROLE')
      ]
    },
    {
      name: t('PREMIUM_PAGE.TIERS.CHAMPION_OF_GRANDEUR'),
      image: METAFY_TIER_MAP['Lover of Grandeur' as MetafyTierName].image,
      monthlyPrice: 35,
      yearlyDiscount: 0.15,
      benefits: [
        t('PREMIUM_PAGE.BENEFITS.FREE_GUIDES'),
        t('PREMIUM_PAGE.BENEFITS.GENERAL_SUPPORT'),
        t('PREMIUM_PAGE.BENEFITS.NO_RUST_COUNTERS'),
        t('PREMIUM_PAGE.BENEFITS.ALT_ARTS'),
        t('PREMIUM_PAGE.BENEFITS.SLEEVES_PLAYMATS'),
        t('PREMIUM_PAGE.BENEFITS.CUSTOM_THEMES'),
        t('PREMIUM_PAGE.BENEFITS.GRANDEUR_BADGE'),
        t('PREMIUM_PAGE.BENEFITS.EVEN_MORE_EXTRA_LEADERBOARD'),
        t('PREMIUM_PAGE.BENEFITS.GROUP_CLASSES'),
        t('PREMIUM_PAGE.BENEFITS.NO_ADS'),
        t('PREMIUM_PAGE.BENEFITS.REPLAY_SAVE_SLOTS_15'),
        t('PREMIUM_PAGE.BENEFITS.EXCLUSIVE_CHANNELS_2'),
        t('PREMIUM_PAGE.BENEFITS.DISCORD_ROLE')
      ]
    },
    {
      name: t('PREMIUM_PAGE.TIERS.SPONSORS_OF_TROPAL_DHANI'),
      image: METAFY_TIER_MAP['Sponsors of Trōpal-Dhani'].image,
      monthlyPrice: 50,
      yearlyDiscount: 0.20,
      benefits: [
        t('PREMIUM_PAGE.BENEFITS.FREE_GUIDES'),
        t('PREMIUM_PAGE.BENEFITS.GENERAL_SUPPORT'),
        t('PREMIUM_PAGE.BENEFITS.NO_RUST_COUNTERS'),
        t('PREMIUM_PAGE.BENEFITS.ALT_ARTS'),
        t('PREMIUM_PAGE.BENEFITS.SLEEVES_PLAYMATS'),
        t('PREMIUM_PAGE.BENEFITS.CUSTOM_THEMES'),
        t('PREMIUM_PAGE.BENEFITS.TROPAL_BADGE'),
        t('PREMIUM_PAGE.BENEFITS.TONS_EXTRA_LEADERBOARD'),
        t('PREMIUM_PAGE.BENEFITS.GROUP_CLASSES'),
        t('PREMIUM_PAGE.BENEFITS.NO_ADS'),
        t('PREMIUM_PAGE.BENEFITS.REPLAY_SAVE_SLOTS_20'),
        t('PREMIUM_PAGE.BENEFITS.EXCLUSIVE_CHANNELS_2'),
        t('PREMIUM_PAGE.BENEFITS.DISCORD_ROLE')
      ]
    }
  ];

  const comparisonFeatures = [
    { label: t('PREMIUM_PAGE.COMPARISON.PLAY_GAMES'), free: true, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.NO_RUST_COUNTERS'), free: false, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.ALT_ARTS'), free: false, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.SLEEVES_PLAYMATS'), free: false, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.IN_GAME_BADGE'), free: false, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.CUSTOM_THEMES'), free: false, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.NO_ADS'), free: false, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.DISCORD_ROLE'), free: false, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.EXCLUSIVE_CHANNELS'), free: false, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.FREE_GUIDES'), free: false, premium: true },
    { label: t('PREMIUM_PAGE.COMPARISON.REPLAY_SAVE_SLOTS'), free: '3', premium: '5-30 (by tier)' },
    { label: t('PREMIUM_PAGE.COMPARISON.EXTRA_LEADERBOARD'), free: false, premium: '$10+' },
    { label: t('PREMIUM_PAGE.COMPARISON.WEEKLY_CLASSES'), free: false, premium: '$35+' }
  ];

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
      return { display: `$${discounted}`, interval: t('PREMIUM_PAGE.YEARLY_INTERVAL'), original: `$${yearlyTotal}` };
    }
    return { display: `$${tier.monthlyPrice}`, interval: t('PREMIUM_PAGE.MONTHLY_INTERVAL'), original: null };
  };

  return (
    <div className={styles.premiumPage}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1>{t('PREMIUM_PAGE.SUPPORT_TITLE')}</h1>
          <p>{t('PREMIUM_PAGE.SUPPORT_SUBTITLE')}</p>
        </div>

        <div className={styles.billingToggle}>
          <span className={!yearly ? styles.activeLabel : undefined}>{t('PREMIUM_PAGE.BILLING_TOGGLE_MONTHLY')}</span>
          <button
            className={styles.toggleTrack}
            onClick={() => setYearly(!yearly)}
            aria-label={t('PREMIUM_PAGE.BILLING_TOGGLE_ARIA')}
          >
            <div className={`${styles.toggleKnob} ${yearly ? styles.yearly : ''}`} />
          </button>
          <span className={yearly ? styles.activeLabel : undefined}>{t('PREMIUM_PAGE.BILLING_TOGGLE_YEARLY')}</span>
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
                  <span className={styles.recommendedBadge}>{t('PREMIUM_PAGE.RECOMMENDED')}</span>
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
          <h2>{t('PREMIUM_PAGE.COMPARISON.FREE_VS_PREMIUM')}</h2>
          <p className={styles.comparisonSubtitle}>
            See what you get with a premium membership
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>{t('PREMIUM_PAGE.COMPARISON.FREE')}</th>
                  <th className={styles.highlighted}>{t('PREMIUM_PAGE.COMPARISON.PREMIUM')}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f) => (
                  <tr key={f.label}>
                    <td>{f.label}</td>
                    <td>
                      {f.free === true ? (
                        <span className={styles.check}>✓</span>
                      ) : typeof f.free === 'string' ? (
                        <span className={styles.check}>{f.free}</span>
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
