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
import { IoMdArrowDropdown } from 'react-icons/io';

export default function PlayerName(player: Player) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);

  const playerName = useAppSelector((state: RootState) =>
    player.isPlayer ? state.game.playerOne.Name : state.game.playerTwo.Name
  );

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
  
  const iconMap = [
    {
      condition: isContributor,
      src: '/images/copper.webp',
      title: 'I am a contributor to Talishar!',
      href: 'https://linktr.ee/Talishar'
    },
    {
      condition: isPvtVoidPatron,
      src: '/images/patronEye.webp',
      title: 'I am a patron of PvtVoid!',
      href: 'https://linktr.ee/Talishar'
    },
    {
      condition: isPatron,
      src: '/images/patronHeart.webp',
      title: 'I am a patron of Talishar!',
      href: 'https://linktr.ee/Talishar'
    },
    {
      condition: isPracticeDummy,
      src: '/images/practiceDummy.webp',
      title: 'I am a bot!'
    }
  ];

  const getStatusClass = () => {
    if (isPvtVoidPatron) return styles.pvtVoidPatron;
    if (isContributor) return styles.contributor;
    if (isPatron) return styles.patron;
    return '';
  };

  return (
    <div className={`${styles.playerName} ${getStatusClass()}`} ref={dropdownRef}>
      <div className={styles.nameContainer}>
        <div className={styles.nameContent}>
          {iconMap.filter(icon => icon.condition).map(icon => (
            <a href={icon.href} target="_blank" rel="noopener noreferrer" key={icon.src}>
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
        </div>,
        document.body
      )}
    </div>
  );
}
