import { getCardImagesImagePath } from '../multilanguage';

const generateExpectedResult = ({
  languagePath = 'english',
  cardNumber = 'CardBack'
}) => `/cardimages/${languagePath}/${cardNumber}.webp`;

describe('Multilanguage', () => {
  it('should return default values', () => {
    const result = getCardImagesImagePath({});
    expect(result).to.equal(generateExpectedResult({}));
  });

  describe('English language', () => {
    it('should return default values', () => {
      const result = getCardImagesImagePath({
        locale: 'en',
        cardNumber: 'WTR111'
      });
      expect(result).to.equal(
        generateExpectedResult({
          languagePath: 'english',
          cardNumber: 'WTR111'
        })
      );
    });
  });

  describe('Japanese language', () => {
    it('should return valid japanese value with an existing card', () => {
      const result = getCardImagesImagePath({
        locale: 'jp',
        cardNumber: 'MST111'
      });
      expect(result).to.equal(
        generateExpectedResult({
          languagePath: 'japanese',
          cardNumber: 'MST111'
        })
      );
    });

    it('if is not a valid japanese collection, return a valid english value', () => {
      const result = getCardImagesImagePath({
        locale: 'jp',
        cardNumber: 'WTR111'
      });
      expect(result).to.equal(
        generateExpectedResult({
          languagePath: 'english',
          cardNumber: 'WTR111'
        })
      );
    });
  });

  describe('European language', () => {
    it('should return valid european value with a current collection', () => {
      const result = getCardImagesImagePath({
        locale: 'es',
        cardNumber: 'OUT111'
      });
      expect(result).to.equal(
        generateExpectedResult({
          languagePath: 'spanish',
          cardNumber: 'OUT111'
        })
      );
    });

    it('if is a card existing in 1HP collection, return a valid 1HP card value', () => {
      const result = getCardImagesImagePath({
        locale: 'es',
        cardNumber: 'WTR001'
      });
      expect(result).to.equal(
        generateExpectedResult({
          languagePath: 'spanish',
          cardNumber: '1HP001'
        })
      );
    });

    it('if is a card existing in 2HP collection, return a valid 2HP card value', () => {
      const result = getCardImagesImagePath({
        locale: 'es',
        cardNumber: 'ELE001'
      });
      expect(result).to.equal(
        generateExpectedResult({
          languagePath: 'spanish',
          cardNumber: '2HP001'
        })
      );
    });

    it('if is a card existing in 1HP collection but reprinted in 2HP, return the reprinted 2HP card value', () => {
      const result = getCardImagesImagePath({
        locale: 'es',
        cardNumber: 'WTR075'
      });
      expect(result).to.equal(
        generateExpectedResult({
          languagePath: 'spanish',
          cardNumber: '2HP335'
        })
      );
    });

    it('if is not a valid european collection, return a valid english value', () => {
      const result = getCardImagesImagePath({
        locale: 'es',
        cardNumber: 'TEST111'
      });
      expect(result).to.equal(
        generateExpectedResult({
          languagePath: 'english',
          cardNumber: 'TEST111'
        })
      );
    });
  });
});
