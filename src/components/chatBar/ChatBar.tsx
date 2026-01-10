import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  useGetFriendsListQuery, 
  useGetPrivateMessagesQuery,
  useSendPrivateMessageMutation,
  useGetOnlineFriendsQuery,
  useMarkMessagesAsReadMutation,
  useGetUnreadMessageCountQuery,
  useGetUnreadMessageCountByFriendQuery,
  useCreateQuickGameMutation
} from 'features/api/apiSlice';
import { Friend } from 'interface/API/FriendListAPI.php';
import { PrivateMessage } from 'interface/API/PrivateMessagingAPI.php';
import { IoMdClose, IoMdSend } from 'react-icons/io';
import { MdGames } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';
import { IoChatbubble } from 'react-icons/io5';
import styles from './ChatBar.module.scss';
import useAuth from 'hooks/useAuth';
import { toast } from 'react-hot-toast';
import { getReadableFormatName } from 'utils/formatUtils';
import { createPatreonIconMap } from 'utils/patronIcons';

interface ChatWindow {
  friend: Friend;
  isMinimized: boolean;
  unreadCount: number;
}

export const ChatBar: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [friendsPanelOpen, setFriendsPanelOpen] = useState(false);
  const [openChats, setOpenChats] = useState<Map<number, ChatWindow>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBarRef = useRef<HTMLDivElement>(null);

  const {
    data: friendsData,
    isLoading: friendsLoading
  } = useGetFriendsListQuery(undefined, {
    skip: !isLoggedIn
  });

  const {
    data: onlineFriendsData
  } = useGetOnlineFriendsQuery(undefined, {
    skip: !isLoggedIn,
    pollingInterval: 30000 // Poll every 30 seconds
  });

  const {
    data: unreadCountData
  } = useGetUnreadMessageCountQuery(undefined, {
    skip: !isLoggedIn,
    pollingInterval: 10000 // Poll every 10 seconds
  });

  const {
    data: unreadByFriendData
  } = useGetUnreadMessageCountByFriendQuery(undefined, {
    skip: !isLoggedIn,
    pollingInterval: 15000 // Poll every 15 seconds for real-time notifications
  });

  const [sendMessage] = useSendPrivateMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();
  const [createQuickGame] = useCreateQuickGameMutation();

  const totalUnread = unreadCountData?.unreadCount ?? 0;

  // Sort friends by online status, then alphabetically
  const sortedFriends = useMemo(() => {
    if (!friendsData?.friends) return [];
    
    return [...friendsData.friends].sort((a, b) => {
      const aOnlineData = onlineFriendsData?.onlineFriends?.find((f: any) => f.userId === a.friendUserId);
      const bOnlineData = onlineFriendsData?.onlineFriends?.find((f: any) => f.userId === b.friendUserId);
      
      const aIsOnline = aOnlineData?.isOnline === true;
      const aIsAway = aOnlineData?.isAway === true;
      const bIsOnline = bOnlineData?.isOnline === true;
      const bIsAway = bOnlineData?.isAway === true;
      
      const getStatusPriority = (isOnline: boolean, isAway: boolean) => {
        if (isOnline && !isAway) return 0; // Online
        if (isAway) return 1; // Away
        return 2; // Offline
      };
      
      const aPriority = getStatusPriority(aIsOnline, aIsAway);
      const bPriority = getStatusPriority(bIsOnline, bIsAway);
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      const aName = a.nickname || a.username;
      const bName = b.nickname || b.username;
      return aName.localeCompare(bName);
    });
  }, [friendsData?.friends, onlineFriendsData?.onlineFriends]);

  // Update ChatBar position to align with sticky footer (only in Lobby)
  useEffect(() => {
    const updatePosition = () => {
      const stickyFooter = document.querySelector('[class*="stickyFooter"]') as HTMLElement;
      if (stickyFooter && chatBarRef.current) {
        const footerHeight = stickyFooter.offsetHeight;
        chatBarRef.current.style.bottom = `${footerHeight}px`;
      } else if (chatBarRef.current) {
        // Reset to default position if no sticky footer found
        chatBarRef.current.style.bottom = '0px';
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    const interval = setInterval(updatePosition, 100); // Check every 100ms for changes
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      clearInterval(interval);
    };
  }, []);

  // Auto-create minimized chat tabs ONLY for friends with unread messages
  useEffect(() => {
    if (!isLoggedIn || !friendsData) return;

    const friends = friendsData.friends;
    if (!friends || friends.length === 0) return;

    const unreadByFriend = unreadByFriendData?.unreadByFriend ?? {};

    setOpenChats((prevChats) => {
      const newChats = new Map(prevChats);
      
      // For each friend with unread messages, create a minimized chat if not already open
      friends.forEach((friend) => {
        const unreadCount = unreadByFriend[friend.friendUserId] ?? 0;
        
        if (unreadCount > 0 && !newChats.has(friend.friendUserId)) {
          // Create new minimized chat ONLY if there are unread messages
          newChats.set(friend.friendUserId, {
            friend,
            isMinimized: true,
            unreadCount
          });
        } else if (newChats.has(friend.friendUserId)) {
          // Update unread count for existing chat
          const existing = newChats.get(friend.friendUserId)!;
          newChats.set(friend.friendUserId, {
            ...existing,
            unreadCount: existing.isMinimized ? unreadCount : existing.unreadCount
          });
        }
      });
      
      return newChats;
    });
  }, [isLoggedIn, friendsData, unreadByFriendData]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [openChats]);

  const handleOpenChat = (friend: Friend) => {
    setOpenChats((prev) => {
      const newChats = new Map(prev);
      if (newChats.has(friend.friendUserId)) {
        // If already open, just un-minimize it
        const existing = newChats.get(friend.friendUserId)!;
        newChats.set(friend.friendUserId, { ...existing, isMinimized: false, unreadCount: 0 });
      } else {
        // Open new chat window
        newChats.set(friend.friendUserId, {
          friend,
          isMinimized: false,
          unreadCount: 0
        });
      }
      return newChats;
    });
    setShowFriendsPanel(false);
  };

  const handleCloseChat = (friendUserId: number) => {
    setOpenChats((prev) => {
      const newChats = new Map(prev);
      newChats.delete(friendUserId);
      return newChats;
    });
  };

  const handleMinimizeChat = (friendUserId: number) => {
    setOpenChats((prev) => {
      const newChats = new Map(prev);
      const chat = newChats.get(friendUserId);
      if (chat) {
        newChats.set(friendUserId, { ...chat, isMinimized: !chat.isMinimized });
      }
      return newChats;
    });
  };

  const handleUpdateUnreadCount = (friendUserId: number, count: number) => {
    setOpenChats((prev) => {
      const newChats = new Map(prev);
      const chat = newChats.get(friendUserId);
      if (chat) {
        newChats.set(friendUserId, { ...chat, unreadCount: count });
      }
      return newChats;
    });
  };

  const handleSendMessage = async (friendUserId: number, message: string, gameLink?: string) => {
    if (!message.trim() && !gameLink) return;

    try {
      await sendMessage({ toUserId: friendUserId, message: message.trim(), gameLink }).unwrap();
    } catch (err: any) {
      toast.error(err.error || 'Failed to send message');
      console.error('Send message error:', err);
    }
  };

  const handleSendGameInvite = async (friendUserId: number) => {
    try {
      // Create a quick game with sensible defaults
      // Users can customize via CreateGame page if needed
      const gameResponse = await createQuickGame({
        format: 'cc', // Classic Constructed - good default
        visibility: 'friends-only' // Safe default for invites
      }).unwrap();

      if (gameResponse.error) {
        toast.error(gameResponse.error);
        return;
      }

      if (!gameResponse.gameName) {
        toast.error('Failed to create game');
        return;
      }

      // Generate the join link
      const gameJoinLink = `${window.location.origin}/game/join/${gameResponse.gameName}`;
      const readableFormat = getReadableFormatName('cc');
      const message = `Join my ${readableFormat} game!`;
      
      // Send message with game link
      await sendMessage({
        toUserId: friendUserId,
        message: message,
        gameLink: gameJoinLink
      }).unwrap();

      toast.success('Game created and invite sent!');
    } catch (err: any) {
      toast.error(err.error || 'Failed to create game invite');
      console.error('Game invite error:', err);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={styles.chatBar} ref={chatBarRef}>
      {/* Chat Container - Horizontal */}
      <div className={styles.chatContainer}>
        {/* Open Chat Windows */}
        {Array.from(openChats.entries()).map(([friendUserId, chat]) => (
          <ChatWindowComponent
            key={friendUserId}
            chat={chat}
            friendUserId={friendUserId}
            onClose={() => handleCloseChat(friendUserId)}
            onMinimize={() => handleMinimizeChat(friendUserId)}
            onSendMessage={(message: string, gameLink?: string) => handleSendMessage(friendUserId, message, gameLink)}
            onSendGameInvite={() => handleSendGameInvite(friendUserId)}
            onUpdateUnreadCount={(count: number) => handleUpdateUnreadCount(friendUserId, count)}
            onlineFriendsData={onlineFriendsData}
          />
        ))}

        {/* Friends List Window */}
        {friendsPanelOpen && (
          <div className={styles.chatWindow}>
            <div 
              className={styles.chatHeader}
              onClick={() => setFriendsPanelOpen(false)}
              style={{ cursor: 'pointer' }}
              title="Click to minimize"
            >
              <div className={styles.chatHeaderInfo}>
                <div className={styles.chatFriendName}>Friends</div>
              </div>
              <div className={styles.chatActions}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFriendsPanelOpen(false);
                  }}
                  title="Close"
                >
                  <IoMdClose />
                </button>
              </div>
            </div>

            <div className={styles.friendsListContainer}>
              {friendsLoading && (
                <div className={styles.emptyMessage}>Loading friends...</div>
              )}
              {!friendsLoading && sortedFriends && sortedFriends.length > 0 ? (
                sortedFriends.map((friend) => {
                  const onlineFriend = onlineFriendsData?.onlineFriends?.find(
                    (f: any) => f.userId === friend.friendUserId
                  );
                  const isOnline = onlineFriend?.isOnline === true;
                  const isAway = onlineFriend?.isAway === true;
                  
                  return (
                    <div
                      key={friend.friendUserId}
                      className={styles.friendItem}
                    >
                      <div className={`${styles.onlineIndicator} ${isOnline ? styles.online : isAway ? styles.away : styles.offline}`} />
                      <div 
                        className={styles.friendInfo}
                        onClick={() => {
                          handleOpenChat(friend);
                          setFriendsPanelOpen(false);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={styles.friendName}>
                          <div className={styles.friendIcons}>
                            {createPatreonIconMap(
                              friend.isContributor,
                              friend.isPvtVoidPatron,
                              friend.isPatron,
                              false
                            )
                              .filter(icon => icon.condition)
                              .map(icon => (
                                <a
                                  key={icon.src}
                                  href={icon.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={icon.title}
                                  className={styles.friendIcon}
                                >
                                  <img src={icon.src} alt={icon.title} />
                                </a>
                              ))}
                          </div>
                          {friend.nickname || friend.username}
                        </div>
                        {friend.nickname && (
                          <div className={styles.friendNickname}>
                            {friend.username}
                          </div>
                        )}
                        <div className={styles.friendStatus}>
                          {isAway && onlineFriend?.timeSinceActivity && (() => {
                            const minutesAway = Math.floor((onlineFriend.timeSinceActivity - 60) / 60);
                            return minutesAway > 0 ? `(away ${minutesAway}m)` : '(away)';
                          })()}
                        </div>
                      </div>
                      <button
                        className={styles.friendMessageButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChat(friend);
                        }}
                        title="Open chat"
                      >
                        <IoChatbubble size={16} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyMessage}>
                  No friends yet. Add friends to start chatting!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Friends Toggle Button */}
        {!friendsPanelOpen && (
          <button
            className={styles.friendsToggle}
            onClick={() => setFriendsPanelOpen(true)}
          >
            <span>Friends</span>
            {onlineFriendsData?.onlineFriends && onlineFriendsData.onlineFriends.filter((f: any) => f.isOnline).length > 0 && (
              <span className={styles.onlineFriendsCount}>
                ({onlineFriendsData.onlineFriends.filter((f: any) => f.isOnline).length} friend{onlineFriendsData.onlineFriends.filter((f: any) => f.isOnline).length !== 1 ? 's' : ''} online)
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

interface ChatWindowProps {
  chat: ChatWindow;
  friendUserId: number;
  onClose: () => void;
  onMinimize: () => void;
  onSendMessage: (message: string, gameLink?: string) => void;
  onSendGameInvite: () => void;
  onUpdateUnreadCount: (count: number) => void;
  onlineFriendsData?: any;
}

const ChatWindowComponent: React.FC<ChatWindowProps> = ({
  chat,
  friendUserId,
  onClose,
  onMinimize,
  onSendMessage: onSendMessageProp,
  onSendGameInvite,
  onUpdateUnreadCount,
  onlineFriendsData
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  const [markAsRead] = useMarkMessagesAsReadMutation();
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Fetch messages for this chat
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages
  } = useGetPrivateMessagesQuery(
    { friendUserId: friendUserId, limit: 50 },
    { skip: !isLoggedIn || chat.isMinimized, pollingInterval: 2000 } // Reduced from 5s to 2s for faster updates
  );

  const messages = messagesData?.messages ?? [];

  // Scroll to bottom when chat opens (initial load)
  useEffect(() => {
    if (!chat.isMinimized) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 0);
    }
  }, [chat.isMinimized]);

  // Scroll to bottom when new messages arrive (smooth scroll)
  useEffect(() => {
    if (!chat.isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chat.isMinimized]);

  // Track unread count when messages arrive while minimized
  useEffect(() => {
    if (chat.isMinimized && messages.length > 0) {
      // Count new unread messages from this friend
      const unreadFromFriend = messages.filter(
        (msg) => msg.fromUserId === friendUserId && !msg.isRead
      ).length;
      
      // Update unread count if there are new messages
      if (unreadFromFriend > 0) {
        onUpdateUnreadCount(unreadFromFriend);
      }
    }
  }, [messages, chat.isMinimized, friendUserId, onUpdateUnreadCount]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (!chat.isMinimized && messages.length > 0) {
      // Get unread message IDs (messages we received that are unread)
      const unreadMessageIds = messages
        .filter((msg) => msg.fromUserId === friendUserId && !msg.isRead)
        .map((msg) => msg.messageId);

      if (unreadMessageIds.length > 0) {
        markAsRead({ messageIds: unreadMessageIds });
        // Clear the unread badge when opening
        onUpdateUnreadCount(0);
      }
    }
  }, [chat.isMinimized, messages, friendUserId, markAsRead, onUpdateUnreadCount]);

  // Refetch messages when window is opened
  useEffect(() => {
    if (!chat.isMinimized) {
      refetchMessages();
    }
  }, [chat.isMinimized, refetchMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      // Refetch messages immediately after sending for faster feedback
      setTimeout(() => refetchMessages(), 500);
      onSendMessageProp(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (dateString: string) => {
    // Parse the UTC time from the server
    const date = new Date(dateString + 'Z'); // Add 'Z' to treat as UTC
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (chat.isMinimized) {
    return (
      <div
        className={styles.minimizedChatTab}
        onClick={onMinimize}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onMinimize();
          }
        }}
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
        title="Click to open chat"
      >
        <AiOutlineUser size={16} />
        <span>{chat.friend.nickname || chat.friend.username}</span>
        {chat.unreadCount > 0 && (
          <div className={styles.unreadBadge}>{chat.unreadCount}</div>
        )}
        <button
          className={styles.minimizedCloseButtonInline}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Close chat"
        >
          <IoMdClose size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.chatWindow}>
      <div 
        className={styles.chatHeader}
        onClick={() => {
          // Mark messages as read when clicking header to open/minimize
          if (!chat.isMinimized && messages.length > 0) {
            const unreadMessageIds = messages
              .filter((msg) => msg.fromUserId === friendUserId && !msg.isRead)
              .map((msg) => msg.messageId);

            if (unreadMessageIds.length > 0) {
              markAsRead({ messageIds: unreadMessageIds });
              onUpdateUnreadCount(0);
            }
          }
          onMinimize();
        }}
        style={{ cursor: 'pointer' }}
        title="Click to minimize"
      >
        <div className={styles.chatHeaderInfo}>
          {(() => {
            const onlineFriend = onlineFriendsData?.onlineFriends?.find(
              (f: any) => f.userId === friendUserId
            );
            const isOnline = onlineFriend?.isOnline === true;
            const isAway = onlineFriend?.isAway === true;
            return (
              <div className={`${styles.onlineIndicator} ${isOnline ? styles.online : isAway ? styles.away : styles.offline}`} />
            );
          })()}
          <div className={styles.chatFriendName}>
            <div>
              {chat.friend.nickname || chat.friend.username}
            </div>
            {(() => {
              const onlineFriend = onlineFriendsData?.onlineFriends?.find(
                (f: any) => f.userId === friendUserId
              );
              const isAway = onlineFriend?.isAway === true;
              return (
                <div className={styles.friendStatus}>
                  {isAway && onlineFriend?.timeSinceActivity && (() => {
                    const minutesAway = Math.floor((onlineFriend.timeSinceActivity - 60) / 60);
                    return minutesAway > 0 ? `(away ${minutesAway}m)` : '(away)';
                  })()}
                </div>
              );
            })()}
          </div>
        </div>
        <div className={styles.chatActions}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }} 
            title="Minimize"
          >
            _
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            title="Close"
          >
            <IoMdClose />
          </button>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messagesLoading ? (
          <div className={styles.loadingMessage}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className={styles.loadingMessage}>
            Start a conversation with {chat.friend.nickname || chat.friend.username}!
          </div>
        ) : (
          messages.map((message: PrivateMessage) => (
            <div
              key={message.messageId}
              className={`${styles.message} ${message.fromUserId !== friendUserId ? styles.sent : styles.received}`}
            >
              {message.gameLink ? (
                <a
                  href={message.gameLink}
                  className={styles.messageContentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.messageContent}>
                    <MdGames size={18} className={styles.gameIcon} />
                    {message.message}
                  </div>
                </a>
              ) : (
                <div className={styles.messageContent}>{message.message}</div>
              )}
              <div className={styles.messageTime}>{formatTime(message.createdAt)}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInput}>
        <form onSubmit={handleSubmit} className={styles.inputRow}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={styles.messageInput}
            maxLength={500}
          />
          <button
            type="submit"
            className={styles.sendButton}
          >
            <IoMdSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBar;
