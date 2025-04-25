import { Card } from './Card';

export default interface CombatChainLink {
  attackingCard?: Card;
  reactionCards?: Card[];
  totalPower?: number;
  totalDefence?: number;
  didItHit?: boolean;
  index?: number;
  goAgain?: boolean;
  dominate?: boolean;
  overpower?: boolean;
  wager?: boolean;
  phantasm?: boolean;
  fusion?: boolean;
  piercing?: boolean;
  tower?: boolean;
  combo?: boolean;
  highTide?: boolean;
  damagePrevention?: number;
  attackTarget?: string;
  isDraconic?: boolean;
  isIllusionist?: boolean;
  numRequiredEquipBlock?: number;
}
