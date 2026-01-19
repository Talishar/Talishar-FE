import { RootState } from 'app/Store';
import styles from './PlayerName.module.css';
import Player from 'interface/Player';
import { useAppSelector } from 'app/Hooks';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAddFriendMutation, useGetSentRequestsQuery, useCancelRequestMutation, useBlockUserMutation, useGetBlockedUsersQuery, useUnblockUserMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { MdPersonAdd } from 'react-icons/md';
import { MdBlock } from 'react-icons/md';
import { MdNotes } from 'react-icons/md';
import { IoMdArrowDropdown } from 'react-icons/io';
import PlayerNoteModal from './PlayerNoteModal';
import { createPatreonIconMap } from 'utils/patronIcons';

export default function PlayerName(player: Player) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [playerNote, setPlayerNote] = useState('');
  const [isNoteTooltipOpen, setIsNoteTooltipOpen] = useState(false);
  const [noteTooltipPosition, setNoteTooltipPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const noteButtonRef = useRef<HTMLButtonElement>(null);

  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);
  const spectatorCameraView = useAppSelector((state: RootState) => state.game.spectatorCameraView);

  // Get both player names
  const playerOneName = useAppSelector((state: RootState) => state.game.playerOne.Name);
  const playerTwoName = useAppSelector((state: RootState) => state.game.playerTwo.Name);

  // Determine which player name to display
  let playerName;
  if (playerID === 3) {
    // Spectator: show names based on their camera view
    if (spectatorCameraView === 2) {
      // Viewing player 2: board is swapped, so top (isPlayer=false) is player 1, bottom (isPlayer=true) is player 2
      playerName = player.isPlayer ? playerTwoName : playerOneName;
    } else {
      // Viewing player 1 (default): board is normal, so top (isPlayer=false) is player 2, bottom (isPlayer=true) is player 1
      playerName = player.isPlayer ? playerOneName : playerTwoName;
    }
  } else {
    // Regular player: always show own name if isPlayer, opponent's if not
    playerName = player.isPlayer ? playerOneName : playerTwoName;
  }

  // Load and manage player notes from localStorage
  const getPlayerNoteKey = (username: string) => `player_note_${username}`;

  const loadPlayerNote = (username: string) => {
    try {
      return localStorage.getItem(getPlayerNoteKey(username)) || '';
    } catch {
      return '';
    }
  };

  const savePlayerNote = (username: string, note: string) => {
    try {
      if (note.trim()) {
        localStorage.setItem(getPlayerNoteKey(username), note);
      } else {
        localStorage.removeItem(getPlayerNoteKey(username));
      }
    } catch {
      toast.error('Failed to save note');
    }
  };

  // Load note when playerName changes
  useEffect(() => {
    if (playerName) {
      setPlayerNote(loadPlayerNote(playerName));
    }
  }, [playerName]);

  const handleNoteModalOpen = () => {
    setIsNoteModalOpen(true);
  };

  const handleNoteModalClose = () => {
    setIsNoteModalOpen(false);
  };

  const handleNoteSave = (note: string) => {
    if (playerName) {
      savePlayerNote(playerName, note);
      setPlayerNote(note);
      toast.success('Note saved!');
    }
  };

  const handleNoteTooltipOpen = () => {
    if (noteButtonRef.current && playerNote) {
      const rect = noteButtonRef.current.getBoundingClientRect();
      setNoteTooltipPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
      setIsNoteTooltipOpen(true);
    }
  };

  const handleNoteTooltipClose = () => {
    setIsNoteTooltipOpen(false);
  };

  const isPatron = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.isPatron
      : state.game.playerTwo.isPatron
  );

  const isContributor = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.isContributor
      : state.game.playerTwo.isContributor
  );

  const isPvtVoidPatron = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.isPvtVoidPatron
      : state.game.playerTwo.isPvtVoidPatron
  );

  const isPracticeDummy = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.Name === 'Practice Dummy'
      : state.game.playerTwo.Name === 'Practice Dummy'
  );

  const metafyTiers = useAppSelector((state: RootState) =>
    player.isPlayer
      ? state.game.playerOne.metafyTiers
      : state.game.playerTwo.metafyTiers
  );

  // Debug logging
  useEffect(() => {
    console.log(`[PlayerName] ${playerName} - isPatron:`, isPatron, 'metafyTiers:', metafyTiers);
  }, [playerName, isPatron, metafyTiers]);

  // Friend request and block mutations
  const [addFriend] = useAddFriendMutation();
  const [cancelRequest] = useCancelRequestMutation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();

  const { data: sentData, refetch: refetchSent } = useGetSentRequestsQuery(undefined);
  const { data: blockedData, refetch: refetchBlocked } = useGetBlockedUsersQuery(undefined);

  // Create maps for username to userId lookup
  const sentRequestsByUsername = new Map(
    sentData?.sentRequests?.map((req: any) => [req.recipientUsername, req.recipientUserId]) || []
  );
  
  const blockedUsersByUsername = new Map(
    blockedData?.blockedUsers?.map((user: any) => [user.username, user.blockedUserId]) || []
  );

  // Check if current opponent has a sent request or is blocked
  const hasRequestSent = sentRequestsByUsername.has(playerName);
  const isBlocked = blockedUsersByUsername.has(playerName);
  
  // Get the user IDs for canceling requests and unblocking
  const sentRequestUserId = sentRequestsByUsername.get(playerName);
  const blockedUserId = blockedUsersByUsername.get(playerName);

  // Update dropdown position when button position changes
  const updateDropdownPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX
      });
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Check if the click is on the dropdown portal
        const dropdown = document.querySelector(`.${styles.dropdown}`);
        if (dropdown && dropdown.contains(event.target as Node)) {
          return;
        }
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleAddFriend = async () => {
    try {
      await addFriend({ friendUsername: playerName! }).unwrap();
      toast.success(`Friend request sent to ${playerName}!`);
      refetchSent();
    } catch (err: any) {
      toast.error(err.error || 'Failed to send friend request');
    }
  };

  const handleCancelFriendRequest = async () => {
    try {
      if (!sentRequestUserId) return;
      await cancelRequest({ recipientUserId: sentRequestUserId }).unwrap();
      toast.success(`Cancelled friend request to ${playerName}`);
      refetchSent();
    } catch (err: any) {
      toast.error(err.error || 'Failed to cancel friend request');
    }
  };

  const handleBlockUser = async () => {
    try {
      await blockUser({ blockedUsername: playerName! }).unwrap();
      toast.success(`${playerName} has been blocked`);
      refetchBlocked();
    } catch (err: any) {
      toast.error(err.error || 'Failed to block user');
    }
  };

  const handleUnblockUser = async () => {
    try {
      if (!blockedUserId) return;
      await unblockUser({ blockedUserId }).unwrap();
      toast.success(`${playerName} has been unblocked`);
      refetchBlocked();
    } catch (err: any) {
      toast.error(err.error || 'Failed to unblock user');
    }
  };
  
  const iconMap = createPatreonIconMap(isContributor, isPvtVoidPatron, isPatron, isPracticeDummy, metafyTiers);

  const getStatusClass = () => {
    if (isPvtVoidPatron) return styles.pvtVoidPatron;
    if (isContributor) return styles.contributor;
    if (isPatron) return styles.patron;
    return '';
  };

  return (
    <div className={`${styles.playerName} ${getStatusClass()} ${player.isPlayer ? styles.playerTwo : ''}`} ref={dropdownRef}>
      <div className={styles.nameContainer}>
        <div className={styles.nameContent}>
          {iconMap.filter(icon => icon.condition).map((icon, index) => (
            <a href={icon.href} target="_blank" rel="noopener noreferrer" key={`${icon.title}-${index}`}>
              <img
                className={styles.icon}
                src={icon.src}
                title={icon.title}
                alt={icon.title}
              />
            </a>
          ))}
          <span className={styles.name}>{String(playerName ?? '').substring(0, 30).replace('-', `Practice Dummy`)}</span>
        </div>

        {/* Dropdown arrow for opponent - hidden for Practice Dummy and spectators */}
        {!player.isPlayer && !isPracticeDummy && playerID !== 3 && (
          <div className={styles.dropdownContainer}>
            <button
              className={styles.dropdownButton}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="Open player options"
            >
              <IoMdArrowDropdown className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.open : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Dropdown menu rendered as portal for opponent - hidden for Practice Dummy and spectators */}
      {!player.isPlayer && !isPracticeDummy && playerID !== 3 && isDropdownOpen && createPortal(
        <div 
          className={`${styles.dropdown} ${getStatusClass()}`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <button
            className={`${styles.dropdownOption} ${hasRequestSent ? styles.disabled : ''}`}
            onClick={hasRequestSent ? handleCancelFriendRequest : handleAddFriend}
            title={hasRequestSent ? 'Cancel friend request' : 'Send friend request'}
          >
            <MdPersonAdd className={styles.optionIcon} />
            {hasRequestSent ? 'Request Sent' : 'Send Friend Request'}
          </button>
          <button
            className={`${styles.dropdownOption} ${isBlocked ? styles.disabled : ''}`}
            onClick={isBlocked ? handleUnblockUser : handleBlockUser}
            title={isBlocked ? 'Unblock user' : 'Block user'}
          >
            <MdBlock className={styles.optionIcon} />
            {isBlocked ? 'Blocked' : 'Block User'}
          </button>
          <button
            ref={noteButtonRef}
            className={styles.dropdownOption}
            onClick={handleNoteModalOpen}
            onMouseEnter={handleNoteTooltipOpen}
            onMouseLeave={handleNoteTooltipClose}
          >
            <MdNotes className={styles.optionIcon} />
            {playerNote ? 'Edit Note' : 'Add Note'}
          </button>
        </div>,
        document.body
      )}

      {/* Note modal for editing player notes */}
      {!player.isPlayer && !isPracticeDummy && playerID !== 3 && (
        <PlayerNoteModal
          isOpen={isNoteModalOpen}
          onClose={handleNoteModalClose}
          onSave={handleNoteSave}
          initialNote={playerNote}
          playerName={playerName || 'Player'}
        />
      )}

      {/* Note tooltip for quick preview */}
      {playerNote && isNoteTooltipOpen && createPortal(
        <div
          className={styles.noteTooltip}
          style={{
            top: `${noteTooltipPosition.top}px`,
            left: `${noteTooltipPosition.left}px`
          }}
        >
          {playerNote}
        </div>,
        document.body
      )}
    </div>
  );
}
