import React, { useEffect } from 'react';
import Deck from './components/deck/Deck';
import LobbyChat from './components/lobbyChat/LobbyChat';
import testData from './mockdata.json';
import styles from './Lobby.module.css';
import Equipment from './components/equipment/Equipment';
import { useState } from 'react';
import classNames from 'classnames';
import { FaExclamationCircle } from 'react-icons/fa';
import { Form, Formik } from 'formik';
import deckValidation from './validation';
import StickyFooter from './components/stickyFooter/StickyFooter';
import {
  useGetLobbyInfoQuery,
  useSubmitSideboardMutation
} from 'features/api/apiSlice';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { RootState } from 'app/Store';
import { DeckResponse, Weapon } from 'interface/API/GetLobbyInfo.php';
import LobbyUpdateHandler from './components/updateHandler/SideboardUpdateHandler';
import { GAME_FORMAT, BREAKPOINT_EXTRA_LARGE } from 'constants';
import ChooseFirstTurn from './components/chooseFirstTurn/ChooseFirstTurn';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { SubmitSideboardAPI } from 'interface/API/SubmitSideboard.php';
import { createSearchParams, useNavigate } from 'react-router-dom';
import CardPortal from '../components/elements/cardPortal/CardPortal';

const Lobby = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  const [unreadChat, setUnreadChat] = useState(false);
  const [width, height] = useWindowDimensions();
  const [isWideScreen, setIsWideScreen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gameInfo = useAppSelector(
    (state: RootState) => state.game.gameInfo,
    shallowEqual
  );
  const gameLobby = useAppSelector(
    (state: RootState) => state.game.gameLobby,
    shallowEqual
  );

  let { data, isError, isLoading } = useGetLobbyInfoQuery({
    gameName: gameInfo.gameID,
    playerID: gameInfo.playerID,
    authKey: gameInfo.authKey
  });

  const [submitSideboardMutation, submitSideboardMutationData] =
    useSubmitSideboardMutation();

  // TODO: fix the chat log notification
  // useEffect(() => {
  //   if (gameLobby?.gameLog != undefined || gameLobby?.gameLog != '')
  //     setUnreadChat(true);
  // }, [gameLobby?.gameLog]);

  // useEffect(() => {
  //   setActiveTab('chat');
  // }, [!!gameLobby?.amIChoosingFirstPlayer]);

  useEffect(() => {
    setIsWideScreen(width > BREAKPOINT_EXTRA_LARGE);
  }, [width]);

  const handleEquipmentClick = () => {
    setActiveTab('equipment');
  };

  const handleDeckClick = () => {
    setActiveTab('deck');
  };

  const handleChatClick = () => {
    setUnreadChat(false);
    setActiveTab('chat');
  };

  const handleFormSubmission = async (values: DeckResponse) => {
    setIsSubmitting(true);
    // encode it as an object
    const deck = {
      hero: data?.deck.hero,
      hands: values.weapons.map((item) => item.id.substring(0, 6)),
      head: values.head,
      chest: values.chest,
      arms: values.arms,
      legs: values.legs,
      deck: values.deck.map((card) => card.substring(0, 6))
    };
    const requestBody: SubmitSideboardAPI = {
      gameName: gameInfo.gameID,
      playerID: gameInfo.playerID,
      authKey: gameInfo.authKey,
      submission: JSON.stringify(deck) // the API unmarshals the JSON inside the unmarshaled JSON.
    };

    try {
      const data: any = await submitSideboardMutation(requestBody).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (data === undefined || data === null || Object.keys(data).length === 0) {
    data = testData;
  }

  if (data === undefined || data === null) {
    return null;
  }

  // if the game is ready then let's join the main game
  if (gameLobby?.isMainGameReady) {
    const searchParam = {
      playerID: String(gameInfo.playerID),
      gameName: String(gameInfo.gameID)
    };
    navigate({
      pathname: `/game/play/${gameInfo.gameID}`,
      search: `?${createSearchParams(searchParam)}`
    });
  }

  // I'm not sure how I can get formik to understand checkboxes and repeating cards so give them all an index here.
  const deckIndexed = data.deck.cards.map((card, ix) => `${card}-${ix}`);
  const deckSBIndexed = data.deck.cardsSB.map(
    (card, ix) => `${card}-${ix + deckIndexed.length}`
  );

  const leftPic = `url(/crops/${
    data.deck.hero === 'CardBack' ? 'UNKNOWNHERO' : data.deck.hero
  }_cropped.png)`;
  const rightPic = `url(/crops/${
    gameLobby?.theirHero === 'CardBack' ? 'UNKNOWNHERO' : gameLobby?.theirHero
  }_cropped.png)`;

  const eqClasses = classNames({ secondary: activeTab !== 'equipment' });
  const deckClasses = classNames({ secondary: activeTab !== 'deck' });
  const chatClasses = classNames({ secondary: activeTab !== 'chat' });

  let deckSize = 60;
  switch (data.format) {
    case GAME_FORMAT.BLITZ:
    case GAME_FORMAT.COMPETITIVE_BLITZ:
    case GAME_FORMAT.COMMONER:
      deckSize = 40;
      break;
    case GAME_FORMAT.OPEN_FORMAT:
      deckSize = 0;
      break;
    default:
  }

  const contentContainerClasses = classNames([
    styles.contentContainer,
    { [styles.gridContentContainer]: isWideScreen }
  ]);

  const weaponsIndexed = [
    ...data.deck.weapons,
    ...data.deck.offhand,
    ...data.deck.quiver
  ].map((card, ix) => {
    return {
      id: `${card.id}-${ix}`,
      is1H: card.is1H,
      img: `${card.id}`,
      hands: card.hands ?? (card.is1H ? 1 : 2)
    } as Weapon;
  });

  const weaponsSBIndexed = [
    ...data.deck.weaponSB,
    ...data.deck.offhandSB,
    ...data.deck.quiverSB,
    { id: `NONE00`, is1H: true, img: `NONE00` }
  ].map((card, ix) => {
    return {
      id: `${card.id}-${ix + weaponsIndexed.length}`,
      img: `${card.id}`,
      is1H: card.is1H
    } as Weapon;
  });

  const mainClassNames = classNames(styles.lobbyClass);

  return (
    <main className={mainClassNames}>
      <LobbyUpdateHandler isSubmitting={isSubmitting} />
      <div>
        <Formik
          initialValues={{
            deck: deckIndexed,
            weapons: weaponsIndexed,
            head: [...data.deck.head, ...data.deck.headSB, 'NONE00'][0],
            chest: [...data.deck.chest, ...data.deck.chestSB, 'NONE00'][0],
            arms: [...data.deck.arms, ...data.deck.armsSB, 'NONE00'][0],
            legs: [...data.deck.legs, ...data.deck.legsSB, 'NONE00'][0]
          }}
          onSubmit={handleFormSubmission}
          validationSchema={deckValidation(deckSize)}
          enableReinitialize
        >
          <Form>
            <div className={styles.titleContainer}>
              <div
                className={styles.leftCol}
                style={{ backgroundImage: leftPic }}
              >
                <div className={styles.dimPic}>
                  <h3 aria-busy={isLoading}>{data.displayName}</h3>
                  <div className={styles.heroName}>{data.deck.heroName}</div>
                </div>
              </div>
              <div
                className={styles.rightCol}
                style={{ backgroundImage: rightPic }}
              >
                <div className={styles.dimPic}>
                  <h3 aria-busy={!gameLobby?.theirName}>
                    {gameLobby?.theirName ?? ''}
                  </h3>
                  <div className={styles.heroName}>
                    {gameLobby?.theirHeroName != ''
                      ? gameLobby?.theirHeroName
                      : 'Waiting For Opponent'}
                  </div>
                </div>
              </div>
            </div>
            {gameLobby?.amIChoosingFirstPlayer ? (
              <ChooseFirstTurn />
            ) : (
              !isWideScreen && (
                <nav>
                  <ul></ul>
                  <ul>
                    <li>
                      <button
                        className={eqClasses}
                        onClick={handleEquipmentClick}
                        type="button"
                      >
                        Equipment
                      </button>
                    </li>
                    <li>
                      <button
                        className={deckClasses}
                        onClick={handleDeckClick}
                        type="button"
                      >
                        Deck
                      </button>
                    </li>
                    <li>
                      <button
                        className={chatClasses}
                        onClick={handleChatClick}
                        type="button"
                      >
                        {unreadChat && (
                          <>
                            <FaExclamationCircle />{' '}
                          </>
                        )}
                        Chat
                      </button>
                    </li>
                  </ul>
                </nav>
              )
            )}
            <div className={contentContainerClasses}>
              {(activeTab === 'equipment' || isWideScreen) && (
                <Equipment
                  lobbyInfo={data}
                  weapons={weaponsIndexed}
                  weaponSB={weaponsSBIndexed}
                />
              )}
              {(activeTab === 'deck' || isWideScreen) && (
                <Deck deck={[...deckIndexed, ...deckSBIndexed]} />
              )}
              {(activeTab === 'chat' || isWideScreen) && <LobbyChat />}
            </div>
            {!gameLobby?.amIChoosingFirstPlayer ? (
              <StickyFooter
                deckSize={deckSize}
                submitSideboard={gameLobby?.canSubmitSideboard ?? false}
              />
            ) : null}
          </Form>
        </Formik>
      </div>
      <CardPortal />
    </main>
  );
};

export default Lobby;
