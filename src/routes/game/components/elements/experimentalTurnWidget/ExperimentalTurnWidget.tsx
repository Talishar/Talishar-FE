import React, { useState, useMemo, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import Player from 'interface/Player';
import styles from './ExperimentalTurnWidget.module.css';
import classNames from 'classnames';
import { submitButton } from 'features/game/GameSlice';
import { PROCESS_INPUT } from 'appConstants';
import useSetting from 'hooks/useSetting';
import { motion, AnimatePresence } from 'framer-motion';
import { shallowEqual } from 'react-redux';
import { getGameInfo } from 'features/game/GameSlice';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import useSound from 'use-sound';
import passTurnSound from 'sounds/prioritySound.wav';
import { createPortal } from 'react-dom';
import useShortcut from 'hooks/useShortcut';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import { toast } from 'react-hot-toast';

const MANUAL_MODE = 'ManualMode';

export default function ExperimentalTurnWidget() {
  const [heightRatio, setHeightRatio] = useState(1);

  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );

  const widgetBackground = useMemo(() => {
    // Ensure canPassPhase is a boolean to prevent classnames parsing issues
    const isCanPass = Boolean(canPassPhase === true);
    return classNames(styles.widgetBackground, {
      [styles.myTurn]: isCanPass,
      [styles.ourTurn]: !isCanPass
    });
  }, [canPassPhase]);

  return (
    <div className={styles.widgetContainer}>
      <ActionPointDisplay isPlayer={false} />
      <HealthDisplay isPlayer={false} />
      <PassTurnDisplay />
      <ActionPointDisplay isPlayer />
      <HealthDisplay isPlayer />
    </div>
  );
}

function HealthDisplay(props: Player) {
  const health = useAppSelector((state: RootState) =>
    props.isPlayer ? state.game.playerOne.Health : state.game.playerTwo.Health
  );
  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';

  return (
    <div className={styles.health}>
      <div>{health}</div>
      {isManualMode && <ManualModeHealth isPlayer={props.isPlayer} />}
    </div>
  );
}

const ManualModeHealth = ({ isPlayer }: { isPlayer: Boolean }) => {
  const dispatch = useAppDispatch();
  const onAddResourceClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: isPlayer
            ? PROCESS_INPUT.ADD_1_HP_SELF
            : PROCESS_INPUT.ADD_1_HP_OPPONENT
        }
      })
    );
  };
  const onSubtractResourceClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: isPlayer
            ? PROCESS_INPUT.SUBTRACT_1_HP_SELF
            : PROCESS_INPUT.SUBTRACT_1_HP_OPPONENT
        }
      })
    );
  };
  return (
    <div className={styles.manualMode}>
      <button className={styles.drawButton} onClick={onAddResourceClick}>
        <AiOutlinePlus />
      </button>
      <button className={styles.drawButton} onClick={onSubtractResourceClick}>
        <AiOutlineMinus />
      </button>
    </div>
  );
};

export function ActionPointDisplay(props: Player) {
  const APAvailable = useAppSelector((state: RootState) =>
    Math.max(
      state.game.playerOne.ActionPoints ?? 0,
      state.game.playerTwo.ActionPoints ?? 0
    )
  );
  const amIActivePlayer = useAppSelector(
    (state: RootState) => state.game.amIActivePlayer
  );
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';

  const showAPDisplay =
    (amIActivePlayer && props.isPlayer) || gameInfo.playerID === 3;

  return (
    <>
      <AnimatePresence>
        {showAPDisplay ? (
          <motion.div
            className={classNames(styles.actionPointDisplay, {
              [styles.actionPointsPlayer]: props.isPlayer,
              [styles.actionPointsOpponent]: !props.isPlayer
            })}
            initial={{ y: props.isPlayer ? -50 : 50 }}
            animate={{ y: 0 }}
          >
            <div
              className={styles.actionPointCounter}
            >{`${APAvailable} AP`}</div>
            {isManualMode && <ManualMode />}
          </motion.div>
        ) : (
          <div></div>
        )}
      </AnimatePresence>
    </>
  );
}

const ManualMode = () => {
  const dispatch = useAppDispatch();
  const onAddResourceClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: PROCESS_INPUT.ADD_ACTION_POINT
        }
      })
    );
  };
  const onSubtractResourceClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: PROCESS_INPUT.SUBTRACT_ACTION_POINT
        }
      })
    );
  };
  return (
    <div className={styles.manualMode}>
      <button className={styles.drawButton} onClick={onAddResourceClick}>
        <AiOutlinePlus />
      </button>
      <button className={styles.drawButton} onClick={onSubtractResourceClick}>
        <AiOutlineMinus />
      </button>
    </div>
  );
};

export function PassTurnDisplay() {
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );
  const hasPriority = useAppSelector(
    (state: RootState) => state.game.hasPriority
  );
  const frameNumber = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastUpdate
  );
  const [showAreYouSureModal, setShowAreYouSureModal] =
    useState<boolean>(false);
  const [canPassController, setCanPassController] = useState<boolean>(false);
  const [playPassTurnSound] = useSound(passTurnSound);
  const preventPassPrompt = useAppSelector(
    (state: RootState) => state.game.preventPassPrompt
  );

  const dispatch = useAppDispatch();

  useMemo(() => {
    if (hasPriority) {
      playPassTurnSound();
    }
  }, [frameNumber]);

  useEffect(() => {
    let link = document.getElementById('favicon') as HTMLLinkElement;
    if (hasPriority && link) {
      link.href = '/images/priorityGreen.ico';
    } else if (link) {
      link.href = '/images/priorityGrey.ico';
    }
  }, [hasPriority]);

  const onPassTurn = () => {
    if (preventPassPrompt && !showAreYouSureModal) {
      setShowAreYouSureModal(true);
    } else {
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
    }
    setCanPassController(true);
  };

  useShortcut(DEFAULT_SHORTCUTS.PASS_TURN, onPassTurn);

  const clickYes = (e: any) => {
    e.preventDefault();
    //console.log('yes!');
    setShowAreYouSureModal(false);
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const clickNo = (e: any) => {
    e.preventDefault();
    //console.log('no!');
    setShowAreYouSureModal(false);
  };

  if (canPassPhase === undefined) {
    return (
      <div
        className={classNames(styles.passTurnDisplay, styles.passTurnInactive)}
      ></div>
    );
  }

  if (canPassPhase === true) {
    return (
      <>
        <div
          className={classNames(styles.passTurnDisplay, styles.passTurnActive)}
          onClick={onPassTurn}
        >
          <div className={styles.passText}>PASS</div>
          <div className={styles.subThing}>[spacebar]</div>
        </div>
        {showAreYouSureModal &&
          createPortal(
            <>
              <dialog open={showAreYouSureModal} className={styles.modal}>
                <article>
                  <header>{preventPassPrompt}</header>
                  <button onClick={clickYes}>Yes</button>
                  <button onClick={clickNo}>No</button>
                </article>
              </dialog>
            </>,
            document.body
          )}
      </>
    );
  }

  if (canPassPhase === false) {
    return (
      <div
        className={classNames(styles.passTurnDisplay, styles.passTurnInactive)}
      >
        WAIT
      </div>
    );
  }

  return null;
}
