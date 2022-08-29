import { GameState } from '../features/game/gameSlice';

export function ParseGameState(input: string) {
  console.log(input);
  const result: GameState = {
    gameID: 663,
    playerID: 3,
    authKey: '28df413b665604299807c461a7f3cae71c4176cb2b96afad04b84cf96d016258',
    playerOne: {
      HeadEq: { cardNumber: 'WTR079' },
      ChestEq: { cardNumber: 'WTR150' },
      GlovesEq: { cardNumber: 'UPR158' },
      FeetEq: { cardNumber: 'WTR154' },
      WeaponLEq: { cardNumber: 'CRU048' },
      Hero: { cardNumber: 'CRU046' },
      WeaponREq: { cardNumber: 'CRU049' },
      Health: 20,
      ActionPoints: 0,
      PitchRemaining: 0
    },
    playerTwo: {
      // AI or opposing player
      HeadEq: { cardNumber: 'CRU006' },
      ChestEq: { cardNumber: 'WTR005' },
      GlovesEq: { cardNumber: 'WTR153' },
      FeetEq: { cardNumber: 'WTR004' },
      WeaponLEq: { cardNumber: '' },
      Hero: { cardNumber: 'WTR002' },
      WeaponREq: { cardNumber: 'WTR003' },
      Health: 20,
      ActionPoints: 0,
      PitchRemaining: 0
    }
  };

  return result;
}
