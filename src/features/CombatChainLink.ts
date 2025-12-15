import { Card } from './Card';

export default interface CombatChainLink {
  attackingCard?: Card;
  reactionCards?: Card[];
  totalPower?: number;
  totalDefense?: number;
  didItHit?: boolean;
  index?: number;
  goAgain?: boolean;
  dominate?: boolean;
  overpower?: boolean;
  activeOnHits?: boolean;
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
  confidence?: boolean;
}
