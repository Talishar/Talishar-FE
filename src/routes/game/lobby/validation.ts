import { array, boolean, object, string, number } from 'yup';
import { useTranslation, Trans } from 'react-i18next';

const oneHandedHeroes = ['kayo', 'kayo_armed_and_dangerous'];

export const deckValidation = (
  minDeckSize: number,
  maxDeckSize: number,
  heroNumHands: number
) => {
  const { t } = useTranslation();
  return object({
    hero: string().required(t('GAME_LOBBY.VALIDATION.HERO_REQUIRED')),
    weapons: array()
      .required()
      .test(
        'offhands',
        t('GAME_LOBBY.VALIDATION.TOO_MANY_OFFHANDS'),
        (weapons = []) => {
          const offhands = weapons.filter((weapon) => weapon.isOffhand);
          return offhands.length <= 1;
        }
      )
      .test(
        'hands',
        t('GAME_LOBBY.VALIDATION.TOO_MANY_WEAPONS_FOR_HANDS'),
        (weapons = []) => {
          const numHands = weapons.reduce((total, row) => {
            return total + (row.numHands ?? 0);
          }, 0);
          return numHands <= heroNumHands;
        }
      )
      .min(1, t('GAME_LOBBY.VALIDATION.MIN_WEAPONS'))
      .max(heroNumHands, t('GAME_LOBBY.VALIDATION.MAX_WEAPONS'))
      .of(
        object().shape({
          id: string().required(),
          is1H: boolean(),
          numHands: number(),
          isQuiver: boolean(),
          isOffhand: boolean()
        })
      ),
    head: string().required(t('GAME_LOBBY.VALIDATION.HEAD_REQUIRED')),
    chest: string().required(t('GAME_LOBBY.VALIDATION.CHEST_REQUIRED')),
    arms: string().required(t('GAME_LOBBY.VALIDATION.ARMS_REQUIRED')),
    legs: string().required(t('GAME_LOBBY.VALIDATION.LEGS_REQUIRED')),
    deck: array()
      .required()
      .of(string().required())
      .min(
        minDeckSize,
        t('GAME_LOBBY.VALIDATION.MIN_DECK_SIZE', { size: minDeckSize })
      )
      .max(
        maxDeckSize,
        t('GAME_LOBBY.VALIDATION.MAX_DECK_SIZE', { size: maxDeckSize })
      )
  });
};

export default deckValidation;
