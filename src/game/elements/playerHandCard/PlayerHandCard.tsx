import React, { useRef, useState, useEffect } from 'react';
import {
  clearPopUp,
  playCard,
  removeCardFromHand,
  setPopUp
} from '../../../features/game/GameSlice';
import Card from '../../../features/Card';
import styles from './PlayerHandCard.module.css';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { useAppDispatch } from '../../../app/Hooks';
import { LONG_PRESS_TIMER } from '../../../constants';
import classNames from 'classnames';

const HandCurvatureConstant = 8;
const ScreenPercentageForCardPlayed = 0.25;

export interface handCard {
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

export default function PlayerHandCard(props: handCard) {
  const [controlledPosition, setControlledPosition] = useState({ x: 0, y: 0 });
  const [canPopUp, setCanPopup] = useState(true);
  const [dragging, setDragging] = useState(false);
  const { card, cardIndex, handSize, isArsenal, isBanished, isGraveyard } =
    props;

  // ref to determine if we have a long press or a short tap.
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPress = useRef<boolean>();

  if (card === undefined) {
    return <div className={styles.handCard}></div>;
  }
  const src = `./cardimages/${card.cardNumber}.webp`;
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const onDragStop = (e: DraggableEvent, data: DraggableData) => {
    if (data.lastY < -window.innerHeight * ScreenPercentageForCardPlayed) {
      playCardFunc();
    }
    setControlledPosition({ x: 0, y: 0 });
    setCanPopup(true);
    setDragging(false);
  };

  const playCardFunc = () => {
    dispatch(playCard({ cardParams: card }));
    dispatch(clearPopUp());
    if (!isBanished && !isGraveyard && !isArsenal) {
      dispatch(removeCardFromHand({ card }));
    }
  };

  const onDrag = () => {
    dispatch(clearPopUp());
    setCanPopup(false);
    setDragging(true);
  };

  const onClick = () => {
    if (isLongPress.current) {
      return;
    }
    playCardFunc();
  };

  const startPressTimer = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
    }, LONG_PRESS_TIMER);
  };

  const handleOnMouseDown = () => {
    startPressTimer();
    return;
  };

  const handleOnMouseUp = () => {
    clearTimeout(timerRef.current);
    return;
  };

  const handleOnTouchStart = () => {
    startPressTimer();
    handleMouseEnter();
    return;
  };

  const handleOnTouchEnd = () => {
    clearTimeout(timerRef.current);
    handleMouseLeave();
    return;
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

  const degree = handSize > 1 ? lerp(-15, 15, cardIndex / (handSize - 1)) : 0;

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

  const imgStyles = classNames(styles.img, {
    [styles.border6]: card.borderColor == '6'
  });

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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            onMouseDown={handleOnMouseDown}
            onMouseUp={handleOnMouseUp}
            onTouchStart={handleOnTouchStart}
            onTouchEnd={handleOnTouchEnd}
            ref={ref}
            style={translation}
          >
            <div>
              <img src={src} className={imgStyles} draggable="false" />
              <div className={styles.iconCol}>
                {isArsenal === true && (
                  <div className={styles.icon}>
                    <i
                      className="fa fa-random"
                      aria-hidden="true"
                      title="Arsenal"
                    ></i>
                  </div>
                )}
                {isBanished === true && (
                  <div className={styles.icon}>
                    <i
                      className="fa fa-cloud"
                      aria-hidden="true"
                      title="Banished Zone"
                    ></i>
                  </div>
                )}
                {isGraveyard === true && (
                  <div className={styles.icon}>
                    <i
                      className="fa fa-random"
                      aria-hidden="true"
                      title="Graveyard"
                    ></i>
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
