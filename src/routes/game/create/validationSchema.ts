import { array, boolean, object, string, number } from 'yup';

const SELECT_DECK = 'You must select a deck.';
const URL = 'Deck link must be a URL';

export const validationSchema = object().shape(
  {
    deck: string(),
    fabdb: string(),
    deckTestMode: boolean().required(),
    format: string().required(),
    visibility: string().required(),
    decksToTry: string(),
    favoriteDeck: boolean(),
    favoriteDecks: string(),
    gameDescription: string()
  },
  [['favoriteDecks', 'fabdb']]
);

export default validationSchema;
