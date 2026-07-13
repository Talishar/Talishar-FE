import { KeywordEntry } from './types';

const CR_BASE = 'https://rules.fabtcg.com/en/cr/';

export const GLOSSARY: KeywordEntry[] = [
  {
    id: 'go-again',
    name: 'Go again',
    short:
      'When this resolves, you gain an action point, letting you play another action this turn.',
    category: 'ability'
  },
  {
    id: 'dominate',
    name: 'Dominate',
    short:
      'The defending hero can defend this attack with at most one card from their hand.',
    category: 'ability'
  },
  {
    id: 'overpower',
    name: 'Overpower',
    short:
      'The defending hero can defend this attack with at most one attack action card.',
    category: 'ability'
  },
  {
    id: 'ward',
    name: 'Ward',
    short:
      'Prevents the next X damage that would be dealt to whatever has the ward, then the ward is removed.',
    category: 'ability',
    parameterized: true
  },
  {
    id: 'arcane-barrier',
    name: 'Arcane Barrier',
    short:
      'When your hero would take arcane damage, you may pay resources (up to X per source) to prevent that much of it.',
    category: 'ability',
    parameterized: true
  },
  {
    id: 'battleworn',
    name: 'Battleworn',
    short:
      'When this equipment defends, it gets a -1 defense counter afterward — it wears down with each block.',
    category: 'ability'
  },
  {
    id: 'blade-break',
    name: 'Blade Break',
    short: 'If this equipment defends, destroy it when the combat chain closes.',
    category: 'ability',
    crOverrideUrl: 'https://rules.fabtcg.com/en/cr/08-keywords/#cr8.3.3'
  },
  {
    id: 'temper',
    name: 'Temper',
    short:
      'When this equipment defends, it gets a -1 defense counter; when it hits 0 defense, destroy it.',
    category: 'ability'
  },
  {
    id: 'blood-debt',
    name: 'Blood Debt',
    short:
      'At the end of your turn, if this card is in your banished zone, you lose 1 life.',
    category: 'ability'
  },
  {
    id: 'boost',
    name: 'Boost',
    short:
      'As an extra cost, you may banish the top card of your deck; if it is a Mechanologist card, this attack gets go again.',
    category: 'ability'
  },
  {
    id: 'phantasm',
    name: 'Phantasm',
    short:
      'If this attack is defended by a non-Illusionist attack action card with 6 or more power, the attack is destroyed and the chain link closes.',
    category: 'ability'
  },
  {
    id: 'spectra',
    name: 'Spectra',
    short:
      'This aura can be attacked; when it is, it is destroyed and the chain link closes — the attack never hits.',
    category: 'ability'
  },
  {
    id: 'spellvoid',
    name: 'Spellvoid',
    short:
      'If your hero would take arcane damage, you may destroy this to prevent X of that damage.',
    category: 'ability',
    parameterized: true
  },
  {
    id: 'fusion',
    name: 'Fusion',
    short:
      'You may reveal a card of the listed element from your hand while playing this card to "fuse" it for a bonus effect.',
    category: 'ability',
    aliases: ['Fused']
  },
  {
    id: 'legendary',
    name: 'Legendary',
    short:
      'Your deck can only contain one copy of this card, and you can only have one in the arena at a time.',
    category: 'ability'
  },
  {
    id: 'specialization',
    name: 'Specialization',
    short: 'You can only include this card in your deck if the named hero is your hero.',
    category: 'ability'
  },
  {
    id: 'meld',
    name: 'Meld',
    short:
      'Two half-cards can be played together as a single melded card with both halves’ effects.',
    category: 'ability'
  },
  {
    id: 'ephemeral',
    name: 'Ephemeral',
    short:
      'This card is banished when it would be put anywhere else — it never sticks around.',
    category: 'ability'
  },
  {
    id: 'heave',
    name: 'Heave',
    short:
      'At the beginning of your end phase, you may pay X to put this card face-up into your arsenal and create X Seismic Surge tokens.',
    category: 'ability',
    parameterized: true
  },
  {
    id: 'quell',
    name: 'Quell',
    short:
      'You may pay a resource to have this equipment prevent the next X damage to your hero; if it prevents damage this way, destroy it at the start of the end phase.',
    category: 'ability',
    parameterized: true
  },
  {
    id: 'piercing',
    name: 'Piercing',
    short:
      'This attack ignores some of the defense in front of it — see rules detail for the exact amount.',
    category: 'ability',
    parameterized: true
  },
  {
    id: 'stealth',
    name: 'Stealth',
    short:
      'A keyword with no rules meaning by itself; card text may refer to it.',
    category: 'ability'
  },
  {
    id: 'mirage',
    name: 'Mirage',
    short:
      'An illusion effect: this permanent is destroyed when its bluff is called — see rules detail.',
    category: 'ability'
  },
  {
    id: 'essence',
    name: 'Essence',
    short: 'This hero can use cards of the listed talents.',
    category: 'ability'
  },
  {
    id: 'modular',
    name: 'Modular',
    short:
      'This piece of equipment can swap between forms/parts outside of the game rules text — see rules detail.',
    category: 'ability'
  },
  {
    id: 'ambush',
    name: 'Ambush',
    short:
      'This card can be played face-down and flipped up to strike when triggered — see rules detail.',
    category: 'ability'
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    short: 'Your deck can contain any number of copies of this card.',
    category: 'ability'
  },

  // --- Label keywords --------------------------------------------------------
  {
    id: 'combo',
    name: 'Combo',
    short:
      'This card gets its bonus effect if the named card was the previous attack this combat chain.',
    category: 'label'
  },
  {
    id: 'crush',
    name: 'Crush',
    short:
      'This card gets its bonus effect if it deals 4 or more damage to the defending hero.',
    category: 'label'
  },
  {
    id: 'reprise',
    name: 'Reprise',
    short:
      'This card gets its bonus effect if the defending hero has defended with a card from their hand this turn.',
    category: 'label'
  },
  {
    id: 'rupture',
    name: 'Rupture',
    short:
      'This card gets its bonus effect if it entered the combat chain this turn as the result of another effect — see rules detail.',
    category: 'label'
  },
  {
    id: 'surge',
    name: 'Surge',
    short:
      'This card gets its bonus effect if another source has dealt arcane damage this turn.',
    category: 'label'
  },
  {
    id: 'tower',
    name: 'Tower',
    short:
      'This card gets its bonus effect if there is a card in your arsenal.',
    category: 'label'
  },
  {
    id: 'high-tide',
    name: 'High Tide',
    short:
      'This card gets its bonus effect if it is the second (or later) time the condition of rising resources is met this turn — see rules detail.',
    category: 'label'
  },
  {
    id: 'channel',
    name: 'Channel',
    short:
      'A label keyword; its accompanying ability states the effect and condition.',
    category: 'label'
  },
  {
    id: 'material',
    name: 'Material',
    short:
      'This card gets its bonus effect while under another permanent.',
    category: 'label'
  },
  {
    id: 'contract',
    name: 'Contract',
    short:
      'A bounty condition: when you fulfil the stated contract, you get the listed reward.',
    category: 'label'
  },
  {
    id: 'wager',
    name: 'Wager',
    short:
      'When this attack hits, players may bet on the outcome for a payoff — see rules detail.',
    category: 'label'
  },
  {
    id: 'quickstrike',
    name: 'Quickstrike',
    short:
      'A label keyword; its accompanying ability states the effect and condition.',
    category: 'label'
  },

  //  Type keywords
  {
    id: 'defense-reaction',
    name: 'Defense Reaction',
    short:
      'A card the defender can play during the reaction step to add defense to the chain link.',
    category: 'type'
  },
  {
    id: 'attack-reaction',
    name: 'Attack Reaction',
    short:
      'A card the attacker can play during the reaction step, usually to pump the attack.',
    category: 'type'
  },
  {
    id: 'instant',
    name: 'Instant',
    short:
      'Can be played any time you have priority, without using an action point.',
    category: 'type'
  },
  {
    id: 'aura',
    name: 'Aura',
    short:
      'A permanent that stays in the arena and provides an ongoing effect until removed.',
    category: 'type',
    noAutoLink: true
  },
  {
    id: 'ally',
    name: 'Ally',
    short:
      'A permanent with life that can attack and be attacked, separate from your hero.',
    category: 'type',
    noAutoLink: true
  },
  {
    id: 'item',
    name: 'Item',
    short: 'A permanent, usually with activated abilities; often starts or gains counters.',
    category: 'type',
    noAutoLink: true
  },
  {
    id: 'landmark',
    name: 'Landmark',
    short:
      'A permanent that affects both players; only one landmark can exist at a time.',
    category: 'type',
    noAutoLink: true
  },
  {
    id: 'token',
    name: 'Token',
    short:
      'A game piece created by an effect; it ceases to exist when it leaves the arena.',
    category: 'type',
    noAutoLink: true
  },
  {
    id: 'demi-hero',
    name: 'Demi-Hero',
    short: 'A hero variant with restricted deck-building rules — see rules detail.',
    category: 'type',
    noAutoLink: true
  },
  {
    id: 'figment',
    name: 'Figment',
    short: 'An ephemeral token aura tied to a specific mechanic — see rules detail.',
    category: 'type',
    noAutoLink: true
  },

  // Effect keywords
  {
    id: 'intimidate',
    name: 'Intimidate',
    short:
      'The defending hero banishes a random card from their hand face-down until the end of the turn.',
    category: 'effect'
  },
  {
    id: 'freeze',
    name: 'Freeze',
    short:
      'A frozen card/object cannot be played, activated, or used to defend until it thaws at the start of its controller’s next turn.',
    category: 'effect',
    aliases: ['Frozen']
  },
  {
    id: 'opt',
    name: 'Opt',
    short:
      'Look at the top X cards of your deck; put any number on top and the rest on the bottom, in any order.',
    category: 'effect',
    parameterized: true
  },
  {
    id: 'banish',
    name: 'Banish',
    short:
      'Remove the card from the game zone it is in and place it face-up in the banished zone.',
    category: 'effect',
    noAutoLink: true
  },
  {
    id: 'reload',
    name: 'Reload',
    short: 'Put a card from your hand face-down into your arsenal.',
    category: 'effect'
  },
  {
    id: 'charge',
    name: 'Charge',
    short: 'Put a card from your hand face-up under your hero as a charge counter source — see rules detail.',
    category: 'effect'
  },
  {
    id: 'amp',
    name: 'Amp',
    short: 'Your next arcane damage source this turn deals X more arcane damage.',
    category: 'effect',
    parameterized: true
  },
  {
    id: 'transcend',
    name: 'Transcend',
    short: 'Transform your hero card into its ascended form — see rules detail.',
    category: 'effect'
  },
  {
    id: 'transform',
    name: 'Transform',
    short: 'Turn a card or permanent into the object stated by the effect, keeping its zone.',
    category: 'effect',
    noAutoLink: true
  },
  {
    id: 'mark',
    name: 'Mark',
    short:
      'A marked hero takes the stated consequence the next time the condition is met — see rules detail.',
    category: 'effect',
    aliases: ['Marked'],
    noAutoLink: true
  },

  // Game terms (defined outside CR chapter 8)
  {
    id: 'combat-chain',
    name: 'Combat chain',
    short:
      'The sequence of attacks and defenses this combat; each attack forms one chain link.',
    category: 'term',
    crOverrideUrl: `${CR_BASE}07-combat/`
  },
  {
    id: 'chain-link',
    name: 'Chain link',
    short:
      'One attack on the combat chain, together with everything defending it.',
    category: 'term',
    crOverrideUrl: `${CR_BASE}07-combat/`
  },
  {
    id: 'layer',
    name: 'Layer',
    short:
      'A card or effect waiting to resolve on the stack; layers resolve one at a time, newest first.',
    category: 'term',
    noAutoLink: true,
    crOverrideUrl: CR_BASE
  },
  {
    id: 'priority',
    name: 'Priority',
    short:
      'Having priority means it is your window to act — play instants, activate abilities, or pass.',
    category: 'term',
    noAutoLink: true,
    crOverrideUrl: CR_BASE
  },
  {
    id: 'pitch',
    name: 'Pitch',
    short:
      'Put a card from your hand into your pitch zone to gain resources equal to its pitch value. Pitched cards go to the bottom of your deck during the end phase.',
    category: 'term'
  },
  {
    id: 'arsenal',
    name: 'Arsenal',
    short:
      'A face-down (or face-up) card you set aside at the end of your turn to play later.',
    category: 'term',
    crOverrideUrl: CR_BASE
  },
  {
    id: 'action-point',
    name: 'Action point',
    short:
      'The currency for playing action cards on your turn; you start each turn with one.',
    category: 'term',
    aliases: ['Action points'],
    crOverrideUrl: CR_BASE
  },
  {
    id: 'on-hit',
    name: 'On-hit effect',
    short:
      'An effect that triggers only if the attack hits, i.e. deals combat damage to the defender.',
    category: 'term',
    aliases: ['On hit', 'Active On Hit'],
    noAutoLink: true,
    crOverrideUrl: `${CR_BASE}07-combat/`
  },
  {
    id: 'confidence',
    name: 'Confidence',
    short:
      'An effect limiting how many cards can defend this attack — see rules detail.',
    category: 'term',
    noAutoLink: true,
    crOverrideUrl: CR_BASE
  },
  {
    id: 'damage-prevention',
    name: 'Damage prevention',
    short:
      'An effect reducing or preventing damage before it is dealt (armor, ward, barriers).',
    category: 'term',
    noAutoLink: true,
    crOverrideUrl: CR_BASE
  },
  {
    id: 'life',
    name: 'Life',
    short:
      'Your hero’s health total; when it reaches 0 you lose the game.',
    category: 'term',
    noAutoLink: true,
    crOverrideUrl: CR_BASE
  },
  {
    id: 'intellect',
    name: 'Intellect',
    short: 'How many cards you draw up to at the end of your turn.',
    category: 'term',
    noAutoLink: true,
    crOverrideUrl: CR_BASE
  }
];
