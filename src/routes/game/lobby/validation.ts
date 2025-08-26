import { array, boolean, object, string, number } from 'yup';

const oneHandedHeroes = ['kayo', 'kayo_armed_and_dangerous'];

export const deckValidation = (
  minDeckSize: number,
  maxDeckSize: number,
  heroNumHands: number
) => {
  return object({
    hero: string().required('You must have a hero!'),
    weapons: array()
      .required()
      .test('offhands', 'Too many off-hands equipped', (weapons = []) => {
        const offhands = weapons.filter((weapon) => weapon.isOffhand);
        return offhands.length <= 1;
      })
      // Test that the sum of weapons.hands is less than our hero's available hands.
      .test('hands', 'Too many weapons for your hands', (weapons = []) => {
        const numHands = weapons.reduce((total, row) => {
          return total + (row.numHands ?? 0);
        }, 0);
        return numHands <= heroNumHands;
      })
      .max(heroNumHands, 'Too many weapons/off-hands equipped.')
      .of(
        object().shape({
          id: string().required(),
          is1H: boolean(),
          numHands: number(),
          isQuiver: boolean(),
          isOffhand: boolean()
        })
      ),
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
