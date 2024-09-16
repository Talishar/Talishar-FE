import { array, boolean, object, string, number } from 'yup';

const oneHandedHeroes = ['HVY001', 'HVY002'];

export const deckValidation = (
  minDeckSize: number,
  maxDeckSize: number,
  heroNumHands: number
) => {
  return object({
    hero: string().required('You must have a hero!'),
    weapons: array()
      .required()
      .min(1, 'Pick at least one weapon.')
      .max(heroNumHands, 'Too many weapons equipped.')
      .of(
        object().shape({
          id: string().required(),
          is1H: boolean(),
          numHands: number()
        })
      )
      // Test that the sum of weapons.hands is less than our hero's available hands.
      .test('hands', 'Too many weapons for your hands', (weapons = []) => {
        const numHands = weapons.reduce((total, row) => {
          return total + (row.numHands ?? 0);
        }, 0);
        return numHands <= heroNumHands;
      }),
    head: string().required('You must have head equipment.'),
    chest: string().required('You must have chest equipment.'),
    arms: string().required('You must have arms equipment.'),
    legs: string().required('You must have legs equipment.'),
    deck: array()
      .required()
      .of(string().required())
      .min(minDeckSize, `Minimum deck size is ${minDeckSize} cards.`)
      .max(maxDeckSize, `Maximum deck size is ${maxDeckSize} cards.`)
  });
};

export default deckValidation;
