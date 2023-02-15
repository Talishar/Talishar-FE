import { array, boolean, object, string, number } from 'yup';

const SELECT_DECK = 'You must select a deck.';
const URL = 'Deck link must be a URL';

export const validationSchema = object().shape(
  {
    deck: string(),
    fabdb: string().when('favoriteDecks', {
      is: (favoriteDecks: string) =>
        favoriteDecks === '' || favoriteDecks === undefined,
      then: string().required(SELECT_DECK).url(URL),
      otherwise: string().optional().nullable()
    }),
    deckTestMode: boolean().required(),
    decksToTry: string(),
    favoriteDeck: boolean(),
    favoriteDecks: string().when('fabdb', {
      is: (fabdb: string) => fabdb === '' || fabdb === undefined,
      then: string().required(SELECT_DECK),
      otherwise: string().optional().nullable()
    }),
    gameDescription: string()
  },
  [['favoriteDecks', 'fabdb']]
);

export default validationSchema;
