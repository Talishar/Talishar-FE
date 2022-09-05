import React, { useRef, useState, useEffect } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { clearPopUp, setPopUp } from '../../features/game/GameSlice';
import { RootState } from '../../app/Store';
import Card from '../../features/Card';
import styles from './PlayerHand.module.css';
import Draggable, {
  DraggableData,
  DraggableEventHandler
} from 'react-draggable';

const HandCurvatureConstant = 8;
const ScreenPercentageForCardPlayed = 0.25;

interface handCard {
  card?: Card;
  isArsenal?: boolean;
  isGraveyard?: boolean;
  isBanished?: boolean;
  handSize: number;
  cardIndex: number;
}

function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

function PlayerHandCard(props: handCard) {
  const [controlledPosition, setControlledPosition] = useState({ x: 0, y: 0 });
  const [canPopUp, setCanPopup] = useState(true);
  const [cardPlayMessage, setCardPlayMessage] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { card, cardIndex, handSize, isArsenal, isBanished, isGraveyard } =
    props;
  if (card === undefined) {
    return <div className={styles.handCard}></div>;
  }

  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const onDragStop = (e: any, data: any) => {
    if (data.lastY < -window.innerHeight * ScreenPercentageForCardPlayed) {
      console.log('playing the card');
    }
    setControlledPosition({ x: 0, y: 0 });
    setCanPopup(true);
    setDragging(false);
  };

  const onDrag = () => {
    dispatch(clearPopUp());
    setCanPopup(false);
    setDragging(true);
  };

  const handleMouseEnter = () => {
    if (ref.current === null || !canPopUp) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const xCoord = rect.left < window.innerWidth / 2 ? rect.right : rect.left;
    const yCoord = rect.top < window.innerHeight / 2 ? rect.bottom : rect.top;
    dispatch(
      setPopUp({
        cardNumber: card.cardNumber,
        xCoord: xCoord,
        yCoord: yCoord
      })
    );
  };

  const handleMouseLeave = () => {
    dispatch(clearPopUp());
  };

  const degree = lerp(-15, 15, cardIndex / (handSize - 1));

  const yDisplace = () => {
    if (ref.current === null) {
      return 0;
    }
    const displacement = Math.sin((cardIndex / (handSize - 1)) * Math.PI);
    const rect = ref.current.getBoundingClientRect();
    const yTranslate = lerp(
      0,
      (rect.bottom - rect.top) / HandCurvatureConstant,
      -displacement
    );
    return yTranslate;
  };

  const [translation, setTranslation] = useState({
    transform: `translateY(${yDisplace()}px) rotate(${degree}deg) `
  });

  useEffect(() => {
    if (dragging) {
      setTranslation({
        transform: `translateY(${yDisplace()}px) rotate(0deg) `
      });
    } else {
      setTranslation({
        transform: `translateY(${yDisplace()}px) rotate(${degree}deg) `
      });
    }
  }, [dragging]);

  const src = `https://www.fleshandbloodonline.com/FaBOnline2/WebpImages/${card.cardNumber}.webp`;

  return (
    <div className={styles.handCard}>
      <Draggable
        defaultPosition={{ x: 0, y: 0 }}
        onStop={onDragStop}
        onDrag={onDrag}
        position={controlledPosition}
      >
        <div>
          <div
            className={styles.imgContainer}
            onMouseEnter={() => handleMouseEnter()}
            onMouseLeave={() => handleMouseLeave()}
            ref={ref}
            style={translation}
          >
            <div>
              <img src={src} className={styles.img} draggable="false" />
              <div className={styles.iconCol}>
                {isArsenal === true && (
                  <div className={styles.arsenal}>
                    <i className="fa fa-random" aria-hidden="true"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Draggable>
    </div>
  );
}

export default function PlayerHand() {
  const isPlayable = (card: Card) => {
    false;
  };

  const handCards = useSelector(
    (state: RootState) => state.game.playerOne.Hand,
    shallowEqual
  );
  const arsenalCards = useSelector(
    (state: RootState) => state.game.playerOne.Arsenal,
    shallowEqual
  );
  const playableBanishedCards = useSelector(
    (state: RootState) => state.game.playerOne.Banish?.filter(isPlayable),
    shallowEqual
  );
  const playableGraveyardCards = useSelector(
    (state: RootState) => state.game.playerOne.Graveyard?.filter(isPlayable),
    shallowEqual
  );

  let lengthOfCards = 0;
  lengthOfCards += handCards !== undefined ? handCards.length : 0;
  lengthOfCards += arsenalCards !== undefined ? arsenalCards.length : 0;
  lengthOfCards +=
    playableBanishedCards !== undefined ? playableBanishedCards.length : 0;
  lengthOfCards +=
    playableGraveyardCards !== undefined ? playableGraveyardCards.length : 0;

  return (
    <div className={styles.handRow}>
      {handCards !== undefined &&
        handCards.map((card, ix) => {
          return (
            <PlayerHandCard
              card={card}
              key={ix}
              handSize={lengthOfCards}
              cardIndex={ix}
            />
          );
        })}
      {arsenalCards !== undefined &&
        arsenalCards.map((card, ix) => {
          return (
            <PlayerHandCard
              card={card}
              isArsenal
              key={ix}
              handSize={lengthOfCards}
              cardIndex={ix + handCards!.length}
            />
          );
        })}
    </div>
  );
}
