import { array, boolean, object, string, number } from 'yup';

const oneHandedHeroes = ['HVY001', 'HVY002'];

export const deckValidation = (minDeckSize: number, maxDeckSize: number, heroNumHands: number) => {
  return object({
    // maximum of two 1H items, or one 2H item.
    hero: string().required('You must have a hero!'),
    weapons: array()
      .required()
      .min(1, 'Pick at least one weapon.')
      .of(
        object().shape({
          id: string().required(),
          is1H: boolean(),
          WeaponNumHands: number()
        })
      )
      // Test that the sum of weapons.hands is less than 2. Unless it's Kayo. And hope LSS don't introduce heroes with only 1 hand, or 3 hands.
      .test('hands', 'Too much equipment for your hands', (weapons = [], testContext) => {
        const hero = testContext.schema.hero;
        const oneHandedHeroes = ['HVY001', 'HVY002'];
        const handsTotal = oneHandedHeroes.includes(hero) ? 1 : 2;
        const numHands = weapons.reduce((total, row) => {
          return total + (row.WeaponNumHands ?? 0);
        }, 0);
        return numHands <= handsTotal
      })
      .max(heroNumHands, 'Too many weapons equipped.'),
    head: string().required('You must have head equipment.'),
    chest: string().required('You must have chest equipment.'),
    arms: string().required('You must have arms equipment.'),
    legs: string().required('You must have legs equipment.'),
    deck: array()
      .required()
      .of(string())
      .min(minDeckSize, `Minimum deck size is ${minDeckSize} cards.`)
      .max(maxDeckSize, `Maximum deck size is ${maxDeckSize} cards.`)
  });
};

export default deckValidation;
