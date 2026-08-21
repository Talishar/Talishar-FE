import React from 'react';
import classNames from 'classnames';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import styles from './ChatBox.module.css';
import { useTranslation } from 'react-i18next';

export type ChatFilter = 'none' | 'chat' | 'log';

const CHAT_RE = /<span[^>]*>(.*?):\s<\/span>/;
const TURN_MARKER_RE = /^\[\[TURN_START:(\d+):(\d+)\]\]$/;
const COMBAT_START_RE = /^Player [12] (?:played|activated)\b/i;
const COMBAT_END_RE =
  /^The (?:chain link was (?:resolved|closed)|combat chain was closed)\.?$/i;
const COMBAT_CHAIN_CLOSED_RE = /^The combat chain was closed\.?$/i;
const MUTED_COMBAT_END_RE =
  /^The (?:chain link was resolved|combat chain was closed)\.?$/i;
const COMBAT_SIGNAL_RE =
  /\b(?:blocked with|combat resolved|chain link|hit effect|attack)\b/i;
const PASS_RE =
  /\b(?:passes? priority|passed\.?|main player passed priority)\b/i;
const UNDO_RE =
  /\b(?:undid (?:their|the) last action|requested to undo the last action)\b/i;
const UNDO_LIMIT_RE =
  /^Cannot undo further: Please revert to start of this\/previous turn instead\.$/i;
const DAMAGE_RE = /\b(?:damage|lost life|gained life|won|conceded|forfeit)\b/i;
const ACTION_RE = /^Player [12] (?:played|activated|blocked with)\b/i;
const IRREVERSIBLE_RE =
  /\b(?:destroyed|banished|discarded|put .*?(?:bottom|top)|added to arsenal|drew|shuffled|revealed)\b/i;

type LogMessage = { message: string; originalIndex: number };

type Props = {
  chatLog?: string[];
  chatFilter: ChatFilter;
  transformMessage: (message: string) => string;
  playerNames: [string, string];
  mobile?: boolean;
};

const TAG_RE = /<[^>]+>/g;
const CARD_TOKEN_RE = /{{.*?\|(.+?)(?:\|.*?)?}}/g;
const DERIVED_CACHE_LIMIT = 4000;
const plainTextCache = new Map<string, string>();
const importanceCache = new Map<string, string | undefined>();

function cacheSet<V>(cache: Map<string, V>, key: string, value: V): V {
  if (cache.size >= DERIVED_CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(key, value);
  return value;
}

function plainText(message: string) {
  const cached = plainTextCache.get(message);
  if (cached !== undefined) return cached;
  return cacheSet(
    plainTextCache,
    message,
    message.replace(TAG_RE, '').replace(CARD_TOKEN_RE, '$1')
  );
}

function computeImportanceClass(message: string) {
  const text = plainText(message);
  if (PASS_RE.test(text) || MUTED_COMBAT_END_RE.test(text))
    return styles.logMuted;
  if (DAMAGE_RE.test(text) && !CHAT_RE.test(message)) return styles.logCritical;
  if (ACTION_RE.test(text)) return styles.logAction;
  if (IRREVERSIBLE_RE.test(text)) return styles.logIrreversible;
  return undefined;
}

function importanceClass(message: string) {
  if (importanceCache.has(message)) return importanceCache.get(message);
  return cacheSet(importanceCache, message, computeImportanceClass(message));
}

type LogFlags = {
  isChat: boolean;
  turnMarker: RegExpMatchArray | null;
  isCombatStart: boolean;
  isCombatEnd: boolean;
  closesCombatChain: boolean;
  hasCombatSignal: boolean;
  isPass: boolean;
  isUndo: boolean;
  isUndoLimit: boolean;
};

const flagsCache = new Map<string, LogFlags>();

function computeFlags(message: string): LogFlags {
  const text = plainText(message);
  return {
    isChat: CHAT_RE.test(message),
    turnMarker: text.match(TURN_MARKER_RE),
    isCombatStart: COMBAT_START_RE.test(text),
    isCombatEnd: COMBAT_END_RE.test(text),
    closesCombatChain: COMBAT_CHAIN_CLOSED_RE.test(text),
    hasCombatSignal: COMBAT_SIGNAL_RE.test(text),
    isPass: PASS_RE.test(text),
    isUndo: UNDO_RE.test(text),
    isUndoLimit: UNDO_LIMIT_RE.test(text)
  };
}

function flagsFor(message: string): LogFlags {
  const cached = flagsCache.get(message);
  if (cached !== undefined) return cached;
  return cacheSet(flagsCache, message, computeFlags(message));
}

function TurnDivider({
  marker,
  playerNames
}: {
  marker: RegExpMatchArray;
  playerNames: [string, string];
}) {
  const { t } = useTranslation();
  const turn = marker[1];
  const player = Number(marker[2]);
  const playerName = playerNames[player - 1] || `Player ${player}`;

  return (
    <div
      className={styles.turnDivider}
      role="separator"
      aria-label={t('GAME_LOG.TURN_ARIA', { turn, playerName })}
    >
      <span className={styles.turnDividerLabel}>
        {t('GAME_LOG.TURN', { turn })}
      </span>
      <span className={styles.turnDividerPlayer}>{playerName}</span>
    </div>
  );
}

function RepeatBadge({ repeatCount }: { repeatCount: number }) {
  const { t } = useTranslation();
  return (
    <span className={styles.logRepeatCount}>
      {' '}
      {t('GAME_LOG.REPEAT_COUNT', { count: repeatCount })}
    </span>
  );
}

const Message = React.memo(function Message({
  message,
  transformMessage,
  mobile,
  repeatCount = 1
}: {
  message: string;
  transformMessage: (message: string) => string;
  mobile: boolean;
  repeatCount?: number;
}) {
  const className = classNames(
    mobile ? styles.chatMobileMessage : styles.chatMessage,
    importanceClass(message)
  );
  return (
    <div
      className={className}
      title={repeatCount > 1 ? `${repeatCount} repeated log events` : undefined}
    >
      {parseHtmlToReactElements(transformMessage(message))}
      {repeatCount > 1 && <RepeatBadge repeatCount={repeatCount} />}
    </div>
  );
});
Message.displayName = 'LogMessage';

type RepeatFlag = 'isPass' | 'isUndo';

function repeatedEventEnd(
  messages: LogMessage[],
  start: number,
  flag: RepeatFlag
) {
  if (!flagsFor(messages[start].message)[flag]) return start;

  let end = start;
  while (end + 1 < messages.length) {
    const next = flagsFor(messages[end + 1].message);
    if (next.isChat || !next[flag]) break;
    end++;
  }
  return end;
}

function undoLimitSequence(messages: LogMessage[], start: number) {
  if (!flagsFor(messages[start].message).isUndo) return null;

  let end = start;
  let undoCount = 1;
  let warning: LogMessage | null = null;

  // The server can batch several undo entries before it emits the limit warning.
  // Treat the uninterrupted undo/warning run as one sequence regardless of order.
  while (end + 1 < messages.length) {
    const next = messages[end + 1];
    const flags = flagsFor(next.message);
    if (flags.isUndo) {
      undoCount++;
      end++;
      continue;
    }
    if (flags.isUndoLimit) {
      warning = next;
      end++;
      continue;
    }
    break;
  }

  return undoCount > 1 && warning ? { end, undoCount, warning } : null;
}

function RepeatedMessages({
  entries,
  transformMessage,
  mobile
}: {
  entries: LogMessage[];
  transformMessage: (message: string) => string;
  mobile: boolean;
}) {
  const output: React.ReactNode[] = [];

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const undoSequence = undoLimitSequence(entries, index);
    if (undoSequence) {
      output.push(
        <Message
          key={entry.originalIndex}
          message={entry.message}
          transformMessage={transformMessage}
          mobile={mobile}
          repeatCount={undoSequence.undoCount}
        />
      );
      output.push(
        <Message
          key={undoSequence.warning.originalIndex}
          message={undoSequence.warning.message}
          transformMessage={transformMessage}
          mobile={mobile}
        />
      );
      index = undoSequence.end;
      continue;
    }
    const passEnd = repeatedEventEnd(entries, index, 'isPass');
    const undoEnd = repeatedEventEnd(entries, index, 'isUndo');
    const end = Math.max(passEnd, undoEnd);

    output.push(
      <Message
        key={entry.originalIndex}
        message={entry.message}
        transformMessage={transformMessage}
        mobile={mobile}
        repeatCount={end - index + 1}
      />
    );
    index = end;
  }

  return <>{output}</>;
}

function combatGroupEnd(messages: LogMessage[], start: number) {
  if (!flagsFor(messages[start].message).isCombatStart) return -1;

  for (let index = start + 1; index < messages.length; index++) {
    const flags = flagsFor(messages[index].message);
    if (flags.turnMarker !== null || flags.isChat || flags.isCombatStart)
      return -1;
    if (flags.isCombatEnd) {
      // Scanned in place; the old `.slice(...).some(...)` allocated a fresh
      // segment array for every candidate group on every pass.
      for (let scan = start; scan <= index; scan++) {
        if (flagsFor(messages[scan].message).hasCombatSignal) return index;
      }
      return -1;
    }
  }
  return -1;
}

const GameLogMessages = React.memo(function GameLogMessages({
  chatLog,
  chatFilter,
  transformMessage,
  playerNames,
  mobile = false
}: Props) {
  const { t } = useTranslation();
  const output = React.useMemo(() => {
    const messages: LogMessage[] = [];
    const log = chatLog ?? [];
    for (let originalIndex = 0; originalIndex < log.length; originalIndex++) {
      const message = log[originalIndex];
      if (chatFilter !== 'none') {
        const isChat = flagsFor(message).isChat;
        if (chatFilter === 'chat' ? !isChat : isChat) continue;
      }
      messages.push({ message, originalIndex });
    }
    const nextOutput: React.ReactNode[] = [];
    let chainLinkNumber = 0;

    for (let index = 0; index < messages.length; index++) {
      const entry = messages[index];
      const entryFlags = flagsFor(entry.message);
      const turnMarker = entryFlags.turnMarker;
      if (turnMarker) {
        nextOutput.push(
          <TurnDivider
            key={`turn-${entry.originalIndex}`}
            marker={turnMarker}
            playerNames={playerNames}
          />
        );
        continue;
      }

      const groupEnd = combatGroupEnd(messages, index);
      if (groupEnd !== -1) {
        chainLinkNumber++;
        const closesCombatChain = flagsFor(
          messages[groupEnd].message
        ).closesCombatChain;
        nextOutput.push(
          <section
            className={styles.combatGroup}
            key={`combat-${entry.originalIndex}`}
            aria-label={t('GAME_LOG.COMBAT_SEQUENCE')}
          >
            <div className={styles.combatGroupLabel}>
              {t('GAME_LOG.CHAIN_LINK', { number: chainLinkNumber })}
            </div>
            <RepeatedMessages
              entries={messages.slice(index, groupEnd + 1)}
              transformMessage={transformMessage}
              mobile={mobile}
            />
          </section>
        );
        if (closesCombatChain) chainLinkNumber = 0;
        index = groupEnd;
        continue;
      }

      const undoSequence = undoLimitSequence(messages, index);
      if (undoSequence) {
        nextOutput.push(
          <Message
            key={entry.originalIndex}
            message={entry.message}
            transformMessage={transformMessage}
            mobile={mobile}
            repeatCount={undoSequence.undoCount}
          />
        );
        nextOutput.push(
          <Message
            key={undoSequence.warning.originalIndex}
            message={undoSequence.warning.message}
            transformMessage={transformMessage}
            mobile={mobile}
          />
        );
        index = undoSequence.end;
        continue;
      }

      const passEnd = repeatedEventEnd(messages, index, 'isPass');
      const undoEnd = repeatedEventEnd(messages, index, 'isUndo');
      const end = Math.max(passEnd, undoEnd);
      nextOutput.push(
        <Message
          key={entry.originalIndex}
          message={entry.message}
          transformMessage={transformMessage}
          mobile={mobile}
          repeatCount={end - index + 1}
        />
      );
      index = end;
      if (entryFlags.closesCombatChain) chainLinkNumber = 0;
    }

    return nextOutput;
  }, [chatLog, chatFilter, transformMessage, playerNames, mobile, t]);

  return <>{output}</>;
});

GameLogMessages.displayName = 'GameLogMessages';

export default GameLogMessages;
