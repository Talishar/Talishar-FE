import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import ChatInput from '../chatInput/ChatInput';
import styles from './ChatBox.module.css';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import classNames from 'classnames';
import { useCheckOpponentTypingQuery } from 'features/api/apiSlice';
import { METAFY_TIER_MAP, MetafyTierName } from 'utils/patronIcons';

const CHAT_RE = /<span[^>]*>(.*?):\s<\/span>/;
const TYPING_TIMEOUT_MS = 5000; // 5 seconds

export default function ChatBox() {
  const amIPlayerOne = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 1;
  });
  const gameID = useAppSelector((state: RootState) => state.game.gameInfo.gameID);
  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);
  const chatEnabled = useAppSelector((state: RootState) => state.game.chatEnabled);
  const [chatFilter, setChatFilter] = useState<'none' | 'chat' | 'log'>('none');
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);
  const [displayTyping, setDisplayTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Only poll when chat is enabled and we're a valid player (skip spectators)
  const shouldPoll = chatEnabled && (playerID === 1 || playerID === 2) && !!gameID;

  const { data: typingData, error: typingError } = useCheckOpponentTypingQuery(
    { gameID, playerID },
    {
      skip: !shouldPoll,
      pollingInterval: 3000 // 3 seconds
    }
  );

  // When typing data updates, refresh the timer
  useEffect(() => {
    if (typingData?.opponentIsTyping) {
      setDisplayTyping(true);

      // Clear existing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      // Set timer to hide typing indicator after 5 seconds
      typingTimerRef.current = setTimeout(() => {
        setDisplayTyping(false);
      }, TYPING_TIMEOUT_MS);
    }
  }, [typingData?.opponentIsTyping]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const myName =
    String(useAppSelector((state: RootState) => {
      return state.game.playerOne.Name;
    }) ?? 'you');
  const oppName =
    String(useAppSelector((state: RootState) => {
      return state.game.playerTwo.Name;
    }) ?? 'your opponent');
  
  // Get Metafy tiers for both players
  const p1MetafyTiers = useAppSelector((state: RootState) => state.game.playerOne.metafyTiers) || [];
  const p2MetafyTiers = useAppSelector((state: RootState) => state.game.playerTwo.metafyTiers) || [];
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  
  // Helper to generate Metafy badge HTML
  const generateMetafyBadges = (tiers: string[]): string => {
    if (!Array.isArray(tiers) || tiers.length === 0) return '';
    
    return tiers
      .map((tierName) => {
        const tierInfo = METAFY_TIER_MAP[tierName as MetafyTierName];
        if (!tierInfo) return '';
        return `<a href='https://metafy.gg/@Talishar' target='_blank' rel='noopener noreferrer'><img alt='' title='${tierInfo.title}' style='margin-bottom:3px; height:16px;' src='${tierInfo.image}' /></a>`;
      })
      .filter(badge => badge !== '')
      .join('');
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  const chatMessages = chatLog
    ?.filter((message) => {
      switch (chatFilter) {
        case 'none':
          return true;

        case 'chat':
          return message.match(CHAT_RE);

        case 'log':
          return !message.match(CHAT_RE);

        default:
          return true;
      }
    })
    .map((message) => {
      // Generate Metafy badges for the players
      const p1Badges = generateMetafyBadges(p1MetafyTiers);
      const p2Badges = generateMetafyBadges(p2MetafyTiers);
      
      const p1DisplayName = amIPlayerOne
        ? myName && myName.trim() ? myName.substring(0, 15) : 'Player 1'
        : oppName && oppName.trim() ? oppName.substring(0, 15) : 'Player 1';
      
      const p2DisplayName = amIPlayerOne
        ? oppName && oppName.trim() ? oppName.substring(0, 15) : 'Player 2'
        : myName && myName.trim() ? myName.substring(0, 15) : 'Player 2';
      
      return message
        .replace(
          'Player 1',
          `${p1Badges}<b>${p1DisplayName}</b>`
        )
        .replace(
          'Player 2',
          `${p2Badges}<b>${p2DisplayName}</b>`
        );
    });

  useEffect(() => {
    scrollToBottom();
  }, [chatLog, chatFilter, displayTyping]);

  return (
    <div className={styles.chatBoxContainer}>
      <div className={styles.tabs}>
        <button
          className={classNames(
            chatFilter === 'none' ? 'outline' : '',
            styles.buttonOverride
          )}
          onClick={(e) => {
            e.preventDefault();
            setChatFilter('none');
          }}
        >
          All
        </button>
        <button
          className={chatFilter === 'chat' ? 'outline' : ''}
          onClick={(e) => {
            e.preventDefault();
            setChatFilter('chat');
          }}
        >
          Chat
        </button>
        <button
          className={chatFilter === 'log' ? 'outline' : ''}
          onClick={(e) => {
            e.preventDefault();
            setChatFilter('log');
          }}
        >
          Log
        </button>
      </div>
      <div className={styles.chatBoxInner}>
        <div className={styles.chatBox} ref={chatBoxRef}>
          {chatMessages &&
            chatMessages.map((chat, ix) => {
              return (
                <div key={ix}>
                  {parseHtmlToReactElements(chat)}
                </div>
              );
            })}
          {displayTyping && (
            <div className={styles.typingIndicator} ref={messagesEndRef}>
              <em>Opponent is typing…</em>
            </div>
          )}
          {!displayTyping && <div ref={messagesEndRef} />}
        </div>
      </div>
      <ChatInput />
    </div>
  );
}
