import GameState from '../GameState';

const InitialGameState: GameState = {
  gameInfo: {
    gameID: 174,
    playerID: 1,
    authKey: 'ff4c10933664bb5071726525e07637d5b037b95cad8ac65b5f54613d15f0e65c'
  },
  playerOne: {},
  playerTwo: {},
  isUpdateInProgress: false,
  optionsMenu: { active: false }
};

export const OfflineTestingGameState: GameState = {
  gameInfo: {
    gameID: 0,
    playerID: 3,
    authKey: '',
    lastUpdate: 0
  },
  activePlayer: 1,
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
    fused: true,
    damagePrevention: 5
  },
  playerOne: {
    // human player
    Name: 'LaustinSpayce',
    HeadEq: { cardNumber: 'WTR079' },
    ChestEq: { cardNumber: 'WTR150', counters: 2 },
    GlovesEq: { cardNumber: 'UPR158', isBroken: true },
    FeetEq: { cardNumber: 'WTR154' },
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
    GlovesEq: { cardNumber: 'WTR153' },
    FeetEq: { cardNumber: 'WTR004' },
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
  }
};

export default InitialGameState as GameState;
