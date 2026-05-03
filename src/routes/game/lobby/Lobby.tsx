import React, { useEffect, useState, useMemo, useRef } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import Deck from './components/deck/Deck';
import LobbyChat from './components/lobbyChat/LobbyChat';
import { CHAT_WHEEL } from 'constants/chatMessages';
import { useSendGameChat } from 'hooks/useSendGameChat';
import Calculator from './components/calculator/Calculator';
import testData from './mockdata.json';
import styles from './Lobby.module.css';
import Equipment from './components/equipment/Equipment';
import classNames from 'classnames';
import { FaExclamationCircle } from 'react-icons/fa';
import { GiCapeArmor } from 'react-icons/gi';
import { SiBookstack } from 'react-icons/si';
import { MdArrowDropDown, MdArrowRight } from 'react-icons/md';
import { Form, Formik, useFormikContext } from 'formik';
import deckValidation from './validation';
import StickyFooter from './components/stickyFooter/StickyFooter';
import { toast } from 'react-hot-toast';
import useAuth from 'hooks/useAuth';
import useAdScript from 'hooks/useAdScript';
import {
  useGetLobbyInfoQuery,
  useJoinGameMutation,
  useSubmitSideboardMutation,
  useSubmitLobbyInputMutation,
  useGetUserProfileQuery,
  useUpdateBazaarMatchupMutation,
  useKickPlayerMutation
} from 'features/api/apiSlice';
import { useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { RootState } from 'app/Store';
import { createPatreonIconMap } from 'utils/patronIcons';
import { DeckResponse, Weapon } from 'interface/API/GetLobbyInfo.php';
import LobbyUpdateHandler from './components/updateHandler/SideboardUpdateHandler';
import {
  GAME_FORMAT,
  BREAKPOINT_EXTRA_LARGE,
  CLOUD_IMAGES_URL,
  QUERY_STATUS,
  FAB_BAZAAR_DECK_URL_BASE
} from 'appConstants';
import { useTranslation, Trans } from 'react-i18next';

const COMPETITIVE_FORMATS = new Set([
  GAME_FORMAT.COMPETITIVE_CC,
  GAME_FORMAT.COMPETITIVE_BLITZ,
  GAME_FORMAT.COMPETITIVE_LL,
  GAME_FORMAT.COMPETITIVE_SAGE
]);
import ChooseFirstTurn from './components/chooseFirstTurn/ChooseFirstTurn';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { SubmitSideboardAPI } from 'interface/API/SubmitSideboard.php';
import { useNavigate } from 'react-router-dom';
import CardPortal from '../components/elements/cardPortal/CardPortal';
import Matchups from './components/matchups/Matchups';
import { GameLocationState } from 'interface/GameLocationState';
import { saveGameAuthKey } from 'utils/LocalKeyManagement';
import CardPopUp from '../components/elements/cardPopUp/CardPopUp';
import { clearGetLobbyRefresh, getGameInfo, setHeroInfo } from 'features/game/GameSlice';
import useSound from 'use-sound';
import playerJoined from 'sounds/playerJoinedSound.mp3';
import { createPortal } from 'react-dom';
import { useAppDispatch } from 'app/Hooks';
import { generateCroppedImageUrl } from 'utils/cropImages';
import {
  getSettingsEntity,
  fetchAllSettings,
  getSettingsStatus
} from 'features/options/optionsSlice';
import { IS_STREAMER_MODE } from 'features/options/constants';

const FAB_BAZAAR_LEARN_MORE_URL = 'https://fabbazaar.app/tutorials/talishar';

const LOBBY_PRESETS = [
  { id: 1,  label: 'Hello' },
  { id: 2,  label: 'GLHF' },
  { id: 4,  label: 'BRB' },
  { id: 5,  label: 'Undo?' },
  { id: 7,  label: 'No prob!' },
  { id: 20, label: 'Chat?' },
];

const extractBazaarDeckIdFromLink = (deckLink?: string): string | null => {
  if (!deckLink) return null;
  const normalizedBase = FAB_BAZAAR_DECK_URL_BASE.endsWith('/')
    ? FAB_BAZAAR_DECK_URL_BASE
    : `${FAB_BAZAAR_DECK_URL_BASE}/`;
  if (!deckLink.startsWith(normalizedBase)) return null;
  const deckId = deckLink.slice(normalizedBase.length).split('?')[0].trim();
  return deckId || null;
};

 const Lobby = () => {
  usePageTitle('Lobby');
  useAdScript(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('equipment');
  const [unreadChat, setUnreadChat] = useState<boolean>(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [width, height] = useWindowDimensions();
  const [isWideScreen, setIsWideScreen] = useState<boolean>(false);
  const [isDeckValid, setIsDeckValid] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasMatchups, setHasMatchups] = useState<boolean>(false);
  const [selectedMatchupId, setSelectedMatchupId] = useState<string | null>(
    null
  );
  const [isAutoApplyingMatchup, setIsAutoApplyingMatchup] =
    useState<boolean>(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const lastAutoAppliedMatchupKey = useRef<string>('');
  const { sendQuickChat } = useSendGameChat();
  const submittedMatchupRef = useRef<string | null>(null);
  const deckLinkTrackingRef = useRef<{ link: string | undefined; gameKey: string }>({
    link: undefined,
    gameKey: ''
  });
  const settingsStatus = useAppSelector(getSettingsStatus);
  const {
    isLoggedIn,
    isPatron,
    metafyId,
    metafyHash,
    metafyTimestamp,
    refreshAuth
  } = useAuth();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const { playerID, gameID, authKey } = gameInfo;
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState<boolean>(
    () => localStorage.getItem('openFormatDisclaimerAccepted') === 'true'
  );
  const gameLobby = useAppSelector(
    (state: RootState) => state.game.gameLobby,
    shallowEqual
  );
  const initialGameLobbyRef = useRef(gameLobby);
  const isBazaarDeckInLobby = !!extractBazaarDeckIdFromLink(
    gameLobby?.myDeckLink
  );
  const shouldShowMatchupsUI = (gameLobby?.matchups?.length ?? 0) > 0;
  const [playLobbyJoin] = useSound(playerJoined, { volume: 1 });
  const settingsData = useAppSelector(getSettingsEntity);
  const isMuted = settingsData['MuteSound']?.value === '1';
  const isStreamerMode = String(settingsData['IsStreamerMode']?.value) === '1';
  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();

								
  useEffect(() => {
    dispatch(clearGetLobbyRefresh());
  }, []);

  // Load settings when in lobby (same approach as SettingsPage - no active game needed)
  const dummyGameInfo = {
    playerID: 0,
    gameID: 0,
    authKey: '',
    isPrivateLobby: false
  };
  useEffect(() => {
    if (
      settingsStatus === QUERY_STATUS.IDLE ||
      Object.keys(settingsData).length === 0
    ) {
      dispatch(fetchAllSettings({ game: dummyGameInfo }));
    }
  }, []);

  // Get patron info for player 1 (you)
  const yourPatronInfo = useAppSelector(
    (state: RootState) => ({
      isPatron: state.game.playerOne.isPatron,
      isContributor: state.game.playerOne.isContributor,
      isPvtVoidPatron: state.game.playerOne.isPvtVoidPatron,
      metafyTiers: state.game.playerOne.metafyTiers
    }),
    shallowEqual
  );

  // Get patron info for player 2 (opponent)
  const opponentPatronInfo = useAppSelector(
    (state: RootState) => ({
      isPatron: state.game.playerTwo.isPatron,
      isContributor: state.game.playerTwo.isContributor,
      isPvtVoidPatron: state.game.playerTwo.isPvtVoidPatron,
      metafyTiers: state.game.playerTwo.metafyTiers
    }),
    shallowEqual
  );

  // Get user profile to access Metafy tiers (since Redux might not be populated in lobby)
  const { data: userProfileData } = useGetUserProfileQuery(undefined, {
    skip: !isLoggedIn
  });

  const extractMetafyTiers = () => {
    const tiers: string[] = [];
    const TALISHAR_COMMUNITY_ID = 'be5e01c0-02d1-4080-b601-c056d69b03f6';
    if (
      userProfileData?.metafyCommunities &&
      Array.isArray(userProfileData.metafyCommunities)
    ) {
      for (const community of userProfileData.metafyCommunities) {
        if (
          community.id === TALISHAR_COMMUNITY_ID &&
          community.subscription_tier?.name
        ) {
          tiers.push(community.subscription_tier.name);
        }
      }
    }
    return tiers;
  };

  const userMetafyTiers = extractMetafyTiers();

  // Extract patron status from profile data
  const extractPatronStatus = () => {
    return {
      isContributor: userProfileData?.isContributor ?? false,
      isPvtVoidPatron: userProfileData?.isPvtVoidPatron ?? false,
      isPatron: userProfileData?.isPatreonLinked ?? false
    };
  };

  const userPatronStatus = extractPatronStatus();

  // Note tooltip state
  const [opponentNote, setOpponentNote] = useState('');
  const [isNoteTooltipOpen, setIsNoteTooltipOpen] = useState(false);
  const [noteTooltipPosition, setNoteTooltipPosition] = useState({
    top: 0,
    left: 0
  });
  const opponentNameRef = React.useRef<HTMLHeadingElement>(null);

  let { data, isLoading, refetch } = useGetLobbyInfoQuery({
    gameName: gameID,
    playerID: playerID,
    authKey: authKey
  });

  const [submitSideboardMutation, submitSideboardMutationData] =
    useSubmitSideboardMutation();

  const [joinGameMutation] = useJoinGameMutation();

  const [updateBazaarMatchup] = useUpdateBazaarMatchupMutation();

  const [submitLobbyInput, submitLobbyInputData] =
    useSubmitLobbyInputMutation();

  const [kickPlayerMutation] = useKickPlayerMutation();

  const handleKickPlayer = async () => {
    try {
      await kickPlayerMutation({
        gameName: gameID,
        playerID: playerID,
        authKey: authKey
      }).unwrap();
      toast.success(t("GAME_LOBBY.KICKED_SUCCESS"));
    } catch (err: any) {
      toast.error(err?.error || t("GAME_LOBBY.KICKED_FAILURE"));
    }
  };

  const handleUnreadySideboard = async () => {
    try {
      await submitLobbyInput({
        gameName: gameID,
        playerID: playerID,
        authKey: authKey,
        action: 'Unready Sideboard'
      }).unwrap();
    } catch (err: any) {
      toast.error(err?.error || t("GAME_LOBBY.SIDEBOARD_UNREADY_FAILURE"));
    }
  };

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

  useEffect(() => {
    setHasMatchups(shouldShowMatchupsUI);
  }, [shouldShowMatchupsUI]);


  useEffect(() => {
    // New lobby/deck context: clear stale selected matchup from previous session.
    // Skip when myDeckLink is transiently undefined (gameLobby cleared during polling reset on submit).
    // Also skip when polling recovers with the same link — that is not a real deck change.
    const newLink = gameLobby?.myDeckLink;
    if (!newLink) return;
    const gameKey = `${gameID}:${playerID}`;
    const { link: prevLink, gameKey: prevGameKey } = deckLinkTrackingRef.current;
    if (gameKey === prevGameKey && newLink === prevLink) return;
    deckLinkTrackingRef.current = { link: newLink, gameKey };
    setSelectedMatchupId(null);
    lastAutoAppliedMatchupKey.current = '';
    submittedMatchupRef.current = null;
  }, [gameID, playerID, gameLobby?.myDeckLink]);

  useEffect(() => {
    // No opponent yet: hide any previous matchup indicator until a hero is known.
    if (!gameLobby?.theirHero || gameLobby.theirHero === 'CardBack') {
      if (!submittedMatchupRef.current) {
        setSelectedMatchupId(null);
      }
    }
  }, [gameLobby?.theirHero]);

  useEffect(() => {
    if (!gameLobby?.theirHero || gameLobby.theirHero === 'CardBack') {
      return;
    }

    if (!isBazaarDeckInLobby) {
      return;
    }

    const matchingMatchup = (gameLobby?.matchups ?? []).find(
      (matchup) =>
        matchup.matchupId?.toLowerCase?.() ===
        gameLobby.theirHero?.toLowerCase?.()
    );

    const targetMatchupId = matchingMatchup?.matchupId ?? '';
    const autoApplyKey = `${gameID}:${playerID}:${gameLobby.myDeckLink}:${gameLobby.theirHero}:${targetMatchupId || 'DEFAULT'}`;
    if (lastAutoAppliedMatchupKey.current === autoApplyKey) {
      return;
    }

    const applyMatchupForHero = async () => {
      setIsAutoApplyingMatchup(true);
      try {
        const joinPayload: any = {
          gameName: gameID,
          playerID,
          fabdb: gameLobby?.myDeckLink ?? ''
        };
        if (targetMatchupId) {
          joinPayload.matchup = targetMatchupId;
        } else {
          joinPayload.matchup = '__base__';
        }
        const joinResponse: any = await joinGameMutation(joinPayload).unwrap();
        setSelectedMatchupId(targetMatchupId || null);
        lastAutoAppliedMatchupKey.current = autoApplyKey;
        refetch();
      } catch (err) {
        console.error('[StickySideboard] Auto matchup apply failed', err);
      } finally {
        setIsAutoApplyingMatchup(false);
      }
    };

    applyMatchupForHero();
  }, [
    gameLobby?.theirHero,
    gameLobby?.myDeckLink,
    gameLobby?.matchups,
    isBazaarDeckInLobby,
    gameID,
    playerID,
    joinGameMutation,
    refetch
  ]);

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

  const toggleShowCalculator = () => {
    setShowCalculator(!showCalculator);
  };

  const handleMatchupClick = () => setActiveTab('matchups');

  const selectedMatchup = useMemo(() => {
    if (!selectedMatchupId) return null;
    return (gameLobby?.matchups ?? []).find(
      (matchup) => matchup.matchupId === selectedMatchupId
    );
  }, [selectedMatchupId, gameLobby?.matchups]);

  const selectedMatchupForCurrentHero = useMemo(() => {
    if (!selectedMatchup || !gameLobby?.theirHero) return null;
    return selectedMatchup.matchupId === gameLobby.theirHero
      ? selectedMatchup
      : null;
  }, [selectedMatchup, gameLobby?.theirHero]);

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
    if (gameLobby === initialGameLobbyRef.current) return;
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
  }, [
    gameLobby?.isMainGameReady,
    gameID,
    playerID,
    authKey,
    navigate,
    dispatch,
    data?.deck?.heroName,
    data?.deck?.hero,
    gameLobby?.theirHeroName,
    gameLobby?.theirHero
  ]);

  // Navigate home if the host kicked us
  useEffect(() => {
    if (gameLobby?.wasKicked) {
      toast.error(t("GAME_LOBBY.KICKED"));
      navigate('/');
    }
  }, [gameLobby?.wasKicked, navigate]);

  const deckClone = [...data.deck.cards];
  const deckSBClone = [...data.deck.cardsSB];
  const deckIndexed = deckClone.sort().map((card, ix) => `${card}-${ix}`);
  const deckSBIndexed = deckSBClone
    .sort()
    .map((card, ix) => `${card}-${ix + deckIndexed.length}`);

  const leftHero =
    data.deck.hero === 'CardBack' ? 'UNKNOWNHERO' : data.deck.hero;
  const rightHero =
    gameLobby?.theirHero === 'CardBack' ? 'UNKNOWNHERO' : gameLobby?.theirHero;

  const leftPic = `url(${generateCroppedImageUrl(leftHero)})`;
  const rightPic = `url(${generateCroppedImageUrl(
    rightHero ?? 'UNKNOWNHERO'
  )})`;

  const eqClasses = classNames(styles.tabButton, {
    [styles.tabActive]: activeTab === 'equipment'
  });
  const deckClasses = classNames(styles.tabButton, {
    [styles.tabActive]: activeTab === 'deck'
  });
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
      case GAME_FORMAT.GAGE:
        return { deckSize: 60, maxDeckSize: 60 };
      default:
        return { deckSize: 60, maxDeckSize: 99999 };
    }
  }, [data.format]);

  const weaponsIndexed = [...data.deck.hands].map((card, ix) => {
    return {
      id: `${card.id}-${ix}`,
      is1H: card.is1H,
      img: `${card.id}`,
      numHands: card.numHands !== undefined ? card.numHands : card.is1H ? 1 : 2,
      isQuiver: card.isQuiver ?? false,
      isOffhand: card.isOffhand ?? false,
      isCompanion: card.isCompanion ?? false
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
      numHands: card.numHands !== undefined ? card.numHands : card.is1H ? 1 : 2,
      isQuiver: card.isQuiver ?? false,
      isOffhand: card.isOffhand ?? false,
      isCompanion: card.isCompanion ?? false
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

  const oneHandedHeroes = [
    'kayo_armed_and_dangerous',
    'kayo',
    'kayo_underhanded_cheat',
    'kayo_strong_arm'
  ];
  let handsTotal = oneHandedHeroes.includes(data.deck.hero) ? 1 : 2;
  const mainClassNames = classNames(styles.lobbyClass);

  const [showChatModal, setShowChatModal] = useState(true);
  const [chatModal, setChatModal] = useState('');
  const [modal, setModal] = useState(t("GAME_LOBBY.ENABLE_CHAT_QUERY"));

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
      data.format === GAME_FORMAT.OPEN);
  // data.format === GAME_FORMAT.OPEN_LL_BLITZ
  //const needToDoDisclaimer = false;
  const leaveLobby = classNames(styles.buttonClass, 'outline');

  const handleFormSubmission = async (values: DeckResponse) => {
    const matchupIdToRestore = selectedMatchupId;
    // Pin the ref BEFORE setIsSubmitting so the theirHero guard is active
    // from the moment SideboardUpdateHandler clears gameLobby.
    submittedMatchupRef.current = matchupIdToRestore;
    setIsSubmitting(true);
    console.groupCollapsed('[StickySideboard] Submit sideboard start');
    console.info('[StickySideboard] game context', {
      gameID,
      playerID,
      hasGameAuthKey: !!authKey,
      reduxBazaarDeckId: gameInfo.bazaarDeckId ?? null,
      myDeckLink: gameLobby?.myDeckLink ?? null,
      opponentHero: gameLobby?.theirHero ?? null,
      metafyId: metafyId ?? null,
      metafyHashPresent: !!metafyHash,
      metafyTimestamp: metafyTimestamp ?? null
    });
    console.groupEnd();

    const hands = values.weapons.map((item) => item.id.split('-')[0]);
    const deck = values.deck.map((card) => card.split('-')[0]);
    const modularOriginal = [...(data?.deck?.modular ?? [])];
    const assigned = (values as any).assignedModulars || {
      head: [],
      chest: [],
      arms: [],
      legs: []
    };

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

    const filterWeaponsSB = (
      totalWeapons: Weapon[],
      equippedWeapons: string[]
    ) => {
      const indexedWeapons: any = {};

      for (const weaponName of equippedWeapons) {
        indexedWeapons[weaponName] = (indexedWeapons[weaponName] || 0) + 1;
      }

      return totalWeapons.filter((weapon) => {
        if (indexedWeapons[weapon.img]) {
          //img = name = id
          indexedWeapons[weapon.img]--;
          return false;
        }
        return true;
      });
    };

    const weaponsSB = filterWeaponsSB(
      [...weaponsIndexed, ...weaponsSBIndexed],
      [...hands]
    )
      .filter((item: { id: string }) => item.id !== 'NONE00')
      .map((item: { id: string }) => item.id.split('-')[0]);

    const inventory = [
      ...weaponsSB,
      ...(data?.deck?.headSB ?? []),
      ...(data?.deck?.chestSB ?? []),
      ...(data?.deck?.armsSB ?? []),
      ...(data?.deck?.legsSB ?? []),
      ...(data?.deck?.demiHero ?? []),
      ...modularRemaining,
      ...(deckIndexed
        .concat(deckSBIndexed)
        .filter((x) => !values.deck.includes(x))
        .map((card) => card.split('-')[0]) ?? [])
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

    // Save sideboard changes to FaB Bazaar (sticky sideboarding) BEFORE
    // submitting to Talishar, because the Talishar submit may start the game
    // immediately and any lobby refresh that follows could trigger the
    // auto-apply matchup effect with a stale/new key.
    const bazaarDeckId =
      gameInfo.bazaarDeckId ??
      extractBazaarDeckIdFromLink(gameLobby?.myDeckLink);
    const opponentHeroId = gameLobby?.theirHero;
    let resolvedMetafyId = metafyId;
    let resolvedMetafyHash = metafyHash;
    let resolvedMetafyTimestamp = metafyTimestamp;

    // If Bazaar deck/opponent are known but metafy credentials are missing,
    // force-refresh TryLoginAPI and retry with fresh values.
    if (
      bazaarDeckId &&
      opponentHeroId &&
      (!resolvedMetafyId || !resolvedMetafyHash || !resolvedMetafyTimestamp)
    ) {
      console.warn('[StickySideboard] Missing metafy credentials, forcing auth refresh', {
        resolvedMetafyId: resolvedMetafyId ?? null,
        resolvedMetafyHashPresent: !!resolvedMetafyHash,
        resolvedMetafyTimestamp: resolvedMetafyTimestamp ?? null
      });
      try {
        const refreshedAuth: any = await refreshAuth();
        const refreshed = refreshedAuth?.data;
        resolvedMetafyId = refreshed?.metafyID ?? refreshed?.metafyId ?? resolvedMetafyId;
        resolvedMetafyHash = refreshed?.metafyHash ?? resolvedMetafyHash;
        resolvedMetafyTimestamp = refreshed?.timestamp ?? resolvedMetafyTimestamp;
        console.info('[StickySideboard] Auth refresh complete', {
          refreshedMetafyId: resolvedMetafyId ?? null,
          refreshedMetafyHashPresent: !!resolvedMetafyHash,
          refreshedMetafyTimestamp: resolvedMetafyTimestamp ?? null
        });
      } catch (authRefreshErr) {
        console.error('[StickySideboard] Auth refresh failed', authRefreshErr);
      }
    }

    const canSyncBazaarSideboard =
      bazaarDeckId &&
      opponentHeroId &&
      resolvedMetafyId &&
      resolvedMetafyHash &&
      resolvedMetafyTimestamp;

    console.info('[StickySideboard] Bazaar sync gate evaluation', {
      canSyncBazaarSideboard: !!canSyncBazaarSideboard,
      bazaarDeckId: bazaarDeckId ?? null,
      opponentHeroId: opponentHeroId ?? null,
      metafyId: resolvedMetafyId ?? null,
      metafyHashPresent: !!resolvedMetafyHash,
      metafyTimestamp: resolvedMetafyTimestamp ?? null
    });

    if (canSyncBazaarSideboard) {
      const multisetDiff = (have: string[], remove: string[]): string[] => {
        const counts = new Map<string, number>();
        for (const card of have) counts.set(card, (counts.get(card) ?? 0) + 1);
        for (const card of remove) {
          const c = counts.get(card) ?? 0;
          if (c <= 1) counts.delete(card);
          else counts.set(card, c - 1);
        }
        return Array.from(counts.entries()).flatMap(([card, n]) =>
          Array(n).fill(card)
        );
      };
      // Use lobby deck data to compute which cards moved in/out of main deck
      const originalMain: string[] = data?.deck?.cards ?? [];
      const sideboardIn = multisetDiff(deck, originalMain);
      const sideboardOut = multisetDiff(originalMain, deck);
      console.info('[StickySideboard] Calling Bazaar PATCH', {
        deckId: bazaarDeckId,
        heroId: opponentHeroId,
        sideboardInCount: sideboardIn.length,
        sideboardOutCount: sideboardOut.length,
        sideboardInSample: sideboardIn.slice(0, 5),
        sideboardOutSample: sideboardOut.slice(0, 5)
      });
      // Preemptively mark the saved matchup as auto-applied so the effect does
      // not re-fire (with a new key) when the newly-created matchup entry first
      // appears in the lobby refresh and gameLobby?.matchups changes.  The save
      // always writes exactly what was submitted, so there is nothing to reload.
      lastAutoAppliedMatchupKey.current = `${gameID}:${playerID}:${gameLobby?.myDeckLink}:${opponentHeroId}:${opponentHeroId}`;
      try {
        const bazaarResponse = await updateBazaarMatchup({
          deckId: bazaarDeckId,
          heroId: opponentHeroId,
          metafyId: resolvedMetafyId,
          metafyHash: resolvedMetafyHash,
          metafyTimestamp: resolvedMetafyTimestamp,
          sideboard: { in: sideboardIn, out: sideboardOut }
        }).unwrap();
        console.info('[StickySideboard] Bazaar PATCH success', {
          success: bazaarResponse?.success ?? true,
          heroId: bazaarResponse?.data?.matchup?.heroId ?? null
        });
      } catch (bazaarErr) {
        console.error('[StickySideboard] Bazaar PATCH failed', bazaarErr);
        // Bazaar sync failure should not block the Talishar submit
      }
    } else {
      console.warn('[StickySideboard] Bazaar sync skipped - missing required data', {
        bazaarDeckId: bazaarDeckId ?? null,
        myDeckLink: gameLobby?.myDeckLink ?? null,
        opponentHeroId: opponentHeroId ?? null,
        metafyId: resolvedMetafyId ?? null,
        metafyHashPresent: !!resolvedMetafyHash,
        metafyTimestamp: resolvedMetafyTimestamp ?? null
      });
    }

    console.info('[StickySideboard] Submitting to Talishar', {
      mainDeckCount: deck.length,
      inventoryCount: inventory.length,
      requestGameID: requestBody.gameName,
      requestPlayerID: requestBody.playerID
    });

    try {
      const esponse: any = await submitSideboardMutation(requestBody).unwrap();
      console.info('[StickySideboard] Talishar submit success', {
        gameStarted: !!submitResponse?.gameStarted,
        hasNewAuthKey: !!submitResponse?.authKey
      });

      // If game started, capture and store the auth key for future use
      if (submitResponse?.gameStarted && submitResponse?.authKey && gameID) {
        saveGameAuthKey(gameID, submitResponse.authKey, playerID);
        console.log(
          'Game started! Auth key stored. Waiting for lobby to be ready...'
        );
        // The existing useEffect in this component will navigate to /game/play/{gameID}
        // when gameLobby?.isMainGameReady becomes true
      }
    } catch (err) {
      console.error('[StickySideboard] Talishar sideboard submit failed', err);
    } finally {
      setIsSubmitting(false);
      if (matchupIdToRestore) {
        setSelectedMatchupId(matchupIdToRestore);
      }
    }
  };

  return (
    <main className={mainClassNames}>
      {gameLobby?.chatInvited &&
        showChatModal &&
        createPortal(
          <>
            <dialog open className={styles.modal}>
              <article>
                <header>{modal}</header>
                <button onClick={clickYes}>{t("BASE.YES")}</button>
                <button onClick={clickNo}>{t("BASE.NO")}</button>
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
                  ⚠️{t("GAME_LOBBY.OPEN_FORMAT_DISCLAIMER_HEADER")}
                </header>
                <p style={{ marginBottom: '1em' }}>
		  <Trans
		    i18nKey="GAME_LOBBY.OPEN_FORMAT_DISCLAIMER"
		    components={[
		      <a key="judge-a0"
                    href="https://discord.gg/flesh-and-blood-judge-hub-874145774135558164"
                    target="_blank"
                  />
		    ]}
		    >
		  </Trans>
                </p>
                <div className={styles.disclaimerAcceptButtons}>
                  <button
                    onClick={() => {
                      localStorage.setItem('openFormatDisclaimerAccepted', 'true');
                      setAcceptedDisclaimer(true);
                    }}
                  >
		    {t("GAME_LOBBY.I_ACCEPT")}
                  </button>
                </div>
                <div className={styles.disclaimerButtons}>
                  <button
                    onClick={() => {
                      navigate('/');
                    }}
                    className={leaveLobby}
                  >
		    {t("GAME_LOBBY.NO_THANKS")}
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
          weapons:
            weaponsIndexed.length > 0
              ? weaponsIndexed
              : [weaponsSBIndexed.find((w) => w.img === 'NONE00')!],
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
          <FormikDebugLogger />
          <div
            className={classNames(styles.gridLayout, {
              [styles.noMatchups]: !hasMatchups,
              [styles.chatExpanded]: chatExpanded && isWideScreen && hasMatchups,
            })}
          >
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
                      {createPatreonIconMap(
                        userPatronStatus.isContributor,
                        userPatronStatus.isPvtVoidPatron,
                        userPatronStatus.isPatron,
                        false,
                        userMetafyTiers.length > 0 ? userMetafyTiers : undefined
                      )
                        .filter((icon) => icon.condition)
                        .map((icon, index) => (
                          <a
                            key={`${icon.src}-${index}`}
                            href={icon.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={icon.title}
                            style={{
                              display: 'inline-block',
                              marginRight: '0.3em'
                            }}
                          >
                            <img
                              src={icon.src}
                              alt={icon.title}
                              style={{
                                height: '1.2em',
                                verticalAlign: 'middle'
                              }}
                            />
                          </a>
                        ))}
                      {String(data.displayName ?? '').substring(0, 15)}
                    </h3>
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
                  {playerID === 1 &&
                    gameLobby?.theirHero &&
                    gameLobby.theirHero !== 'CardBack' &&
                    !COMPETITIVE_FORMATS.has(data.format as string) &&
                    !gameLobby?.amIChoosingFirstPlayer && (
                      <button
                        type="button"
                        className={styles.kickButton}
                        onClick={handleKickPlayer}
                        title={t('GAME_LOBBY.KICK_TITLE', {name: `${isStreamerMode ? 'opponent' : gameLobby.theirName}`})}
                        aria-label={t("GAME_LOBBY.KICK_LABEL")}
                      >
                        {t("GAME_LOBBY.KICK")}
                      </button>
                    )}
                  <div className={styles.dimPic}>
                    <h3
                      ref={opponentNameRef}
                      onMouseEnter={handleNoteTooltipOpen}
                      onMouseLeave={handleNoteTooltipClose}
                      aria-busy={!gameLobby}
                      style={{ cursor: opponentNote ? 'help' : 'default' }}
                    >
                      {createPatreonIconMap(
                        gameLobby?.theirIsContributor ?? false,
                        gameLobby?.theirIsPvtVoidPatron ?? false,
                        gameLobby?.theirIsPatron ? true : false,
                        false,
                        (gameLobby?.theirMetafyTiers?.length ?? 0) > 0 ? gameLobby!.theirMetafyTiers : undefined
                      )
                        .filter((icon) => icon.condition)
                        .map((icon, index) => (
                          <a
                            key={`${icon.src}-${index}`}
                            href={icon.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={icon.title}
                            style={{
                              display: 'inline-block',
                              marginRight: '0.3em'
                            }}
                          >
                            <img
                              src={icon.src}
                              alt={icon.title}
                              style={{
                                height: '1.2em',
                                verticalAlign: 'middle'
                              }}
                            />
                          </a>
                        ))}
                      {isStreamerMode
                        ? 'Opponent'
                        : String(gameLobby?.theirName ?? '').substring(0, 15)}
                    </h3>
                    <div className={styles.heroName}>
                      {gameLobby?.theirHeroName != ''
                        ? ''
                       : t("GAME_LOBBY.WAITING")}
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
                            aria-label={t("GAME_LOBBY.LEAVE_TITLE")}
                            className={leaveClasses}
                            onClick={handleLeave}
                            type="button"
                          >
			    {t("GAME_LOBBY.LEAVE")}
                          </button>
                        </li>
                      )}
                    </ul>
                    <ul>
                      {shouldShowMatchupsUI && (
                          <li>
                            <button
                              className={matchupClasses}
                              onClick={handleMatchupClick}
                              type="button"
                            >
			      {t("GAME_LOBBY.MATCHUPS")}
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
			  {t("GAME_LOBBY.EQUIPMENT")}
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
			  {t("GAME_LOBBY.DECK")}                          
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
			  {t("GAME_LOBBY.CHAT")}
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
			{t("GAME_LOBBY.EQUIPMENT")}
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
			{t("GAME_LOBBY.DECK")}
                      </button>
                    </li>
                  </ul>
                  <div style={{ marginLeft: '1rem' }}>
                    <DesktopDeckSelectionButtons
                      deckIndexed={deckIndexed}
                      deckSBIndexed={deckSBIndexed}
                      activeTab={activeTab}
                      filtersExpanded={filtersExpanded}
                      setFiltersExpanded={setFiltersExpanded}
                    />
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
                    setModularState={setModularState}
                  />
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
                    setModularState={setModularState}
                  />
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
              <div
                className={
                  !isDeckValid
                    ? styles.chatAreaContainerRestrained
                    : styles.chatAreaContainer
                }
              >
                {isWideScreen && !chatExpanded && hasMatchups ? (
                  <div className={styles.compactChat}>
                    <div className={styles.compactChatHeader}>
		      {t("GAME_LOBBY.CHAT")}		      
		    </div>
                    <MiniChatLog />
                    <div className={styles.quickChatStrip}>
                      {LOBBY_PRESETS.map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          className={styles.quickChatChip}
                          onClick={() => sendQuickChat(CHAT_WHEEL.get(id) ?? '')}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className={styles.chatExpandBtn}
                      onClick={() => setChatExpanded(true)}
                    >
		      {t("GAME_LOBBY.OPEN_CHAT")}▸
                    </button>
                  </div>
                ) : (
                  <>
                    {isWideScreen && hasMatchups && (
                      <button
                        type="button"
                        className={styles.chatToggleBtn}
                        onClick={() => setChatExpanded(false)}
                      >
                        ◂{t("GAME_LOBBY.OPEN_MATCHUPS")}
                      </button>
                    )}
                    <>{showCalculator ? <Calculator /> : <LobbyChat />}</>
                    <button
                      className={classNames(styles.smallButton, {
                        [styles.active]: showCalculator
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleShowCalculator();
                      }}
                      disabled={false}
                    >
		      {t("GAME_LOBBY.HAND_DRAW")}                      
                    </button>
                  </>
                )}
              </div>
            )}

            {!isWideScreen && activeTab !== 'chat' && (
              <div className={styles.mobileBottomActions}></div>
            )}

            <div className={styles.spacer}></div>

            {shouldShowMatchupsUI && (activeTab === 'matchups' || (isWideScreen && !chatExpanded)) && (
              <Matchups
                refetch={refetch}
                selectedMatchupId={selectedMatchupId}
                onMatchupSelected={setSelectedMatchupId}
                isAutoApplyingMatchup={isAutoApplyingMatchup}
                onExpandChat={isWideScreen ? () => setChatExpanded(true) : undefined}
                isBazaarDeck={isBazaarDeckInLobby}
              />
            )}
            <StickyFooter
              deckSize={deckSize}
              submitSideboard={gameLobby?.canSubmitSideboard ?? false}
              canUnreadySideboard={gameLobby?.canUnreadySideboard ?? false}
              isUnreadyLoading={submitLobbyInputData.isLoading}
              isSubmitting={isSubmitting}
              handleLeave={handleLeave}
              isWidescreen={isWideScreen}
              needToDoDisclaimer={needToDoDisclaimer}
              onUnreadySideboard={handleUnreadySideboard}
              onIsValidChange={setIsDeckValid}
              syncEnabled={isBazaarDeckInLobby}
              syncStatusText={
                isAutoApplyingMatchup
                  ? t("GAME_LOBBY.APPLYING_MATCHUP")
                  : selectedMatchupForCurrentHero
                  ? t("GAME_LOBBY.SYNCED_MATCHUP", { hero: selectedMatchupForCurrentHero.name ?? selectedMatchupForCurrentHero.matchupId })
                    : gameLobby?.theirHero && gameLobby.theirHero !== 'CardBack'
                  ? t("GAME_LOBBY.BASE_MATCHUP")
                  : t("GAME_LOBBY.WAITING_HERO")
              }
              syncLearnMoreUrl={FAB_BAZAAR_LEARN_MORE_URL}
            />
          </div>
        </Form>
      </Formik>
      <CardPortal />

      {/* Opponent note tooltip in lobby */}
      {opponentNote &&
        isNoteTooltipOpen &&
        createPortal(
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

const COMPACT_CHAT_RE = /<span[^>]*>(.*?):\s<\/span>/;

const MiniChatLog = () => {
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);
  const chatMessages = (chatLog ?? []).filter((m) => COMPACT_CHAT_RE.test(m));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  return (
    <div className={styles.compactChatLog}>
      {chatMessages.length === 0 ? (
        <span className={styles.compactChatEmpty}>No messages yet</span>
      ) : (
        chatMessages.map((msg, i) => (
          <div key={i}>{parseHtmlToReactElements(msg)}</div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};

const FormikDebugLogger = () => {
  const { submitCount, isValid, errors, values, isSubmitting } =
    useFormikContext<DeckResponse>();
  const previousSubmitCount = React.useRef(submitCount);

  useEffect(() => {
    if (submitCount > previousSubmitCount.current) {
      console.info('[StickySideboard/Formik] Submit attempt', {
        submitCount,
        isValid,
        errorKeys: Object.keys(errors || {}),
        selectedMainDeckCount: values.deck?.length ?? 0,
        selectedWeaponCount: values.weapons?.length ?? 0,
        isSubmitting
      });
      if (!isValid) {
        console.warn('[StickySideboard/Formik] Submit blocked by validation', {
          errors
        });
      }
      previousSubmitCount.current = submitCount;
    }
  }, [submitCount, isValid, errors, values, isSubmitting]);

  return null;
};

// Component to handle Filters, Select All/None buttons for desktop - has access to Formik context
const DesktopDeckSelectionButtons = ({
  deckIndexed,
  deckSBIndexed,
  activeTab,
  filtersExpanded,
  setFiltersExpanded,
}: {
  deckIndexed: string[];
  deckSBIndexed: string[];
  activeTab: string;
  filtersExpanded: boolean;
  setFiltersExpanded: (value: boolean) => void;
}) => {
  const { setFieldValue } = useFormikContext<DeckResponse>();
  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();

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
        title={filtersExpanded ? t("GAME_LOBBY.COLLAPSE_FILTERS") : t("GAME_LOBBY.EXPAND_FILTERS")}
      >
        {filtersExpanded ? (
          <MdArrowDropDown size={24} />
        ) : (
          <MdArrowRight size={24} />
        )}
	{t("GAME_LOBBY.FILTERS")}
      </button>
      <button
        className={styles.selectionButton}
        onClick={handleSelectAll}
        type="button"
        title={t("GAME_LOBBY.SELECT_ALL_TITLE")}
      >
	{t("GAME_LOBBY.SELECT_ALL")}	        
      </button>
      <button
        className={styles.selectionButton}
        onClick={handleSelectNone}
        type="button"
        title={t("GAME_LOBBY.SELECT_NONE_TITLE")}
      >
	{t("GAME_LOBBY.SELECT_NONE")}
      </button>
    </div>
  );
};

export default Lobby;
