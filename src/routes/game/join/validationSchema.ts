import * as yup from 'yup';

const SELECT_DECK = 'You must select a deck.';
const URL = 'Deck link must be a URL';

const validationSchema = yup.object().shape(
  {
    deck: yup.string(),
    fabdb: yup.string(),
    /*.when(['favoriteDecks'], {
      is: (favoriteDecks: string | undefined) =>
        favoriteDecks === '' || favoriteDecks === undefined,
      then: (validationSchema) =>
        validationSchema.required(SELECT_DECK).url(URL),
      otherwise: (validationSchema) => validationSchema.optional().nullable()
    })*/ deckTestMode: yup.boolean().required(),
    decksToTry: yup.string(),
    favoriteDeck: yup.boolean(),
    favoriteDecks: yup.string().when(['fabdb'], {
      is: (fabdb: string | undefined) => fabdb === '' || fabdb === undefined,
      then: (validationSchema) => validationSchema.required(SELECT_DECK),
      otherwise: (validationSchema) => validationSchema.optional().nullable()
    }),
    gameDescription: yup.string()
  },
  [['favoriteDecks', 'fabdb']]
);

export default validationSchema;
