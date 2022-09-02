import Card from './Card';

export default interface CombatChainLink {
  attackingCard?: Card;
  reactionCards?: Card[];
  totalAttack?: number;
  totalDefence?: number;
  didItHit?: boolean;
}
