// Icon configuration for patron/contributor status indicators
// Used across multiple components to maintain consistency

export interface PatreonIcon {
  condition: boolean;
  src: string;
  title: string;
  href?: string;
}

// Metafy tier names for badge mapping
export type MetafyTierName = 'Fyendal Supporters' | 'Seers of Ophidia' | 'Arknight Shards' | 'Lover of Grandeur' | 'Sponsors of Trōpal-Dhani' | 'Light of Sol Gemini Circle';

// Map Metafy tier names to badge images and links
export const METAFY_TIER_MAP: Record<MetafyTierName, { image: string; title: string; href?: string }> = {
  'Fyendal Supporters': {
    image: '/images/fyendal.webp',
    title: 'I am a Metafy Supporter! 💖',
    href: 'https://metafy.gg/@Talishar'
  },
  'Seers of Ophidia': {
    image: '/images/ophidia.webp',
    title: 'I am a Metafy Supporter! 💖',
    href: 'https://metafy.gg/@Talishar'
  },
  'Arknight Shards': {
    image: '/images/arknight.webp',
    title: 'I am a Metafy Supporter! 💖',
    href: 'https://metafy.gg/@Talishar'
  },
  'Lover of Grandeur': {
    image: '/images/grandeur.webp',
    title: 'I am a Metafy Supporter! 💖',
    href: 'https://metafy.gg/@Talishar'
  },
  'Sponsors of Trōpal-Dhani': {
    image: '/images/tropal.webp',
    title: 'I am a Metafy Supporter! 💖',
    href: 'https://metafy.gg/@Talishar'
  },
  'Light of Sol Gemini Circle': {
    image: '/images/lightofsol.webp',
    title: 'I am a Metafy Supporter! 💖',
    href: 'https://metafy.gg/@Talishar'
  }
};

export const createPatreonIconMap = (
  isContributor: boolean | undefined,
  isPvtVoidPatron: boolean | undefined,
  isPatron: boolean | undefined,
  isPracticeDummy: boolean | undefined,
  metafyTiers: string[] | undefined = []
): PatreonIcon[] => {
  // Filter for Talishar-specific Metafy badges only
  const talisharMetafyTiers = (Array.isArray(metafyTiers) ? metafyTiers : []).filter(tier => tier in METAFY_TIER_MAP);
  const hasTalisharMetafyBadges = talisharMetafyTiers.length > 0;

  const icons: PatreonIcon[] = [];

  // Only add Patreon badges if user doesn't have Talishar-specific Metafy badges
  if (!hasTalisharMetafyBadges) {
    icons.push(
      {
        condition: isContributor ?? false,
        src: '/images/copper.webp',
        title: 'I am a contributor to Talishar!',
        href: 'https://metafy.gg/@Talishar'
      },
      {
        condition: isPatron ?? false,
        src: '/images/patronHeart.webp',
        title: 'I am a Supporter of Talishar 💖',
        href: 'https://metafy.gg/@Talishar'
      },
      {
        condition: isPvtVoidPatron ?? false,
        src: '/images/patronEye.webp',
        title: 'I am a Supporter of Talishar 💖',
        href: 'https://metafy.gg/@Talishar'
      }
    );
  }

  // Add Talishar-specific Metafy tier badges
  if (hasTalisharMetafyBadges) {
    for (const tier of talisharMetafyTiers) {
      const tierConfig = METAFY_TIER_MAP[tier as MetafyTierName];
      if (tierConfig) {
        icons.push({
          condition: true,
          src: tierConfig.image,
          title: tierConfig.title,
          href: 'https://www.metafy.gg'
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
