import React, { useEffect, useState,useMemo } from 'react';
import Deck from './components/deck/Deck';
import LobbyChat from './components/lobbyChat/LobbyChat';
import Calculator from './components/calculator/Calculator';
import testData from './mockdata.json';
import styles from './Lobby.module.css';
import Equipment from './components/equipment/Equipment';
import classNames from 'classnames';
import { FaExclamationCircle } from 'react-icons/fa';
import { GiCapeArmor } from 'react-icons/gi';
import { SiBookstack } from 'react-icons/si';
import { MdGames, MdArrowDropDown, MdArrowRight } from 'react-icons/md';
import { Form, Formik, useFormikContext } from 'formik';
import deckValidation from './validation';
import StickyFooter from './components/stickyFooter/StickyFooter';
import { toast } from 'react-hot-toast';
import useAuth from 'hooks/useAuth';
import {
  useGetLobbyInfoQuery,
  useSubmitSideboardMutation,
  useSubmitLobbyInputMutation,
  useGetFriendsListQuery,
  useSendPrivateMessageMutation,
  useCreateQuickGameMutation,
  useGetOnlineFriendsQuery
} from 'features/api/apiSlice';
import { useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { RootState } from 'app/Store';
import { DeckResponse, Weapon } from 'interface/API/GetLobbyInfo.php';
import LobbyUpdateHandler from './components/updateHandler/SideboardUpdateHandler';
import { GAME_FORMAT, BREAKPOINT_EXTRA_LARGE, CLOUD_IMAGES_URL } from 'appConstants';
import { getReadableFormatName } from 'utils/formatUtils';
import ChooseFirstTurn from './components/chooseFirstTurn/ChooseFirstTurn';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { SubmitSideboardAPI } from 'interface/API/SubmitSideboard.php';
import { useNavigate } from 'react-router-dom';
import CardPortal from '../components/elements/cardPortal/CardPortal';
import Matchups from './components/matchups/Matchups';
import { GameLocationState } from 'interface/GameLocationState';
import { saveGameAuthKey } from 'utils/LocalKeyManagement';
import CardPopUp from '../components/elements/cardPopUp/CardPopUp';
import { getGameInfo, setHeroInfo } from 'features/game/GameSlice';
import useSound from 'use-sound';
import playerJoined from 'sounds/playerJoinedSound.mp3';
import { createPortal } from 'react-dom';
import { useAppDispatch } from 'app/Hooks';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { getSettingsEntity } from 'features/options/optionsSlice';
import { ChatBar } from '../../../components/chatBar/ChatBar';

const Lobby = () => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('equipment');
  const [unreadChat, setUnreadChat] = useState<boolean>(false);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [width, height] = useWindowDimensions();
  const [isWideScreen, setIsWideScreen] = useState<boolean>(false);
  const [isDeckValid, setIsDeckValid] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { isLoggedIn } = useAuth();
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState<boolean>(false);
  const gameLobby = useAppSelector(
    (state: RootState) => state.game.gameLobby,
    shallowEqual
  );
  const [playLobbyJoin] = useSound(playerJoined, { volume: 1 });
  const { isPatron } = useAuth();
  const settingsData = useAppSelector(getSettingsEntity);
  const isMuted = settingsData['MuteSound']?.value === '1';

  // Note tooltip state
  const [opponentNote, setOpponentNote] = useState('');
  const [isNoteTooltipOpen, setIsNoteTooltipOpen] = useState(false);
  const [noteTooltipPosition, setNoteTooltipPosition] = useState({ top: 0, left: 0 });
  const opponentNameRef = React.useRef<HTMLHeadingElement>(null);

  let { data, isLoading, refetch } = useGetLobbyInfoQuery({
    gameName: gameID,
    playerID: playerID,
    authKey: authKey
  });

  const [submitSideboardMutation, submitSideboardMutationData] =
    useSubmitSideboardMutation();

  const [submitLobbyInput, submitLobbyInputData] =
    useSubmitLobbyInputMutation();

  // Friends and game invite queries/mutations
  const { data: friendsData } = useGetFriendsListQuery(undefined, {
    skip: !isLoggedIn
  });

  const { data: onlineFriendsData } = useGetOnlineFriendsQuery(undefined, {
    skip: !isLoggedIn,
    pollingInterval: 30000 // Poll every 30 seconds
  });

  const [sendMessage] = useSendPrivateMessageMutation();
  const [createQuickGame] = useCreateQuickGameMutation();

  // Sort friends by status (online, away, offline) then alphabetically
  const sortedFriends = useMemo(() => {
    if (!friendsData?.friends) return [];
    
    return [...friendsData.friends].sort((a, b) => {
      const aOnlineData = onlineFriendsData?.onlineFriends?.find((f: any) => f.userId === a.friendUserId);
      const bOnlineData = onlineFriendsData?.onlineFriends?.find((f: any) => f.userId === b.friendUserId);
      
      const aStatus = (aOnlineData as any)?.status || 'offline';
      const bStatus = (bOnlineData as any)?.status || 'offline';
      
      // Determine status priority
      const getStatusPriority = (status: string) => {
        if (status === 'online') return 0; // Online first
        if (status === 'away' || status === 'idle') return 1; // Away second
        return 2; // Offline last
      };
      
      const aPriority = getStatusPriority(aStatus);
      const bPriority = getStatusPriority(bStatus);
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Within same status, sort alphabetically by nickname or username
      const aName = a.nickname || a.username;
      const bName = b.nickname || b.username;
      return aName.localeCompare(bName);
    });
  }, [friendsData?.friends, onlineFriendsData?.onlineFriends]);

  useEffect(() => {
    // Only play sound when opponent first joins (when theirName becomes populated)
    // Don't play on other updates like messages, invites, etc.
    if (gameLobby?.theirName && gameLobby.theirName !== '' && !isMuted) {
      playLobbyJoin();
    }
  }, [gameLobby?.theirName, isMuted]);

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

  const handleSendGameInviteFromLobby = async (friendUserId: number) => {
    try {
      if (!gameID) {
        toast.error('Game not started yet. Create a game first!');
        return;
      }

      // Send the current lobby link to the friend
      const gameJoinLink = `${window.location.origin}/game/join/${gameID}`;
      const readableFormat = getReadableFormatName(data?.format || '');
      const message = readableFormat ? `Join my ${readableFormat} game!` : 'Join my game!';
      
      await sendMessage({
        toUserId: friendUserId,
        message: message,
        gameLink: gameJoinLink
      }).unwrap();

      toast.success(`Invite sent to friend!`);
    } catch (err: any) {
      toast.error(err.error || 'Failed to send invite');
    }
  };

  const toggleShowCalculator = () => {
    setShowCalculator(!showCalculator);
  };

  const handleMatchupClick = () => setActiveTab('matchups');

  // Note functions
  const getPlayerNoteKey = (username: string) => `player_note_${username}`;

  const loadPlayerNote = (username: string) => {
    try {
      return localStorage.getItem(getPlayerNoteKey(username)) || '';
    } catch {
      return '';
    }
  };

  const handleNoteTooltipOpen = () => {
    if (opponentNameRef.current && gameLobby?.theirName) {
      const note = loadPlayerNote(gameLobby.theirName);
      if (note) {
        const rect = opponentNameRef.current.getBoundingClientRect();
        setNoteTooltipPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX
        });
        setOpponentNote(note);
        setIsNoteTooltipOpen(true);
      }
    }
  };

  const handleNoteTooltipClose = () => {
    setIsNoteTooltipOpen(false);
  };

  if (!data || !data.deck || Object.keys(data).length === 0) {
    data = testData;
  }

  if (!data || !data.deck) return null;

  // Navigate to main game when ready - must be in useEffect to avoid setState during render
  useEffect(() => {
    if (gameLobby?.isMainGameReady) {
      // Dispatch hero info to Redux before navigating
      dispatch(
        setHeroInfo({
          heroName: data?.deck?.heroName,
          yourHeroCardNumber: data?.deck?.hero,
          opponentHeroName: gameLobby?.theirHeroName,
          opponentHeroCardNumber: gameLobby?.theirHero
        })
      );
      
      navigate(`/game/play/${gameID}`, {
        state: { 
          playerID: playerID ?? 0,
          authKey: authKey
        } as GameLocationState
      });
    }
  }, [gameLobby?.isMainGameReady, gameID, playerID, authKey, navigate, dispatch, data?.deck?.heroName, data?.deck?.hero, gameLobby?.theirHeroName, gameLobby?.theirHero]);

  const deckClone = [...data.deck.cards];
  const deckSBClone = [...data.deck.cardsSB];
  const deckIndexed = deckClone.sort().map((card, ix) => `${card}-${ix}`);
  const deckSBIndexed = deckSBClone
    .sort()
    .map((card, ix) => `${card}-${ix + deckIndexed.length}`);

    const leftHero = data.deck.hero === 'CardBack' ? 'UNKNOWNHERO' : data.deck.hero;
    const rightHero = gameLobby?.theirHero === 'CardBack' ? 'UNKNOWNHERO' : gameLobby?.theirHero;

  const leftPic = `url(${generateCroppedImageUrl(leftHero)})`;
  const rightPic = `url(${generateCroppedImageUrl(rightHero ?? 'UNKNOWNHERO')})`;

  const eqClasses = classNames({});
  const deckClasses = classNames({});
  const chatClasses = classNames({});
  const matchupClasses = classNames({});
  const leaveClasses = classNames('outline');

  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // TODO: Need a way to announce to the server that we are leaving
    navigate(`/`);
  };

  const { deckSize, maxDeckSize } = useMemo(() => {
    switch (data.format) {
      case GAME_FORMAT.BLITZ:
      case GAME_FORMAT.COMMONER:
      case GAME_FORMAT.COMPETITIVE_BLITZ:
      case GAME_FORMAT.COMMONER:
      case GAME_FORMAT.CLASH:
      case GAME_FORMAT.SAGE:
      case GAME_FORMAT.COMPETITIVE_SAGE:
      case GAME_FORMAT.OPEN_SAGE:
        return { deckSize: 40, maxDeckSize: 40 };
      case GAME_FORMAT.SEALED:
      case GAME_FORMAT.DRAFT:
        return { deckSize: 30, maxDeckSize: 30 };
      case GAME_FORMAT.OPEN_BLITZ:
      case GAME_FORMAT.OPEN:
        return { deckSize: 0, maxDeckSize: 99999 };
      default:
        return { deckSize: 60, maxDeckSize: 99999 };
    }
  }, [data.format]);
  

  const weaponsIndexed = [...data.deck.hands].map((card, ix) => {
    return {
      id: `${card.id}-${ix}`,
      is1H: card.is1H,
      img: `${card.id}`,
      numHands: card.numHands ?? (card.is1H ? 1 : 2),
      isQuiver: card.isQuiver ?? false,
      isOffhand: card.isOffhand ?? false
    } as Weapon;
  });

  const weaponsSBIndexed = [
    ...data.deck.handsSB,
    { id: `NONE00`, is1H: true, img: `NONE00`, numHands: 0 }
  ].map((card, ix) => {
    return {
      id: `${card.id}-${ix + weaponsIndexed.length}`,
      img: `${card.id}`,
      is1H: card.is1H,
      numHands: card.numHands ?? (card.is1H ? 1 : 2),
      isQuiver: card.isQuiver ?? false,
      isOffhand: card.isOffhand ?? false
    } as Weapon;
  });

  const hasModular = (data.deck.modular?.length ?? 0) > 0;
  const initialEquipment = (main: string[], side: string[]) => {
    if (hasModular) {
      return [...main, 'NONE00'].filter((id) => id !== 'EVO013')[0];
    } else {
      return [...main, ...side, 'NONE00'][0];
    }
  };
  
  type EquipFieldName = 'head' | 'chest' | 'arms' | 'legs';
  
  const [assigned, setAssigned] = React.useState<
    Record<EquipFieldName, string[]>
  >({
    head: [],
    chest: [],
    arms: [],
    legs: []
  });

  const hands = React.useMemo(
    () => [...weaponsIndexed, ...weaponsSBIndexed],
    [weaponsIndexed, weaponsSBIndexed]
  );
  
  const baseEquipment = React.useMemo(
    () => ({
      head: [...data.deck.head, ...data.deck.headSB],
      chest: [...data.deck.chest, ...data.deck.chestSB],
      arms: [...data.deck.arms, ...data.deck.armsSB],
      legs: [...data.deck.legs, ...data.deck.legsSB],
      demi: data.deck.demiHero ?? [],
      modular: data.deck.modular ?? []
    }),
    [data.deck]
  );
  
  const [modularState, setModularState] = React.useState<string[]>(
    baseEquipment.modular
  );

  React.useEffect(() => {
    setAssigned({ head: [], chest: [], arms: [], legs: [] });
    setModularState(baseEquipment.modular);
  }, [baseEquipment.modular]);
  
  const oneHandedHeroes = ['kayo_armed_and_dangerous', 'kayo', 'kayo_underhanded_cheat', 'kayo_strong_arm'];
  let handsTotal = oneHandedHeroes.includes(data.deck.hero) ? 1 : 2;
  const mainClassNames = classNames(styles.lobbyClass);

  const [showChatModal, setShowChatModal] = useState(true);
  const [chatModal, setChatModal] = useState('');
  const [modal, setModal] = useState('Do you want to enable chat?');

  const clickYes = (e: any) => {
    e.preventDefault();
    setShowChatModal(false);
    submitLobbyInput({
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      action: 'Request Chat'
    });
  };

  const clickNo = (e: any) => {
    e.preventDefault();
    setShowChatModal(false);
  };
  const needToDoDisclaimer =
    !acceptedDisclaimer &&
    (data.format === GAME_FORMAT.OPEN_CC ||
      data.format === GAME_FORMAT.OPEN_BLITZ ||
      data.format === GAME_FORMAT.OPEN_LL_CC ||
      data.format === GAME_FORMAT.OPEN_SAGE ||
      data.format === GAME_FORMAT.OPEN
      // data.format === GAME_FORMAT.OPEN_LL_BLITZ
    );
  //const needToDoDisclaimer = false;
  const leaveLobby = classNames(styles.buttonClass, 'outline');

  const handleFormSubmission = async (values: DeckResponse) => {
    setIsSubmitting(true);

    const hands = values.weapons.map((item) => item.id.split("-")[0]);
    const deck = values.deck.map((card) => card.split("-")[0]);
    const modularOriginal = [...(data?.deck?.modular ?? [])];
    const assigned = (values as any).assignedModulars || { head: [], chest: [], arms: [], legs: [] };

    const removeOne = (arr: string[], val: string) => {
      const i = arr.indexOf(val);
      if (i === -1) return arr.slice();
      const copy = arr.slice();
      copy.splice(i, 1);
      return copy;
    };

    let modularRemaining = modularOriginal.slice();
    Object.keys(assigned).forEach((k) => {
      const list: string[] = (assigned as any)[k] || [];
      list.forEach((c) => {
        modularRemaining = removeOne(modularRemaining, c);
      });
    });

    const filterWeaponsSB = (totalWeapons: Weapon[], equippedWeapons: string[]) => {
    const indexedWeapons: any = {};

    for (const weaponName of equippedWeapons) {
      indexedWeapons[weaponName] = (indexedWeapons[weaponName] || 0) + 1;
    }

      return totalWeapons.filter((weapon) => {
        if (indexedWeapons[weapon.img]) { //img = name = id
          indexedWeapons[weapon.img]--;
          return false;
        }
        return true;
      });
    };

    const weaponsSB = filterWeaponsSB([...weaponsIndexed, ...weaponsSBIndexed], [...hands])
      .filter((item: { id: string; }) => item.id !== 'NONE00')
      .map((item: { id: string; }) => item.id.split("-")[0]);

    const inventory = [
      ...weaponsSB,
      ...(data?.deck?.headSB ?? []),
      ...(data?.deck?.chestSB ?? []),
      ...(data?.deck?.armsSB ?? []),
      ...(data?.deck?.legsSB ?? []),
      ...(data?.deck?.demiHero ?? []),
      ...modularRemaining,
      ...(((deckIndexed.concat(deckSBIndexed))
      .filter(x => !values.deck.includes(x)))
      .map((card) => card.split("-")[0]) ?? [])
    ].filter((item) => item !== 'NONE00');

    const submitDeck = {
      hero: data?.deck.hero,
      hands,
      head: values.head,
      chest: values.chest,
      arms: values.arms,
      legs: values.legs,
      deck,
      inventory
    };
    const requestBody: SubmitSideboardAPI = {
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      submission: JSON.stringify(submitDeck) // the API unmarshals the JSON inside the unmarshaled JSON.
    };

    try {
      const data: any = await submitSideboardMutation(requestBody).unwrap();
      
      // If game started, capture and store the auth key for future use
      if (data?.gameStarted && data?.authKey && gameID) {
        saveGameAuthKey(gameID, data.authKey, playerID);
        console.log("Game started! Auth key stored. Waiting for lobby to be ready...");
        // The existing useEffect in this component will navigate to /game/play/{gameID}
        // when gameLobby?.isMainGameReady becomes true
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={mainClassNames}>
      {isWideScreen && <ChatBar />}
      {gameLobby?.chatInvited &&
        showChatModal &&
        createPortal(
          <>
            <dialog open className={styles.modal}>
              <article>
                <header>{modal}</header>
                <button onClick={clickYes}>Yes</button>
                <button onClick={clickNo}>No</button>
              </article>
            </dialog>
          </>,
          document.body
        )}
      {needToDoDisclaimer &&
        createPortal(
          <>
            <dialog open={needToDoDisclaimer}>
              <article className={styles.disclaimerArticles}>
                <header className={styles.disclaimerHeader}>
                  ⚠️ Open Format Disclaimer
                </header>
                <p style={{ marginBottom: '1em' }}>
                  Note that new cards are added on a 'best-effort' basis and
                  there may be more bugs and innacurate card interactions. 
                  It may not be a completely accurate representation of the Rules
                  as written. If you have questions about interactions or rulings,
                  please contact the <a href="https://discord.gg/flesh-and-blood-judge-hub-874145774135558164" target="_blank"> JudgeHub Discord</a> for clarification.
                </p>
                <div className={styles.disclaimerAcceptButtons}>
                  <button
                    onClick={() => {
                      setAcceptedDisclaimer(true);
                    }}
                  >
                    I Accept!
                  </button>
                </div>
                <div className={styles.disclaimerButtons}>
                  <button
                    onClick={() => {
                      navigate('/');
                    }}
                    className={leaveLobby}
                  >
                    No Thanks!
                  </button>
                </div>
              </article>
            </dialog>
          </>,
          document.body
        )}
      <LobbyUpdateHandler isSubmitting={isSubmitting} />
      <Formik
        initialValues={{
          hero: data?.deck.hero,
          deck: deckIndexed,
          weapons: weaponsIndexed,
          head: initialEquipment(data.deck.head, data.deck.headSB),
          chest: initialEquipment(data.deck.chest, data.deck.chestSB),
          arms: initialEquipment(data.deck.arms, data.deck.armsSB),
          legs: initialEquipment(data.deck.legs, data.deck.legsSB),
          assignedModulars: { head: [], chest: [], arms: [], legs: [] }
        }}
        onSubmit={handleFormSubmission}
        validationSchema={deckValidation(deckSize, maxDeckSize, handsTotal)}
        validateOnChange={true}
        validateOnBlur={true}
        validateOnMount={true}
        enableReinitialize
      >
        <Form className={styles.form}>
          <div className={classNames(styles.gridLayout, {
            [styles.noMatchups]: !gameLobby?.matchups || gameLobby.matchups.length === 0
          })}>
            <div className={styles.titleContainer}>
              <CardPopUp
                cardNumber={data.deck.hero}
                containerClass={styles.leftCol}
              >
                <div
                  className={styles.leftCol}
                  style={{ backgroundImage: leftPic }}
                >
                  <div className={styles.dimPic}>
                    <h3 aria-busy={isLoading}>
                      {String(data.displayName ?? '').substring(0, 15)}
                    </h3>
                    <div className={styles.heroName}>{data.deck.heroName}</div>
                  </div>
                </div>
              </CardPopUp>
              <CardPopUp
                cardNumber={gameLobby?.theirHero ?? 'CardBack'}
                containerClass={styles.rightCol}
              >
                <div
                  className={styles.rightCol}
                  style={{ backgroundImage: rightPic }}
                >
                  <div className={styles.dimPic}>
                    <h3 
                      ref={opponentNameRef}
                      onMouseEnter={handleNoteTooltipOpen}
                      onMouseLeave={handleNoteTooltipClose}
                      aria-busy={!gameLobby?.theirName}
                      style={{ cursor: opponentNote ? 'help' : 'default' }}
                    >
                      {String(gameLobby?.theirName ?? '').substring(0, 15)}
                    </h3>
                    <div className={styles.heroName}>
                      {gameLobby?.theirHeroName != ''
                        ? gameLobby?.theirHeroName
                        : 'Waiting For Opponent'}
                    </div>
                  </div>
                </div>
              </CardPopUp>
            </div>
            {gameLobby?.amIChoosingFirstPlayer && !needToDoDisclaimer
              ? createPortal(<ChooseFirstTurn />, document.body)
              : !isWideScreen && (
                  <nav className={styles.mobileNav}>
                    <ul>
                      {!isWideScreen && (
                        <li>
                          <button
                            aria-label="Leave the lobby"
                            className={leaveClasses}
                            onClick={handleLeave}
                            type="button"
                          >
                            Leave
                          </button>
                        </li>
                      )}
                    </ul>
                    <ul>
                      {gameLobby?.matchups != undefined &&
                        gameLobby?.matchups?.length > 0 && (
                          <li>
                            <button
                              className={matchupClasses}
                              onClick={handleMatchupClick}
                              type="button"
                            >
                              Matchups
                            </button>
                          </li>
                        )}
                      <li>
                        <button
                          className={eqClasses}
                          onClick={handleEquipmentClick}
                          type="button"
                        >
                          <div className={styles.icon}>
                            <GiCapeArmor />
                          </div>
                          Equipment
                        </button>
                      </li>
                      <li>
                        <button
                          className={deckClasses}
                          onClick={handleDeckClick}
                          type="button"
                        >
                          <div className={styles.icon}>
                            <SiBookstack />
                          </div>
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
                )}
            {isWideScreen ? (
              <div className={styles.deckSelectorContainer}>
                <nav className={styles.inLineNav}>
                  <ul>
                    <li>
                      <button
                        className={eqClasses}
                        onClick={handleEquipmentClick}
                        type="button"
                      >
                        <div className={styles.icon}>
                          <GiCapeArmor />
                        </div>
                        Equipment
                      </button>
                    </li>
                    <li>
                      <button
                        className={deckClasses}
                        onClick={handleDeckClick}
                        type="button"
                      >
                        <div className={styles.icon}>
                          <SiBookstack />
                        </div>
                        Deck
                      </button>
                    </li>
                  </ul>
                  <div style={{ marginLeft: 'auto' }}>
                    <DesktopDeckSelectionButtons deckIndexed={deckIndexed} deckSBIndexed={deckSBIndexed} activeTab={activeTab} filtersExpanded={filtersExpanded} setFiltersExpanded={setFiltersExpanded} />
                  </div>
                </nav>
                {activeTab !== 'deck' && (
                  <Equipment
                    lobbyInfo={data}
                    weapons={weaponsIndexed}
                    weaponSB={weaponsSBIndexed}
                    assigned={assigned}
                    setAssigned={setAssigned}
                    baseEquipment={baseEquipment}
                    hands={hands}
                    modularState={modularState}
                    setModularState={setModularState} />
                )}
                {activeTab === 'deck' && (
                  <Deck 
                    deck={[...deckIndexed, ...deckSBIndexed]} 
                    cardDictionary={data?.deck?.cardDictionary}
                    filtersExpanded={filtersExpanded}
                    setFiltersExpanded={setFiltersExpanded}
                    isDesktop={true}
                  />
                )}
              </div>
            ) : (
              <>
                {activeTab === 'equipment' && (
                  <Equipment
                    lobbyInfo={data}
                    weapons={weaponsIndexed}
                    weaponSB={weaponsSBIndexed}
                    assigned={assigned}
                    setAssigned={setAssigned}
                    baseEquipment={baseEquipment}
                    hands={hands}
                    modularState={modularState}
                    setModularState={setModularState} />
                )}
                {activeTab === 'deck' && (
                  <Deck 
                    deck={[...deckIndexed, ...deckSBIndexed]} 
                    cardDictionary={data?.deck?.cardDictionary}
                    filtersExpanded={filtersExpanded}
                    setFiltersExpanded={setFiltersExpanded}
                    isDesktop={false}
                  />
                )}
              </>
            )}
            {(activeTab === 'chat' || isWideScreen) && (
              <div className={!isDeckValid ? styles.chatAreaContainerRestrained : styles.chatAreaContainer}>
                {showFriendsPanel ? (
                  // Friends Panel
                  <div className={styles.friendsPanel}>
                    <div className={styles.friendsPanelHeader}>
                      <h3>Invite Friends</h3>
                      <button 
                        onClick={() => setShowFriendsPanel(false)}
                        className={styles.friendsPanelCloseButton}
                      >
                        ×
                      </button>
                    </div>
                    {friendsData?.friends && friendsData.friends.length > 0 ? (
                      <div className={styles.friendsList}>
                        {sortedFriends.map((friend) => {
                          const onlineFriend = onlineFriendsData?.onlineFriends?.find(
                            (f: any) => f.userId === friend.friendUserId
                          );
                          const isOnline = onlineFriend?.isOnline === true;
                          
                          return (
                            <div key={friend.friendUserId} className={styles.friendItem}>
                              <div className={classNames(styles.friendOnlineIndicator, { [styles.online]: isOnline })} />
                              <span className={styles.friendName}>{friend.nickname || friend.username}</span>
                              <button 
                                onClick={() => handleSendGameInviteFromLobby(friend.friendUserId)}
                                className={styles.friendInviteButton}
                              >
                                <MdGames size={18} />
                                Invite
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className={styles.friendsEmptyState}>No friends to invite</p>
                    )}
                  </div>
                ) : (
                  <>
                    {showCalculator ? <Calculator /> : <LobbyChat />}
                  </>
                )}
                {!showFriendsPanel && (
                  <button
                    className={classNames(styles.smallButton, { [styles.active]: showCalculator })}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleShowCalculator();
                    }}
                    disabled={false}
                  >
                    Hand Draw Probabilities
                  </button>
                )}
              </div>
            )}

            {!isWideScreen && (activeTab !== 'chat') && (
              <div className={styles.mobileBottomActions}>
              </div>
            )}

            <div className={styles.spacer}></div>

            {(activeTab === 'matchups' || isWideScreen) && (
              <Matchups refetch={refetch} />
            )}
            <StickyFooter
              deckSize={deckSize}
              submitSideboard={gameLobby?.canSubmitSideboard ?? false}
              handleLeave={handleLeave}
              isWidescreen={isWideScreen}
              needToDoDisclaimer={needToDoDisclaimer}
              onSendInviteClick={() => setShowFriendsPanel(!showFriendsPanel)}
              onIsValidChange={setIsDeckValid}
            />
          </div>
        </Form>
      </Formik>
      <CardPortal />

      {/* Opponent note tooltip in lobby */}
      {opponentNote && isNoteTooltipOpen && createPortal(
        <div
          className={styles.noteTooltip}
          style={{
            top: `${noteTooltipPosition.top}px`,
            left: `${noteTooltipPosition.left}px`
          }}
        >
          {opponentNote}
        </div>,
        document.body
      )}
    </main>
  );
};

// Component to handle Filters, Select All/None buttons for desktop - has access to Formik context
const DesktopDeckSelectionButtons = ({ deckIndexed, deckSBIndexed, activeTab, filtersExpanded, setFiltersExpanded }: { deckIndexed: string[], deckSBIndexed: string[], activeTab: string, filtersExpanded: boolean, setFiltersExpanded: (value: boolean) => void }) => {
  const { setFieldValue } = useFormikContext<DeckResponse>();
  
  const handleSelectAll = () => {
    const allCards = [...deckIndexed, ...deckSBIndexed];
    setFieldValue('deck', allCards);
  };

  const handleSelectNone = () => {
    setFieldValue('deck', []);
  };

  // Only show buttons when Deck tab is active
  if (activeTab !== 'deck') {
    return null;
  }

  return (
    <div className={styles.selectionButtons}>
      <button
        className={styles.selectionButton}
        onClick={() => setFiltersExpanded(!filtersExpanded)}
        type="button"
        title={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
      >
        {filtersExpanded ? <MdArrowDropDown size={24} /> : <MdArrowRight size={24} />}
        Filters
      </button>
      <button
        className={styles.selectionButton}
        onClick={handleSelectAll}
        type="button"
        title="Select all cards"
      >
        Select All
      </button>
      <button
        className={styles.selectionButton}
        onClick={handleSelectNone}
        type="button"
        title="Deselect all cards"
      >
        Select None
      </button>
    </div>
  );
};

export default Lobby;
