import { KeywordEntry } from './types';

const CR_BASE = 'https://rules.fabtcg.com/en/cr/';

export const GLOSSARY: KeywordEntry[] = [
  {
    id: 'go-again',
    name: 'Go again',
    short: 'Gain 1 action point.',
    category: 'ability'
  },
  {
    id: 'dominate',
    name: 'Dominate',
    short: 'This attack cannot be defended by more than one card from hand.',
    category: 'ability'
  },
  {
    id: 'overpower',
    name: 'Overpower',
    short: 'This attack cannot be defended by more than one action card.',
    category: 'ability'
  },
  {
    id: 'ward',
    name: 'Ward',
    short:
      'If this would be dealt damage, destroy it to prevent X of that damage.',
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
      'When the combat chain closes, if this defended, put a -1 defense counter on it.',
    category: 'ability'
  },
  {
    id: 'blade-break',
    name: 'Blade Break',
    short:
      'If this equipment defends, destroy it when the combat chain closes.',
    category: 'ability',
    crOverrideUrl: 'https://rules.fabtcg.com/en/cr/08-keywords/#cr8.3.3'
  },
  {
    id: 'temper',
    name: 'Temper',
    short:
      'When the combat chain closes, if this defended, put a -1 defense counter on it, then destroy it if it has 0 defense.',
    category: 'ability'
  },
  {
    id: 'blood-debt',
    name: 'Blood Debt',
    short:
      'While this is in your banished zone, at the beginning of your end phase, lose 1 life.',
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
      'Whenever this is defended by a non-Illusionist attack action card with 6 or more power, destroy it.',
    category: 'ability'
  },
  {
    id: 'spectra',
    name: 'Spectra',
    short:
      'This can be attacked. When it becomes the target of an attack, destroy it.',
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
      'As an additional cost to play this, you may reveal the listed elemental card or cards from your hand.',
    category: 'ability',
    aliases: ['Fused']
  },
  {
    id: 'legendary',
    name: 'Legendary',
    short: 'You may only have 1 copy of this card in your constructed deck.',
    category: 'ability'
  },
  {
    id: 'specialization',
    name: 'Specialization',
    short:
      'You can only include this card in your deck if the named hero is your hero.',
    category: 'ability'
  },
  {
    id: 'meld',
    name: 'Meld',
    short:
      "You may pay twice this card's base cost to play both halves of it as one card.",
    category: 'ability'
  },
  {
    id: 'ephemeral',
    name: 'Ephemeral',
    short:
      'You cannot start the game with this in your deck. If it would enter a graveyard, it ceases to exist instead.',
    category: 'ability'
  },
  {
    id: 'heave',
    name: 'Heave',
    short:
      'While this is in your hand at the beginning of your end phase, you may pay X to put it face-up into your arsenal and create X Seismic Surge tokens.',
    category: 'ability',
    parameterized: true
  },
  {
    id: 'quell',
    name: 'Quell',
    short:
      'If you would be dealt damage, you may pay X to prevent X of it. If you do, destroy this at the beginning of the end phase.',
    category: 'ability',
    parameterized: true
  },
  {
    id: 'piercing',
    name: 'Piercing',
    short: 'If this is defended by equipment, it gets +X power.',
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
      'When this is defending a non-Illusionist attack with 6 or more power, destroy it.',
    category: 'ability'
  },
  {
    id: 'essence',
    name: 'Essence',
    short:
      'You may have cards of the listed types in your deck as though your hero had those types.',
    category: 'ability'
  },
  {
    id: 'modular',
    name: 'Modular',
    short:
      'This may be equipped to any equipment zone and has the subtype of the zone it occupies.',
    category: 'ability'
  },
  {
    id: 'ambush',
    name: 'Ambush',
    short: 'While this is in your arsenal, you may defend with it.',
    category: 'ability'
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    short: 'Your deck can contain any number of copies of this card.',
    category: 'ability'
  },
  {
    id: 'pairs',
    name: 'Pairs',
    short: 'This can only be equipped alongside the named object.',
    category: 'ability'
  },
  {
    id: 'rune-gate',
    name: 'Rune Gate',
    short:
      'If you control enough Runechants, you may play this from banishment without paying its resource cost.',
    category: 'ability'
  },
  {
    id: 'crank',
    name: 'Crank',
    short:
      'As this enters the arena, you may remove a steam counter from it to gain 1 action point.',
    category: 'ability'
  },
  {
    id: 'protect',
    name: 'Protect',
    short: 'You may defend any hero attacked by an opponent with this.',
    category: 'ability'
  },
  {
    id: 'scrap',
    name: 'Scrap',
    short:
      'As an additional cost to play this, you may banish an item or equipment from your graveyard.',
    category: 'ability'
  },
  {
    id: 'beat-chest',
    name: 'Beat Chest',
    short:
      'As an additional cost to play this, you may discard a card with 6 or more power.',
    category: 'ability'
  },
  {
    id: 'guardwell',
    name: 'Guardwell',
    short:
      'When the combat chain closes, if this defended, put -1 defense counters on it equal to its defense.',
    category: 'ability'
  },
  {
    id: 'universal',
    name: 'Universal',
    short: 'While in any zone, this is the same class as your hero.',
    category: 'ability'
  },
  {
    id: 'cloaked',
    name: 'Cloaked',
    short: 'Equip this face-down.',
    category: 'ability'
  },
  {
    id: 'arcane-shelter',
    name: 'Arcane Shelter',
    short:
      'If you would be dealt arcane damage, destroy this to prevent X of that damage.',
    category: 'ability',
    parameterized: true
  },
  {
    id: 'perched',
    name: 'Perched',
    short:
      'This can be equipped in addition to a two-handed weapon and cannot be attacked while equipped.',
    category: 'ability'
  },
  {
    id: 'watery-grave',
    name: 'Watery Grave',
    short:
      'When this is put into your graveyard from the arena, turn it face-down.',
    category: 'ability'
  },
  {
    id: 'suspense',
    name: 'Suspense',
    short:
      'This enters with 2 suspense counters. Remove one at the start of your turn; destroy this when none remain.',
    category: 'ability'
  },
  {
    id: 'fragment',
    name: 'Fragment',
    short:
      'Whenever a card with 2 or more defense defends this, this gets -2 power.',
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
    short: 'Its accompanying ability applies when this deals 4 or more damage.',
    category: 'label'
  },
  {
    id: 'reprise',
    name: 'Reprise',
    short:
      'Its accompanying ability applies if the defending hero defended this chain link with a card from hand.',
    category: 'label'
  },
  {
    id: 'rupture',
    name: 'Rupture',
    short:
      'Its accompanying ability applies if this is played as or at chain link 4 or higher.',
    category: 'label'
  },
  {
    id: 'surge',
    name: 'Surge',
    short:
      'Its accompanying ability applies if this deals the stated amount of damage.',
    category: 'label'
  },
  {
    id: 'tower',
    name: 'Tower',
    short: 'Its accompanying ability applies if this has 13 or more power.',
    category: 'label'
  },
  {
    id: 'high-tide',
    name: 'High Tide',
    short:
      'Its accompanying ability applies if there are 2 or more blue cards in your pitch zone.',
    category: 'label'
  },
  {
    id: 'channel',
    name: 'Channel',
    short:
      'At the beginning of your end phase, add a flow counter, then destroy this unless you bottom-deck a matching card for each flow counter.',
    category: 'label'
  },
  {
    id: 'material',
    name: 'Material',
    short: 'This card gets its bonus effect while under another permanent.',
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
      'When the attack resolves, its controller wins the stated prize if it hit; otherwise the other player wins it.',
    category: 'effect'
  },
  {
    id: 'quickstrike',
    name: 'Quickstrike',
    short: 'Its accompanying ability applies if this has go again.',
    category: 'label'
  },
  {
    id: 'solflare',
    name: 'Solflare',
    short:
      "Its accompanying ability applies when this is charged to your hero's soul.",
    category: 'label'
  },
  {
    id: 'unity',
    name: 'Unity',
    short:
      'Its accompanying ability applies when this defends together with a card from hand.',
    category: 'label'
  },
  {
    id: 'evo-upgrade',
    name: 'Evo Upgrade',
    short:
      'Its accompanying effect scales with the number of evos you have equipped.',
    category: 'label'
  },
  {
    id: 'galvanize',
    name: 'Galvanize',
    short:
      'When this defends, you may destroy an item you control for the accompanying effect.',
    category: 'label'
  },
  {
    id: 'decompose',
    name: 'Decompose',
    short:
      'You may banish 2 Earth cards and an action card from your graveyard for the accompanying effect.',
    category: 'label'
  },
  {
    id: 'bond',
    name: 'Bond',
    short:
      'Its accompanying ability applies if a card of the named element was pitched to play this.',
    category: 'label'
  },
  {
    id: 'flow',
    name: 'Flow',
    short:
      'Its accompanying ability applies if you have played a card of the named element this turn.',
    category: 'label'
  },
  {
    id: 'heavy',
    name: 'Heavy',
    short:
      'Its accompanying ability applies if this is the only card equipped to your weapon zones.',
    category: 'label'
  },
  {
    id: 'go-fish',
    name: 'Go Fish',
    short:
      'When this hits, the hero reveals a chosen hand card; if it matches the stated quality, they discard it and you create Gold.',
    category: 'label'
  },
  {
    id: 'starfall',
    name: 'Starfall',
    short:
      'Its accompanying ability applies if an instant entered your graveyard this turn.',
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
      'A card or ability the controller of the attack can play during the reaction step.',
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
    short:
      'A permanent, usually with activated abilities; often starts or gains counters.',
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
    short:
      'An arena card distinct from a hero card; it can only become your hero if you do not already control one.',
    category: 'type',
    noAutoLink: true
  },
  {
    id: 'figment',
    name: 'Figment',
    short:
      'A subtype for an aura-like permanent that enters the arena when it resolves.',
    category: 'type',
    noAutoLink: true
  },

  // Effect keywords
  {
    id: 'intimidate',
    name: 'Intimidate',
    short:
      "Banish a random card from that player's hand face-down; return it to their hand at the beginning of the end phase.",
    category: 'effect'
  },
  {
    id: 'freeze',
    name: 'Freeze',
    short:
      'The object cannot be played and its abilities cannot be activated for the stated duration.',
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
    short: "Move the object to its owner's banished zone.",
    category: 'effect',
    noAutoLink: true
  },
  {
    id: 'reload',
    name: 'Reload',
    short:
      'You may put a card from your hand face-down into your arsenal if all your arsenal zones are empty.',
    category: 'effect'
  },
  {
    id: 'charge',
    name: 'Charge',
    short: "Move a card from your hand to your hero's soul.",
    category: 'effect'
  },
  {
    id: 'amp',
    name: 'Amp',
    short:
      'Your next arcane damage source this turn deals X more arcane damage.',
    category: 'effect',
    parameterized: true
  },
  {
    id: 'transcend',
    name: 'Transcend',
    short:
      "Put the source of the effect into its owner's hand with its back face active.",
    category: 'effect'
  },
  {
    id: 'transform',
    name: 'Transform',
    short:
      'Turn a card or permanent into the object stated by the effect, keeping its zone.',
    category: 'effect',
    noAutoLink: true
  },
  {
    id: 'mark',
    name: 'Mark',
    short: 'The hero gains the marked condition.',
    category: 'effect',
    aliases: ['Marked'],
    noAutoLink: true
  },
  {
    id: 'awaken',
    name: 'Awaken',
    short: "Make a double-faced card's back face its active face.",
    category: 'effect'
  },
  {
    id: 'clash',
    name: 'Clash',
    short:
      'The clashing players reveal their top cards; the player who reveals the greatest power wins.',
    category: 'effect'
  },
  {
    id: 'negate',
    name: 'Negate',
    short: 'Clear the targeted layer from the stack without resolving it.',
    category: 'effect'
  },
  {
    id: 'retrieve',
    name: 'Retrieve',
    short: 'You may pay 1 resource to equip the retrieved card.',
    category: 'effect'
  },
  {
    id: 'steal',
    name: 'Steal',
    short: 'Gain control of the specified card.',
    category: 'effect'
  },
  {
    id: 'crowd-reaction',
    name: 'The Crowd Cheers / The Crowd Boos',
    aliases: ['The Crowd Cheers', 'The Crowd Boos'],
    short: 'The affected player is considered cheered or booed.',
    category: 'effect'
  },
  {
    id: 'sharpen',
    name: 'Sharpen',
    short:
      'Put a +1 power counter on the card, then remove all +1 power counters from it at the beginning of the end phase.',
    category: 'effect'
  },
  {
    id: 'unfreeze',
    name: 'Unfreeze',
    short: 'Remove the freeze effect from the object.',
    category: 'effect'
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
      'Having priority means it is your window to act - play instants, activate abilities, or pass.',
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
      'A token that is destroyed at the start of your turn; your next attack action card that turn can be defended by no more than 2 non-block cards.',
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
    short: 'Your hero’s health total; when it reaches 0 you lose the game.',
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
