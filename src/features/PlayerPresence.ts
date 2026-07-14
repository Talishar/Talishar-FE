export type PresenceZone =
  | 'arsenal'
  | 'banish'
  | 'deck'
  | 'graveyard'
  | 'hand'
  | 'pitch'
  | 'soul';

export type PresenceOwner = 'self' | 'opponent';

export type PlayerPresence =
  | {
      type: 'zone';
      zone: PresenceZone;
      owner: PresenceOwner;
    }
  | {
      type: 'combat-summary';
    };

const ZONE_BY_NAME: Array<[RegExp, PresenceZone]> = [
  [/\bbanish(?:ed)?(?: zone)?$/i, 'banish'],
  [/\bgraveyard$/i, 'graveyard'],
  [/\bdeck$/i, 'deck'],
  [/\bhand$/i, 'hand'],
  [/\bpitch$/i, 'pitch'],
  [/\bsoul$/i, 'soul'],
  [/\barsenal$/i, 'arsenal']
];

export function presenceFromCardListName(
  name: string | undefined
): PlayerPresence | null {
  if (!name) return null;

  const owner: PresenceOwner | null = name.startsWith('Your ')
    ? 'self'
    : name.startsWith("Opponent's ")
    ? 'opponent'
    : null;
  if (!owner) return null;

  const zoneName = name.replace(/^(?:Your|Opponent's)\s+/i, '');
  const zone = ZONE_BY_NAME.find(([pattern]) => pattern.test(zoneName))?.[1];
  return zone ? { type: 'zone', zone, owner } : null;
}

export function getPresenceMessage(presence: PlayerPresence): string {
  if (presence.type === 'combat-summary') {
    return 'Opponent is reviewing the combat chain';
  }

  const owner = presence.owner === 'self' ? 'their' : 'your';
  const zone = presence.zone === 'banish' ? 'banished zone' : presence.zone;
  return `Opponent is checking ${owner} ${zone}`;
}

export function decorateWaitingPrompt(
  helpText: string,
  presenceMessage: string | null
): string {
  if (!presenceMessage || !/^Waiting for\b/i.test(helpText)) return helpText;

  const waitingContext = helpText.replace(
    /^Waiting for (?:other player|your opponent|opponent)/i,
    'Waiting for them'
  );
  return `${presenceMessage} · ${waitingContext}`;
}
