import { TALISHAR_METAFY_URL } from 'constants/socialLinks';

// Icon configuration for patron/contributor status indicators
// Used across multiple components to maintain consistency

export interface PatreonIcon {
  condition: boolean;
  src: string;
  title: string;
  href?: string;
}

// Metafy tier names for badge mapping
export type MetafyTierName =
  | 'Fyendal Supporters'
  | 'Seers of Ophidia'
  | 'Arknight Shards'
  | 'Lover of Grandeur'
  | 'Sponsors of Trōpal-Dhani'
  | 'Light of Sol Gemini Circle';

// Map Metafy tier names to badge images and links
export const METAFY_TIER_MAP: Record<
  MetafyTierName,
  { image: string; label: string; title: string; href?: string }
> = {
  'Fyendal Supporters': {
    image: '/images/fyendal.webp',
    label: 'Fyendal Supporter',
    title: 'I am a Metafy Supporter! 💖',
    href: TALISHAR_METAFY_URL
  },
  'Seers of Ophidia': {
    image: '/images/ophidia.webp',
    label: 'Seer of Ophidia',
    title: 'I am a Metafy Supporter! 💖',
    href: TALISHAR_METAFY_URL
  },
  'Arknight Shards': {
    image: '/images/arknight.webp',
    label: 'Arknight Shard',
    title: 'I am a Metafy Supporter! 💖',
    href: TALISHAR_METAFY_URL
  },
  'Lover of Grandeur': {
    image: '/images/grandeur.webp',
    label: 'Lover of Grandeur',
    title: 'I am a Metafy Supporter! 💖',
    href: TALISHAR_METAFY_URL
  },
  'Sponsors of Trōpal-Dhani': {
    image: '/images/tropal.webp',
    label: 'Sponsor of Trōpal-Dhani',
    title: 'I am a Metafy Supporter! 💖',
    href: TALISHAR_METAFY_URL
  },
  'Light of Sol Gemini Circle': {
    image: '/images/lightofsol.webp',
    label: 'Light of Sol Gemini Circle',
    title: 'I am a Metafy Supporter! 💖',
    href: TALISHAR_METAFY_URL
  }
};

export const createPatreonIconMap = (
  isContributor: boolean | undefined,
  isPvtVoidPatron: boolean | undefined,
  isPatron: boolean | undefined,
  isPracticeDummy: boolean | undefined,
  metafyTiers: string[] | undefined = []
): PatreonIcon[] => {
  // If user has Metafy badges, only show those (skip Patreon badges)
  const hasMetafyBadges = metafyTiers && metafyTiers.length > 0;

  const icons: PatreonIcon[] = [];

  // Only add Patreon badges if user doesn't have Metafy badges
  if (!hasMetafyBadges) {
    icons.push(
      {
        condition: isContributor ?? false,
        src: '/images/copper.webp',
        title: 'I am a contributor to Talishar!',
        href: TALISHAR_METAFY_URL
      },
      {
        condition: isPatron ?? false,
        src: '/images/patronHeart.webp',
        title: 'I am a Supporter of Talishar 💖',
        href: TALISHAR_METAFY_URL
      },
      {
        condition: isPvtVoidPatron ?? false,
        src: '/images/patronEye.webp',
        title: 'I am a Supporter of Talishar 💖',
        href: TALISHAR_METAFY_URL
      }
    );
  }

  // Add Metafy tier badges (if present, only these show)
  if (hasMetafyBadges) {
    for (const tier of metafyTiers) {
      const tierConfig = METAFY_TIER_MAP[tier as MetafyTierName];
      if (tierConfig) {
        icons.push({
          condition: true,
          src: tierConfig.image,
          title: tierConfig.title,
          href: TALISHAR_METAFY_URL
        });
      }
    }
  }

  // Practice Dummy should be last
  icons.push({
    condition: isPracticeDummy ?? false,
    src: '/images/practiceDummy.webp',
    title: 'I am a bot! 🤖'
  });

  return icons;
};
