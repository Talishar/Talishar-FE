import {
  CARD_IMAGES_PATH,
  CARD_SQUARES_PATH,
  DEFAULT_LANGUAGE,
  JAPANESE_LANGUAGE
} from '../constants';
import {
  getCollectionCardImagePath,
  loadInitialLanguage
} from '../multilanguage';

const generateExpectedResult = ({
  path = CARD_IMAGES_PATH,
  locale = 'English',
  cardNumber = 'CardBack'
}) => `/${path}/${locale}/${cardNumber}.webp`;

describe('Multilanguage', () => {
  describe('getCollectionCardImagePath', () => {
    it('should return default values', () => {
      const result = getCollectionCardImagePath({});
      expect(result).to.equal(generateExpectedResult({}));
    });

    describe('English language', () => {
      it('should return english values on english locale', () => {
        const result = getCollectionCardImagePath({
          path: CARD_IMAGES_PATH,
          locale: 'en',
          cardNumber: 'WTR111'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_IMAGES_PATH,
            locale: 'English',
            cardNumber: 'WTR111'
          })
        );
      });

      it('should return english values on alternative card', () => {
        const result = getCollectionCardImagePath({
          path: CARD_IMAGES_PATH,
          locale: 'en',
          cardNumber: 'WTR111_Brandao'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_IMAGES_PATH,
            locale: 'English',
            cardNumber: 'WTR111_Brandao'
          })
        );
      });
    });

    describe('Japanese language', () => {
      it('should return valid japanese value with an existing card', () => {
        const result = getCollectionCardImagePath({
          path: CARD_SQUARES_PATH,
          locale: 'jp',
          cardNumber: 'MST111'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_SQUARES_PATH,
            locale: 'Japanese',
            cardNumber: 'MST111'
          })
        );
      });

      it('if is not a valid japanese collection, return a valid english value', () => {
        const result = getCollectionCardImagePath({
          path: CARD_SQUARES_PATH,
          locale: 'jp',
          cardNumber: 'WTR111'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_SQUARES_PATH,
            locale: 'English',
            cardNumber: 'WTR111'
          })
        );
      });

      it('should return english values if is an alternative art card code', () => {
        const result = getCollectionCardImagePath({
          path: CARD_SQUARES_PATH,
          locale: 'jp',
          cardNumber: 'MST111_Brandao'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_SQUARES_PATH,
            locale: 'English',
            cardNumber: 'MST111_Brandao'
          })
        );
      });
    });

    describe('European language', () => {
      it('should return valid european value with a current collection', () => {
        const result = getCollectionCardImagePath({
          path: CARD_IMAGES_PATH,
          locale: 'es',
          cardNumber: 'OUT111'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_IMAGES_PATH,
            locale: 'Spanish',
            cardNumber: 'OUT111'
          })
        );
      });

      it('if is a card existing in 1HP collection, return a valid 1HP card value', () => {
        const result = getCollectionCardImagePath({
          path: CARD_IMAGES_PATH,
          locale: 'es',
          cardNumber: 'WTR001'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_IMAGES_PATH,
            locale: 'Spanish',
            cardNumber: '1HP001'
          })
        );
      });

      it('if is a card existing in 2HP collection, return a valid 2HP card value', () => {
        const result = getCollectionCardImagePath({
          path: CARD_IMAGES_PATH,
          locale: 'es',
          cardNumber: 'ELE001'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_IMAGES_PATH,
            locale: 'Spanish',
            cardNumber: '2HP001'
          })
        );
      });

      it('if is a card existing in 1HP collection but reprinted in 2HP, return the reprinted 2HP card value', () => {
        const result = getCollectionCardImagePath({
          path: CARD_IMAGES_PATH,
          locale: 'es',
          cardNumber: 'WTR075'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_IMAGES_PATH,
            locale: 'Spanish',
            cardNumber: '2HP335'
          })
        );
      });

      it('if is not a valid european collection, return a valid english value', () => {
        const result = getCollectionCardImagePath({
          path: CARD_SQUARES_PATH,
          locale: 'es',
          cardNumber: 'TEST111'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_SQUARES_PATH,
            locale: 'English',
            cardNumber: 'TEST111'
          })
        );
      });

      it('should return english values if is an alternative art card code', () => {
        const result = getCollectionCardImagePath({
          path: CARD_SQUARES_PATH,
          locale: 'es',
          cardNumber: 'OUT111_Brandao'
        });
        expect(result).to.equal(
          generateExpectedResult({
            path: CARD_SQUARES_PATH,
            locale: 'English',
            cardNumber: 'OUT111_Brandao'
          })
        );
      });
    });
  });

  describe('loadInitialLanguage', () => {
    beforeEach(() => window.localStorage.clear());

    it('should return default language if is not stored in localStorage', () => {
      const result = loadInitialLanguage();
      expect(result).to.equal(DEFAULT_LANGUAGE);
    });

    it('should return english language if is stored in localStorage', () => {
      window.localStorage.setItem('language', DEFAULT_LANGUAGE);
      const result = loadInitialLanguage();
      expect(result).to.equal(DEFAULT_LANGUAGE);
    });

    it('should return english language if is stored in localStorage', () => {
      window.localStorage.setItem('language', JAPANESE_LANGUAGE);
      const result = loadInitialLanguage();
      expect(result).to.equal(JAPANESE_LANGUAGE);
    });
  });
});
