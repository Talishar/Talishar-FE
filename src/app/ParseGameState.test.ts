import { ZONE } from 'appConstants';
import ParseGameState from './ParseGameState';

describe('ParseGameState equipment slots', () => {
  it('places character cards using backend slots instead of type or array order', () => {
    const gameState = ParseGameState({
      playerEquipment: [
        { cardNumber: 'right_weapon', type: 'W', slot: 'RWep' },
        { cardNumber: 'left_weapon', type: 'W', slot: 'LWep' },
        { cardNumber: 'hero', type: 'C', slot: 'Hero' },
        {
          cardNumber: 'frostbite',
          type: 'T',
          sType: 'Chest',
          slot: 'Head'
        },
        {
          cardNumber: 'modular_equipment',
          type: 'E',
          sType: 'Arms',
          slot: 'Chest'
        },
        { cardNumber: 'arm_equipment', type: 'E', slot: 'Arms' },
        { cardNumber: 'leg_equipment', type: 'E', slot: 'Legs' }
      ]
    });

    expect(gameState.playerOne.WeaponLEq?.cardNumber).toBe('left_weapon');
    expect(gameState.playerOne.WeaponREq?.cardNumber).toBe('right_weapon');
    expect(gameState.playerOne.Hero).toMatchObject({
      cardNumber: 'hero',
      slot: 'Hero',
      zone: ZONE.HERO
    });
    expect(gameState.playerOne.HeadEq?.cardNumber).toBe('frostbite');
    expect(gameState.playerOne.ChestEq?.cardNumber).toBe('modular_equipment');
    expect(gameState.playerOne.ArmsEq?.cardNumber).toBe('arm_equipment');
    expect(gameState.playerOne.LegsEq?.cardNumber).toBe('leg_equipment');
  });

  it('renders off-hands in the right weapon position', () => {
    const gameState = ParseGameState({
      opponentEquipment: [
        {
          cardNumber: 'off_hand_companion',
          type: 'Companion',
          slot: 'Off-Hand'
        }
      ]
    });

    expect(gameState.playerTwo.WeaponREq).toMatchObject({
      cardNumber: 'off_hand_companion',
      slot: 'Off-Hand'
    });
  });

  it('does not infer a position when the backend has not assigned a slot', () => {
    const gameState = ParseGameState({
      playerEquipment: [
        { cardNumber: 'legacy_weapon', type: 'W' },
        { cardNumber: 'legacy_helmet', type: 'E', sType: 'Head' }
      ]
    });

    expect(gameState.playerOne.WeaponLEq).toBeUndefined();
    expect(gameState.playerOne.HeadEq).toBeUndefined();
  });
});
