import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { Card } from 'features/Card';
import CardDisplay from '../cardDisplay/CardDisplay';
import styles from './Reactions.module.css';

function Reactions() {
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink?.reactionCards
  );
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const reactionsRef = React.useRef<HTMLDivElement>(null);
  const [scrollbarHeight, setScrollbarHeight] = React.useState(0);
  const hasReactions = activeCombatChain !== undefined;

  // The scroller has almost no spare height, so a horizontal scrollbar would
  // clip the cards. Measure it and let the CSS grow the box by that much.
  const measureScrollbar = React.useCallback(() => {
    const element = reactionsRef.current;
    if (!element) return;
    setScrollbarHeight(element.offsetHeight - element.clientHeight);
  }, []);

  React.useLayoutEffect(measureScrollbar);

  React.useEffect(() => {
    const element = reactionsRef.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver(measureScrollbar);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [hasReactions, measureScrollbar]);

  if (!hasReactions) {
    return <div className={styles.currentAttack}></div>;
  }

  return (
    <div className={styles.reactionWrapper}>
      <div
        ref={reactionsRef}
        className={styles.reactions}
        style={
          {
            '--reactions-scrollbar': `${scrollbarHeight}px`
          } as React.CSSProperties
        }
      >
        {activeCombatChain?.map((card: Card, ix: number) => {
          const isPlayer = playerID === card.controller;
          return (
            <div key={ix.toString()} className={styles.cardContainer}>
              <CardDisplay
                card={card}
                isPlayer={isPlayer}
                playable={!!card.action}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(Reactions);
