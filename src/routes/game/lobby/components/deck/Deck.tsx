import { Field, useFormikContext } from 'formik';
import React, { useState, useMemo } from 'react';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import { DeckResponse, CardData } from 'interface/API/GetLobbyInfo.php';
import styles from './Deck.module.css';
import CardPopUp from 'routes/game/components/elements/cardPopUp/CardPopUp';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { MdArrowDropDown, MdArrowRight } from 'react-icons/md';

type SortMode = 'none' | 'pitch' | 'name' | 'power' | 'blockValue' | 'class' | 'talent' | 'subtype' | 'cost';

type DeckProps = {
  deck: string[];
  cardDictionary?: CardData[];
};

const Deck = ({ deck, cardDictionary = [] }: DeckProps) => {
  const { values } = useFormikContext<DeckResponse>();
  const { getLanguage } = useLanguageSelector();
  const [sortMode, setSortMode] = useState<SortMode>('none');
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const DeckSelectionButtons = () => {
    const { setFieldValue } = useFormikContext<DeckResponse>();

    const handleSelectAll = () => {
      setFieldValue('deck', deck);
    };

    const handleSelectNone = () => {
      setFieldValue('deck', []);
    };

    return (
      <div className={styles.selectionButtons}>
        <button
          className={styles.selectionButton}
          onClick={handleSelectAll}
          type="button"
          title="Select all cards"
        >
          Select All
        </button>
        <button
          className={styles.selectionButton}
          onClick={handleSelectNone}
          type="button"
          title="Deselect all cards"
        >
          Select None
        </button>
      </div>
    );
  };

  const getImageSrc = (currentCardNumber: string) =>
    getCollectionCardImagePath({
      path: CARD_SQUARES_PATH,
      locale: getLanguage(),
      cardNumber: currentCardNumber
    });

  // Utility function to clean and format class/talent strings
  const formatAttributeString = (str: string | undefined): string => {
    if (!str) return 'Unknown';
    // Add space after commas and capitalize each word
    return str
      .split(',')
      .map(part => part.trim())
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(', ');
  };

  // Create a map of card ID to pitch for quick lookup
  const cardPitchMap = useMemo(() => {
    const map = new Map<string, number>();
    if (cardDictionary && cardDictionary.length > 0) {
      cardDictionary.forEach((card: CardData) => {
        map.set(card.id, card.pitch);
      });
    }
    return map;
  }, [cardDictionary]);

  // Create a map of card ID to power for quick lookup
  const cardPowerMap = useMemo(() => {
    const map = new Map<string, number>();
    if (cardDictionary && cardDictionary.length > 0) {
      cardDictionary.forEach((card: CardData) => {
        if (card.power !== undefined) {
          map.set(card.id, card.power);
        }
      });
    }
    return map;
  }, [cardDictionary]);

  // Create a map of card ID to block value for quick lookup
  const cardBlockValueMap = useMemo(() => {
    const map = new Map<string, number>();
    if (cardDictionary && cardDictionary.length > 0) {
      cardDictionary.forEach((card: CardData) => {
        if (card.blockValue !== undefined) {
          map.set(card.id, card.blockValue);
        }
      });
    }
    return map;
  }, [cardDictionary]);

  // Create a map of card ID to class for quick lookup
  const cardClassMap = useMemo(() => {
    const map = new Map<string, string>();
    if (cardDictionary && cardDictionary.length > 0) {
      cardDictionary.forEach((card: CardData) => {
        if (card.class !== undefined) {
          map.set(card.id, card.class);
        }
      });
    }
    return map;
  }, [cardDictionary]);

  // Create a map of card ID to talent for quick lookup
  const cardTalentMap = useMemo(() => {
    const map = new Map<string, string>();
    if (cardDictionary && cardDictionary.length > 0) {
      cardDictionary.forEach((card: CardData) => {
        if (card.talent !== undefined) {
          map.set(card.id, card.talent);
        }
      });
    }
    return map;
  }, [cardDictionary]);

  // Create a map of card ID to subtype for quick lookup
  const cardSubtypeMap = useMemo(() => {
    const map = new Map<string, string>();
    if (cardDictionary && cardDictionary.length > 0) {
      cardDictionary.forEach((card: CardData) => {
        if (card.subtype !== undefined) {
          map.set(card.id, card.subtype);
        }
      });
    }
    return map;
  }, [cardDictionary]);

  // Create a map of card ID to cost for quick lookup
  const cardCostMap = useMemo(() => {
    const map = new Map<string, number>();
    if (cardDictionary && cardDictionary.length > 0) {
      cardDictionary.forEach((card: CardData) => {
        if (card.cost !== undefined) {
          map.set(card.id, card.cost);
        }
      });
    }
    return map;
  }, [cardDictionary]);

  // Get pitch for a card
  const getPitch = (cardId: string): number | undefined => {
    return cardPitchMap.get(cardId);
  };

  // Get power for a card
  const getPower = (cardId: string): number | undefined => {
    return cardPowerMap.get(cardId);
  };

  // Get block value for a card
  const getBlockValue = (cardId: string): number | undefined => {
    return cardBlockValueMap.get(cardId);
  };

  // Get class for a card
  const getClass = (cardId: string): string | undefined => {
    return cardClassMap.get(cardId);
  };

  // Get talent for a card
  const getTalent = (cardId: string): string | undefined => {
    return cardTalentMap.get(cardId);
  };

  // Get subtype for a card
  const getSubtype = (cardId: string): string | undefined => {
    return cardSubtypeMap.get(cardId);
  };

  // Get cost for a card
  const getCost = (cardId: string): number | undefined => {
    return cardCostMap.get(cardId);
  };

  // Sort and group cards based on sortMode
  const sortedDeck = useMemo(() => {
    if (sortMode === 'none') {
      return deck;
    }

    const deckArray = Array.from(deck);

    if (sortMode === 'pitch') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const pitchA = getPitch(cardAId);
        const pitchB = getPitch(cardBId);
        
        // Cards with pitch come first, sorted by pitch value
        // Cards without pitch come last
        if (pitchA !== undefined && pitchB !== undefined) {
          return pitchA - pitchB;
        }
        if (pitchA !== undefined) return -1;
        if (pitchB !== undefined) return 1;
        return cardAId.localeCompare(cardBId);
      });
    }

    if (sortMode === 'power') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const powerA = getPower(cardAId);
        const powerB = getPower(cardBId);
        
        // Higher power first, then cards without power, sorted by name
        if (powerA !== undefined && powerB !== undefined) {
          return powerB - powerA;
        }
        if (powerA !== undefined) return -1;
        if (powerB !== undefined) return 1;
        return cardAId.localeCompare(cardBId);
      });
    }

    if (sortMode === 'blockValue') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const blockA = getBlockValue(cardAId);
        const blockB = getBlockValue(cardBId);
        
        // Higher block value first, then cards without block, sorted by name
        if (blockA !== undefined && blockB !== undefined) {
          return blockB - blockA;
        }
        if (blockA !== undefined) return -1;
        if (blockB !== undefined) return 1;
        return cardAId.localeCompare(cardBId);
      });
    }

    if (sortMode === 'class') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const classA = getClass(cardAId);
        const classB = getClass(cardBId);
        
        // Sort by class name, then by card ID
        if (classA !== undefined && classB !== undefined) {
          if (classA !== classB) {
            return classA.localeCompare(classB);
          }
        } else if (classA !== undefined) {
          return -1;
        } else if (classB !== undefined) {
          return 1;
        }
        return cardAId.localeCompare(cardBId);
      });
    }

    if (sortMode === 'talent') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const talentA = getTalent(cardAId);
        const talentB = getTalent(cardBId);
        
        // Sort by talent name, then by card ID
        if (talentA !== undefined && talentB !== undefined) {
          if (talentA !== talentB) {
            return talentA.localeCompare(talentB);
          }
        } else if (talentA !== undefined) {
          return -1;
        } else if (talentB !== undefined) {
          return 1;
        }
        return cardAId.localeCompare(cardBId);
      });
    }

    if (sortMode === 'subtype') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const subtypeA = getSubtype(cardAId);
        const subtypeB = getSubtype(cardBId);
        
        // Sort by subtype name, then by card ID
        if (subtypeA !== undefined && subtypeB !== undefined) {
          if (subtypeA !== subtypeB) {
            return subtypeA.localeCompare(subtypeB);
          }
        } else if (subtypeA !== undefined) {
          return -1;
        } else if (subtypeB !== undefined) {
          return 1;
        }
        return cardAId.localeCompare(cardBId);
      });
    }

    if (sortMode === 'cost') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const costA = getCost(cardAId);
        const costB = getCost(cardBId);
        
        // Lowest cost first, then cards without cost, sorted by name
        if (costA !== undefined && costB !== undefined) {
          return costA - costB;
        }
        if (costA !== undefined) return -1;
        if (costB !== undefined) return 1;
        return cardAId.localeCompare(cardBId);
      });
    }

    if (sortMode === 'name') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const pitchA = getPitch(cardAId);
        const pitchB = getPitch(cardBId);
        
        // First sort by pitch (with pitch first, then without)
        if (pitchA !== undefined && pitchB !== undefined) {
          if (pitchA !== pitchB) {
            return pitchA - pitchB;
          }
        } else if (pitchA !== undefined) {
          return -1;
        } else if (pitchB !== undefined) {
          return 1;
        }
        
        // Then by card name (ID)
        return cardAId.localeCompare(cardBId);
      });
    }

    return deckArray;
  }, [deck, sortMode, cardPitchMap, cardPowerMap, cardBlockValueMap, cardClassMap, cardTalentMap, cardSubtypeMap, cardCostMap, getPitch, getPower, getBlockValue, getClass, getTalent, getSubtype, getCost]);

  // Group cards by various attributes
  const groupedCards = useMemo(() => {
    if (sortMode === 'none') {
      return null;
    }

    if (sortMode === 'pitch' || sortMode === 'name') {
      const pitchGroups = new Map<number, string[]>();
      const noPitchCards: string[] = [];
      
      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const pitch = getPitch(cardId);
        
        if (pitch !== undefined) {
          if (!pitchGroups.has(pitch)) {
            pitchGroups.set(pitch, []);
          }
          pitchGroups.get(pitch)!.push(card);
        } else {
          noPitchCards.push(card);
        }
      });

      return { type: 'numeric', groups: pitchGroups, noValueCards: noPitchCards, headerPrefix: 'Pitch' };
    }

    if (sortMode === 'power') {
      const powerGroups = new Map<number, string[]>();
      const noPowerCards: string[] = [];
      
      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const power = getPower(cardId);
        
        if (power !== undefined) {
          if (!powerGroups.has(power)) {
            powerGroups.set(power, []);
          }
          powerGroups.get(power)!.push(card);
        } else {
          noPowerCards.push(card);
        }
      });

      return { type: 'numeric', groups: powerGroups, noValueCards: noPowerCards, headerPrefix: 'Power' };
    }

    if (sortMode === 'blockValue') {
      const blockGroups = new Map<number, string[]>();
      const noBlockCards: string[] = [];
      
      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const block = getBlockValue(cardId);
        
        if (block !== undefined && block !== -1) {
          if (!blockGroups.has(block)) {
            blockGroups.set(block, []);
          }
          blockGroups.get(block)!.push(card);
        } else {
          noBlockCards.push(card);
        }
      });

      return { type: 'numeric', groups: blockGroups, noValueCards: noBlockCards, headerPrefix: 'Block' };
    }

    if (sortMode === 'class') {
      const classGroups = new Map<string, string[]>();
      const noClassCards: string[] = [];
      
      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const cardClass = getClass(cardId);
        
        if (cardClass !== undefined && cardClass !== '') {
          const key = formatAttributeString(cardClass);
          if (!classGroups.has(key)) {
            classGroups.set(key, []);
          }
          classGroups.get(key)!.push(card);
        } else {
          noClassCards.push(card);
        }
      });

      return { type: 'string', groups: classGroups, noValueCards: noClassCards, headerPrefix: 'Class' };
    }

    if (sortMode === 'talent') {
      const talentGroups = new Map<string, string[]>();
      const noTalentCards: string[] = [];
      
      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const talent = getTalent(cardId);
        
        if (talent !== undefined && talent !== '') {
          const key = formatAttributeString(talent);
          if (!talentGroups.has(key)) {
            talentGroups.set(key, []);
          }
          talentGroups.get(key)!.push(card);
        } else {
          noTalentCards.push(card);
        }
      });

      return { type: 'string', groups: talentGroups, noValueCards: noTalentCards, headerPrefix: 'Talent' };
    }

    if (sortMode === 'subtype') {
      const subtypeGroups = new Map<string, string[]>();
      const noSubtypeCards: string[] = [];
      
      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const subtype = getSubtype(cardId);
        
        if (subtype !== undefined && subtype !== '') {
          const key = formatAttributeString(subtype);
          if (!subtypeGroups.has(key)) {
            subtypeGroups.set(key, []);
          }
          subtypeGroups.get(key)!.push(card);
        } else {
          noSubtypeCards.push(card);
        }
      });

      return { type: 'string', groups: subtypeGroups, noValueCards: noSubtypeCards, headerPrefix: 'Subtype' };
    }

    if (sortMode === 'cost') {
      const costGroups = new Map<number, string[]>();
      const noCostCards: string[] = [];
      
      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const cost = getCost(cardId);
        
        if (cost !== undefined && cost !== -1) {
          if (!costGroups.has(cost)) {
            costGroups.set(cost, []);
          }
          costGroups.get(cost)!.push(card);
        } else {
          noCostCards.push(card);
        }
      });

      return { type: 'numeric', groups: costGroups, noValueCards: noCostCards, headerPrefix: 'Cost' };
    }

    return null;
  }, [sortedDeck, sortMode, cardPitchMap, cardPowerMap, cardBlockValueMap, cardClassMap, cardTalentMap, cardSubtypeMap, cardCostMap, getPitch, getPower, getBlockValue, getClass, getTalent, getSubtype, getCost]);

  return (
    <div className={styles.deckContainer}>
      <div className={styles.sortControls}>
        <button
          className={styles.expandButton}
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          type="button"
          title={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          {filtersExpanded ? <MdArrowDropDown size={24} /> : <MdArrowRight size={24} />}
          Filters
        </button>
        <DeckSelectionButtons />
        {filtersExpanded && (
          <>
            <button
              className={`${styles.sortButton} ${sortMode === 'none' ? styles.active : ''}`}
              onClick={() => setSortMode('none')}
              type="button"
              title="Display cards in original order"
            >
              Default
            </button>
            <button
              className={`${styles.sortButton} ${sortMode === 'pitch' ? styles.active : ''}`}
              onClick={() => setSortMode('pitch')}
              type="button"
              title="Sort cards by pitch only"
            >
              Pitch
            </button>
            <button
              className={`${styles.sortButton} ${sortMode === 'name' ? styles.active : ''}`}
              onClick={() => setSortMode('name')}
              type="button"
              title="Group cards by pitch, then sort by name"
            >
              Pitch & Name
            </button>
            <button
              className={`${styles.sortButton} ${sortMode === 'power' ? styles.active : ''}`}
              onClick={() => setSortMode('power')}
              type="button"
              title="Sort cards by power (higher first)"
            >
              Power
            </button>
            <button
              className={`${styles.sortButton} ${sortMode === 'blockValue' ? styles.active : ''}`}
              onClick={() => setSortMode('blockValue')}
              type="button"
              title="Sort cards by block value (higher first)"
            >
              Block Value
            </button>
            <button
              className={`${styles.sortButton} ${sortMode === 'class' ? styles.active : ''}`}
              onClick={() => setSortMode('class')}
              type="button"
              title="Group cards by class"
            >
              Class
            </button>
            <button
              className={`${styles.sortButton} ${sortMode === 'talent' ? styles.active : ''}`}
              onClick={() => setSortMode('talent')}
              type="button"
              title="Group cards by talent"
            >
              Talent
            </button>
            <button
              className={`${styles.sortButton} ${sortMode === 'subtype' ? styles.active : ''}`}
              onClick={() => setSortMode('subtype')}
              type="button"
              title="Group cards by subtype"
            >
              Subtype
            </button>
            <button
              className={`${styles.sortButton} ${sortMode === 'cost' ? styles.active : ''}`}
              onClick={() => setSortMode('cost')}
              type="button"
              title="Sort cards by cost (lowest first)"
            >
              Cost
            </button>
          </>
        )}
      </div>

      <div className={styles.container}>
        {groupedCards ? (
          // Grouped view
          <>
            {groupedCards.type === 'numeric' ? (
              // Numeric grouping (pitch, power, block value)
              <>
                {Array.from(groupedCards.groups as Map<number, string[]>)
                  .sort(([keyA, ], [keyB, ]) => {
                    // For power and block, sort descending (higher first)
                    if (sortMode === 'power' || sortMode === 'blockValue') {
                      return (keyB as number) - (keyA as number);
                    }
                    // For pitch, sort ascending
                    return (keyA as number) - (keyB as number);
                  })
                  .map(([key, cards]: [number, string[]]) => (
                    <div key={`${sortMode}-${key}`} className={styles.pitchGroup}>
                      <div className={styles.pitchHeader}>
                        {`${groupedCards.headerPrefix} ${key}`}
                      </div>
                      <div className={styles.cardsGroup}>
                        {cards.map((card: string, ix: number) => (
                          <div key={`${key}-${ix}`} className={styles.deckCardContainer}>
                            <label>
                              <Field type="checkbox" name="deck" value={`${card}`} />
                              <CardPopUp cardNumber={card.split('-')[0]}>
                                <CardImage
                                  src={getImageSrc(card.split('-')[0])}
                                  draggable={false}
                                  className={styles.card}
                                />
                              </CardPopUp>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              // String grouping (class, talent)
              <>
                {Array.from(groupedCards.groups as Map<string, string[]>)
                  .sort(([keyA, ], [keyB, ]) => (keyA as string).localeCompare(keyB as string))
                  .map(([key, cards]: [string, string[]]) => (
                    <div key={`${sortMode}-${key}`} className={styles.pitchGroup}>
                      <div className={styles.pitchHeader}>
                        {`${groupedCards.headerPrefix} ${key}`}
                      </div>
                      <div className={styles.cardsGroup}>
                        {cards.map((card: string, ix: number) => (
                          <div key={`${key}-${ix}`} className={styles.deckCardContainer}>
                            <label>
                              <Field type="checkbox" name="deck" value={`${card}`} />
                              <CardPopUp cardNumber={card.split('-')[0]}>
                                <CardImage
                                  src={getImageSrc(card.split('-')[0])}
                                  draggable={false}
                                  className={styles.card}
                                />
                              </CardPopUp>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </>
            )}
            {groupedCards.noValueCards.length > 0 && (
              <div className={styles.pitchGroup}>
                <div className={styles.pitchHeader}>
                  No {groupedCards.headerPrefix}
                </div>
                <div className={styles.cardsGroup}>
                  {groupedCards.noValueCards.map((card: string, ix: number) => (
                    <div key={`no-value-${ix}`} className={styles.deckCardContainer}>
                      <label>
                        <Field type="checkbox" name="deck" value={`${card}`} />
                        <CardPopUp cardNumber={card.split('-')[0]}>
                          <CardImage
                            src={getImageSrc(card.split('-')[0])}
                            draggable={false}
                            className={styles.card}
                          />
                        </CardPopUp>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // Flat view
          <>
            {sortedDeck.map((card: string, ix: number) => {
              return (
                <div key={`deck${ix}`} className={styles.deckCardContainer}>
                  <label>
                    <Field type="checkbox" name="deck" value={`${card}`} />
                    <CardPopUp cardNumber={card.split('-')[0]}>
                      <CardImage
                        src={getImageSrc(card.split('-')[0])}
                        draggable={false}
                        className={styles.card}
                      />
                    </CardPopUp>
                  </label>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Deck;
