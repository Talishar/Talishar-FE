import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import CardImage from '../CardImage';

const makeStore = (gameInfo: Record<string, unknown>) =>
  ({
    getState: () => ({ game: { gameInfo } }),
    subscribe: () => () => {},
    dispatch: () => {}
  }) as any;

const renderCard = (
  props: Partial<React.ComponentProps<typeof CardImage>> & { src: string },
  gameInfo: Record<string, unknown>
) => {
  const { container } = render(
    <Provider store={makeStore(gameInfo)}>
      <CardImage {...props} />
    </Provider>
  );
  return container.querySelector('img')?.getAttribute('src');
};

const basePath = 'https://images.talishar.net/public/cardimages/english';

describe('CardImage alt art substitution', () => {
  const gameInfo = {
    altArts: [
      { cardId: 'snatch_red', altPath: 'FAB331-T' },
      { cardId: 'soup_up_red', altPath: 'LGS195-T' }
    ],
    opponentAltArts: [{ cardId: 'enigma_ledger_of_ancestry', altPath: 'HER116-T' }]
  };

  it('applies the equipped alt art by default', () => {
    const src = renderCard({ src: `${basePath}/snatch_red.webp` }, gameInfo);
    expect(src).toBe(`${basePath}/FAB331-T.webp`);
  });

  it('falls back to the English base card for non-English promos when preferEnglishArt is set', () => {
    const src = renderCard(
      { src: `${basePath}/snatch_red.webp`, preferEnglishArt: true },
      gameInfo
    );
    expect(src).toBe(`${basePath}/snatch_red.webp`);
  });

  it('still applies English alt arts when preferEnglishArt is set', () => {
    const src = renderCard(
      { src: `${basePath}/soup_up_red.webp`, preferEnglishArt: true },
      gameInfo
    );
    expect(src).toBe(`${basePath}/LGS195-T.webp`);
  });

  it('skips non-English promo alt arts for the opponent too', () => {
    const src = renderCard(
      {
        src: `${basePath}/enigma_ledger_of_ancestry.webp`,
        isOpponent: true,
        preferEnglishArt: true
      },
      gameInfo
    );
    expect(src).toBe(`${basePath}/enigma_ledger_of_ancestry.webp`);
  });
});
