import GameState from '../GameState';

const InitialGameState: GameState = {
  gameInfo: {
    gameID: 73333,
    playerID: 3,
    authKey: '28df413b665604299807c461a7f3cae71c4176cb2b96afad04b84cf96d016258'
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
      didItHit: true
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
      didItHit: true
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
      didItHit: true
    }
  ],
  activeCombatChain: {
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
    didItHit: true
  },
  playerOne: {
    // human player
    Name: 'LaustinSpayce',
    IsVerified: true,
    HeadEq: { cardNumber: 'WTR079' },
    ChestEq: { cardNumber: 'WTR150', counters: 2 },
    GlovesEq: { cardNumber: 'UPR158' },
    FeetEq: { cardNumber: 'WTR154' },
    WeaponLEq: { cardNumber: 'CRU048' },
    Hero: { cardNumber: 'CRU046' },
    WeaponREq: { cardNumber: 'CRU049' },
    Health: 20,
    ActionPoints: 0,
    PitchRemaining: 0,
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
    WeaponLEq: { cardNumber: '' },
    Hero: { cardNumber: 'WTR002' },
    WeaponREq: { cardNumber: 'WTR003' },
    Health: 20,
    ActionPoints: 0,
    PitchRemaining: 0,
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
  }
};

export default InitialGameState as GameState;
