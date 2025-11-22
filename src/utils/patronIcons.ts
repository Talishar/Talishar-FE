// Icon configuration for patron/contributor status indicators
// Used across multiple components to maintain consistency

export interface PatreonIcon {
  condition: boolean;
  src: string;
  title: string;
  href?: string;
}

export const createPatreonIconMap = (
  isContributor: boolean | undefined,
  isPvtVoidPatron: boolean | undefined,
  isPatron: boolean | undefined,
  isPracticeDummy: boolean | undefined
): PatreonIcon[] => [
  {
    condition: isContributor ?? false,
    src: '/images/copper.webp',
    title: 'I am a contributor to Talishar!',
    href: 'https://linktr.ee/Talishar'
  },
  {
    condition: isPatron ?? false,
    src: '/images/patronHeart.webp',
    title: 'I am a patron of Talishar!',
    href: 'https://linktr.ee/Talishar'
  },
  {
    condition: isPvtVoidPatron ?? false,
    src: '/images/patronEye.webp',
    title: 'I am a patron of PvtVoid!',
    href: 'https://linktr.ee/Talishar'
  },
  {
    condition: isPracticeDummy ?? false,
    src: '/images/practiceDummy.webp',
    title: 'I am a bot!'
  }
];
