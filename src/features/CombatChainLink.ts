import { BooleanLiteral } from 'typescript';
import { Card } from './Card';

export default interface CombatChainLink {
  attackingCard?: Card;
  reactionCards?: Card[];
  totalAttack?: number;
  totalDefence?: number;
  didItHit?: boolean;
  index?: number;
  goAgain?: boolean;
  dominate?: boolean;
  overpower?: boolean;
  fused?: boolean;
  damagePrevention?: number;
  attackTarget?: string;
  isDraconic?: boolean;
  isIllusionist?: boolean;
}
