import GameState from '../GameState';

const InitialGameState: GameState = {
  gameInfo: {
    gameID: 0,
    playerID: 0,
    authKey: '',
    isPrivate: false
  },
  gameDynamicInfo: {},
  playerOne: {},
  playerTwo: {},
  isUpdateInProgress: false,
  optionsMenu: { active: false },
  showModals: true,
  chatEnabled: false
};

export const OfflineTestingGameState: GameState = {
  gameInfo: {
    gameID: 0,
    playerID: 3,
    authKey: '',
    isPrivate: false
  },
  chatEnabled: false,
  gameDynamicInfo: { lastUpdate: 0 },
  amIActivePlayer: false,
  oldCombatChain: [
    {
      attackingCard: {
        cardNumber: 'WTR069'
      },
      reactionCards: [
        {
          cardNumber: 'CRU073'
        },
        {
          cardNumber: 'ARC044'
        }
      ],
      totalAttack: 88,
      totalDefence: 44,
      isDraconic: true
    },
    {
      attackingCard: {
        cardNumber: 'WTR069'
      },
      reactionCards: [
        {
          cardNumber: 'CRU073'
        },
        {
          cardNumber: 'ARC044'
        }
      ],
      totalAttack: 88,
      totalDefence: 44,
      didItHit: true,
      isDraconic: false
    },

    {
      attackingCard: {
        cardNumber: 'WTR069'
      },
      reactionCards: [
        {
          cardNumber: 'CRU073'
        },
        {
          cardNumber: 'ARC044'
        }
      ],
      totalAttack: 88,
      totalDefence: 44,
      didItHit: true,
      isDraconic: true
    }
  ],
  activeChainLink: {
    attackingCard: {
      cardNumber: 'CRU048'
    },
    reactionCards: [
      {
        cardNumber: 'CRU073'
      },
      {
        cardNumber: 'ARC044'
      }
    ],
    totalAttack: 88,
    totalDefence: 44,
    didItHit: true,
    goAgain: true,
    dominate: true,
    overpower: true,
    wager: true,
    phantasm: true,
    fusion: true,
    piercing: true,
    tower: true,
    combo: true,
    damagePrevention: 5,
    attackTarget: 'Prism'
  },
  playerOne: {
    // human player
    Name: 'LaustinSpayce',
    HeadEq: { cardNumber: 'WTR079' },
    ChestEq: { cardNumber: 'WTR150', counters: 2 },
    ArmsEq: { cardNumber: 'UPR158', isBroken: true },
    LegsEq: { cardNumber: 'WTR154' },
    WeaponLEq: { cardNumber: 'CRU048', isFrozen: true },
    Hero: { cardNumber: 'CRU046' },
    Health: 20,
    ActionPoints: 0,
    PitchRemaining: 0,
    Playmat: 'IronsongDetermination',
    Permanents: [
      {
        cardNumber: 'ARC010',
        counters: 1
      },
      {
        cardNumber: 'ARC010'
      },
      {
        cardNumber: 'MON104'
      },
      {
        cardNumber: 'UPR409',
        lifeCounters: 5,
        counters: 12,
        defCounters: 873
      }
    ],
    Graveyard: [
      {
        cardNumber: 'ARC003'
      },
      {
        cardNumber: 'WTR069'
      },
      {
        cardNumber: 'WTR101'
      },
      {
        cardNumber: 'WTR100'
      },
      {
        cardNumber: 'WTR104'
      },
      {
        cardNumber: 'CRU073'
      },
      {
        cardNumber: 'WTR101'
      },
      {
        cardNumber: 'WTR100'
      },
      {
        cardNumber: 'WTR104'
      },
      {
        cardNumber: 'CRU073'
      },
      {
        cardNumber: 'WTR101'
      },
      {
        cardNumber: 'WTR100'
      },
      {
        cardNumber: 'WTR104'
      },
      {
        cardNumber: 'CRU073'
      },
      {
        cardNumber: 'WTR101'
      },
      {
        cardNumber: 'WTR100'
      },
      {
        cardNumber: 'WTR104'
      },
      {
        cardNumber: 'CRU073'
      },
      {
        cardNumber: 'WTR101'
      },
      {
        cardNumber: 'WTR100'
      },
      {
        cardNumber: 'WTR104'
      },
      {
        cardNumber: 'CRU073'
      },
      {
        cardNumber: 'WTR101'
      },
      {
        cardNumber: 'WTR100'
      },
      {
        cardNumber: 'WTR104'
      },
      {
        cardNumber: 'CRU073'
      }
    ],
    Pitch: [
      {
        cardNumber: 'ARC003'
      },
      {
        cardNumber: 'WTR069'
      }
    ],
    Hand: [
      {
        cardNumber: 'WTR101'
      },
      {
        cardNumber: 'WTR100'
      },
      {
        cardNumber: 'WTR104'
      },
      {
        cardNumber: 'CRU073'
      }
    ],
    Arsenal: [
      {
        cardNumber: 'UPR161'
      }
    ],
    Effects: [
      {
        cardNumber: 'ARC044'
      }
    ]
  },
  playerTwo: {
    // AI or opposing player
    Name: 'BigDumDum',
    HeadEq: { cardNumber: 'CRU006' },
    ChestEq: { cardNumber: 'WTR005' },
    ArmsEq: { cardNumber: 'WTR153' },
    LegsEq: { cardNumber: 'WTR004' },
    WeaponLEq: { cardNumber: 'WTR003' },
    Hero: { cardNumber: 'WTR002' },
    WeaponREq: undefined,
    Health: 20,
    ActionPoints: 0,
    PitchRemaining: 0,
    Playmat: 'Everfest',
    Hand: [
      {
        cardNumber: 'CBBlack'
      },
      {
        cardNumber: 'CBBlack'
      },
      {
        cardNumber: 'CBBlack'
      },
      {
        cardNumber: 'CBBlack'
      }
    ],
    Arsenal: [
      {
        cardNumber: 'CBBlack'
      }
    ],
    Banish: [
      {
        cardNumber: 'WTR104'
      },
      {
        cardNumber: 'CRU073'
      }
    ]
  },
  popup: {
    popupOn: false,
    popupCard: undefined
  },
  optionsMenu: {
    active: false
  },
  showModals: true
};

export default InitialGameState as GameState;
