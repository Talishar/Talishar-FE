import React from 'react';
import classNames from 'classnames';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import styles from './ChatBox.module.css';

export type ChatFilter = 'none' | 'chat' | 'log';

const CHAT_RE = /<span[^>]*>(.*?):\s<\/span>/;
const TURN_MARKER_RE = /^\[\[TURN_START:(\d+):(\d+)\]\]$/;
const COMBAT_START_RE = /^Player [12] (?:played|activated)\b/i;
const COMBAT_END_RE = /^The (?:chain link was (?:resolved|closed)|combat chain was closed)\.?$/i;
const COMBAT_CHAIN_CLOSED_RE = /^The combat chain was closed\.?$/i;
const COMBAT_SIGNAL_RE = /\b(?:blocked with|combat resolved|chain link|hit effect|attack)\b/i;
const PASS_RE = /\b(?:passes? priority|passed\.?|main player passed priority)\b/i;
const DAMAGE_RE = /\b(?:damage|lost life|gained life|won|conceded|forfeit)\b/i;
const ACTION_RE = /^Player [12] (?:played|activated|blocked with)\b/i;
const IRREVERSIBLE_RE = /\b(?:destroyed|banished|discarded|put .*?(?:bottom|top)|added to arsenal|drew|shuffled|revealed)\b/i;

type LogMessage = { message: string; originalIndex: number };

type Props = {
  chatLog?: string[];
  chatFilter: ChatFilter;
  transformMessage: (message: string) => string;
  playerNames: [string, string];
  mobile?: boolean;
};

function plainText(message: string) {
  return message.replace(/<[^>]+>/g, '').replace(/{{.*?\|(.+?)(?:\|.*?)?}}/g, '$1');
}

function importanceClass(message: string) {
  const text = plainText(message);
  if (PASS_RE.test(text)) return styles.logMuted;
  if (DAMAGE_RE.test(text)) return styles.logCritical;
  if (ACTION_RE.test(text)) return styles.logAction;
  if (IRREVERSIBLE_RE.test(text)) return styles.logIrreversible;
  return undefined;
}

function TurnDivider({ marker, playerNames }: { marker: RegExpMatchArray; playerNames: [string, string] }) {
  const turn = marker[1];
  const player = Number(marker[2]);
  const playerName = playerNames[player - 1] || `Player ${player}`;

  return (
    <div className={styles.turnDivider} role="separator" aria-label={`Turn ${turn}, ${playerName}'s turn`}>
      <span>Turn {turn}</span>
      <span className={styles.turnDividerPlayer}>{playerName}</span>
    </div>
  );
}

function Message({ entry, transformMessage, mobile }: { entry: LogMessage; transformMessage: (message: string) => string; mobile: boolean }) {
  const className = classNames(
    mobile ? styles.chatMobileMessage : styles.chatMessage,
    importanceClass(entry.message)
  );
  return <div className={className}>{parseHtmlToReactElements(transformMessage(entry.message))}</div>;
}

function combatGroupEnd(messages: LogMessage[], start: number) {
  if (!COMBAT_START_RE.test(plainText(messages[start].message))) return -1;

  for (let index = start + 1; index < messages.length; index++) {
    const text = plainText(messages[index].message);
    if (TURN_MARKER_RE.test(text) || CHAT_RE.test(messages[index].message) || COMBAT_START_RE.test(text)) return -1;
    if (COMBAT_END_RE.test(text)) {
      const segment = messages.slice(start, index + 1);
      return segment.some((entry) => COMBAT_SIGNAL_RE.test(plainText(entry.message))) ? index : -1;
    }
  }
  return -1;
}

export default function GameLogMessages({ chatLog, chatFilter, transformMessage, playerNames, mobile = false }: Props) {
  const messages = (chatLog ?? [])
    .map((message, originalIndex) => ({ message, originalIndex }))
    .filter((entry) => {
      if (chatFilter === 'chat') return CHAT_RE.test(entry.message);
      if (chatFilter === 'log') return !CHAT_RE.test(entry.message);
      return true;
    });
  const output: React.ReactNode[] = [];
  let chainLinkNumber = 0;

  for (let index = 0; index < messages.length; index++) {
    const entry = messages[index];
    const turnMarker = plainText(entry.message).match(TURN_MARKER_RE);
    if (turnMarker) {
      output.push(<TurnDivider key={`turn-${entry.originalIndex}`} marker={turnMarker} playerNames={playerNames} />);
      continue;
    }

    const groupEnd = combatGroupEnd(messages, index);
    if (groupEnd !== -1) {
      chainLinkNumber++;
      const closesCombatChain = COMBAT_CHAIN_CLOSED_RE.test(plainText(messages[groupEnd].message));
      output.push(
        <section className={styles.combatGroup} key={`combat-${entry.originalIndex}`} aria-label="Combat sequence">
          <div className={styles.combatGroupLabel}>Chain Link {chainLinkNumber}</div>
          {messages.slice(index, groupEnd + 1).map((combatEntry) => (
            <Message key={combatEntry.originalIndex} entry={combatEntry} transformMessage={transformMessage} mobile={mobile} />
          ))}
        </section>
      );
      if (closesCombatChain) chainLinkNumber = 0;
      index = groupEnd;
      continue;
    }

    output.push(<Message key={entry.originalIndex} entry={entry} transformMessage={transformMessage} mobile={mobile} />);
    if (COMBAT_CHAIN_CLOSED_RE.test(plainText(entry.message))) chainLinkNumber = 0;
  }

  return <>{output}</>;
}
