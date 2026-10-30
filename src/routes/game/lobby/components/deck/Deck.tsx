import { Field, useFormikContext } from 'formik';
import { memo, useState, useMemo } from 'react';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import { DeckResponse, CardData } from 'interface/API/GetLobbyInfo.php';
import styles from './Deck.module.css';
import CardPopUp from 'routes/game/components/elements/cardPopUp/CardPopUp';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { MdArrowDropDown, MdArrowRight } from 'react-icons/md';
import { TYPE_LABELS } from 'constants/cardConstants';
import { useTranslation } from 'react-i18next';

type SortMode =
  | 'none'
  | 'pitch'
  | 'power'
  | 'blockValue'
  | 'class'
  | 'talent'
  | 'type'
  | 'subtype'
  | 'cost';

const DeckCardCheckbox = memo(function DeckCardCheckbox({
  card,
  imageSrc
}: {
  card: string;
  imageSrc: string;
}) {
  return (
    <label>
      <Field type="checkbox" name="deck" value={`${card}`} />
      <CardPopUp cardNumber={card.split('-')[0]}>
        <CardImage src={imageSrc} draggable={false} className={styles.card} />
      </CardPopUp>
    </label>
  );
});

const DeckSelectionButtons = ({
  deck,
  filtersExpanded,
  setFiltersExpanded
}: {
  deck: string[];
  filtersExpanded: boolean;
  setFiltersExpanded?: (value: boolean) => void;
}) => {
  const { t } = useTranslation();
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
        className={styles.expandButton}
        onClick={() =>
          setFiltersExpanded && setFiltersExpanded(!filtersExpanded)
        }
        type="button"
        title={
          filtersExpanded
            ? t('GAME_LOBBY.COLLAPSE_FILTERS')
            : t('GAME_LOBBY.EXPAND_FILTERS')
        }
      >
        {filtersExpanded ? (
          <MdArrowDropDown size={24} />
        ) : (
          <MdArrowRight size={24} />
        )}
        {t('GAME_LOBBY.FILTERS')}
      </button>
      <button
        className={styles.selectionButton}
        onClick={handleSelectAll}
        type="button"
        title={t('GAME_LOBBY.SELECT_ALL_TITLE')}
      >
        {t('GAME_LOBBY.SELECT_ALL')}
      </button>
      <button
        className={styles.selectionButton}
        onClick={handleSelectNone}
        type="button"
        title={t('GAME_LOBBY.SELECT_NONE_TITLE')}
      >
        {t('GAME_LOBBY.SELECT_NONE')}
      </button>
    </div>
  );
};

type DeckProps = {
  deck: string[];
  cardDictionary?: CardData[];
  filtersExpanded?: boolean;
  setFiltersExpanded?: (value: boolean) => void;
  isDesktop?: boolean;
};

const Deck = ({
  deck,
  cardDictionary = [],
  filtersExpanded = false,
  setFiltersExpanded,
  isDesktop = true
}: DeckProps) => {
  // Initial stuff to allow the lang to change
  const { t } = useTranslation();

  const { values } = useFormikContext<DeckResponse>();
  const { getLanguage } = useLanguageSelector();
  const [sortMode, setSortMode] = useState<SortMode>('none');

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
      .map((part) => part.trim())
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(', ');
  };

  // Utility function to format type codes to human-readable labels
  const formatTypeLabel = (typeCode: string | undefined): string => {
    if (!typeCode) return 'Unknown';
    return TYPE_LABELS[typeCode] || typeCode;
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

  // Create a map of card ID to type for quick lookup
  const cardTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    if (cardDictionary && cardDictionary.length > 0) {
      cardDictionary.forEach((card: CardData) => {
        if (card.type !== undefined) {
          map.set(card.id, card.type);
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
        const pitchA = cardPitchMap.get(cardAId);
        const pitchB = cardPitchMap.get(cardBId);

        // Cards with pitch come first, sorted by pitch value
        // Cards without pitch come last
        if (pitchA !== undefined && pitchB !== undefined) {
          if (pitchA !== pitchB) {
            return pitchA - pitchB;
          }
          // Same pitch, sort by card name
          return cardAId.localeCompare(cardBId);
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
        const powerA = cardPowerMap.get(cardAId);
        const powerB = cardPowerMap.get(cardBId);

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
        const blockA = cardBlockValueMap.get(cardAId);
        const blockB = cardBlockValueMap.get(cardBId);

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
        const classA = cardClassMap.get(cardAId);
        const classB = cardClassMap.get(cardBId);

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
        const talentA = cardTalentMap.get(cardAId);
        const talentB = cardTalentMap.get(cardBId);

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

    if (sortMode === 'type') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const typeA = cardTypeMap.get(cardAId);
        const typeB = cardTypeMap.get(cardBId);

        // Sort by type name, then by card ID
        if (typeA !== undefined && typeB !== undefined) {
          if (typeA !== typeB) {
            return typeA.localeCompare(typeB);
          }
        } else if (typeA !== undefined) {
          return -1;
        } else if (typeB !== undefined) {
          return 1;
        }
        return cardAId.localeCompare(cardBId);
      });
    }

    if (sortMode === 'subtype') {
      return deckArray.sort((a, b) => {
        const cardAId = a.split('-')[0];
        const cardBId = b.split('-')[0];
        const subtypeA = cardSubtypeMap.get(cardAId);
        const subtypeB = cardSubtypeMap.get(cardBId);

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
        const costA = cardCostMap.get(cardAId);
        const costB = cardCostMap.get(cardBId);

        // Lowest cost first, then cards without cost, sorted by name
        if (costA !== undefined && costB !== undefined) {
          return costA - costB;
        }
        if (costA !== undefined) return -1;
        if (costB !== undefined) return 1;
        return cardAId.localeCompare(cardBId);
      });
    }

    return deckArray;
  }, [
    deck,
    sortMode,
    cardPitchMap,
    cardPowerMap,
    cardBlockValueMap,
    cardClassMap,
    cardTalentMap,
    cardTypeMap,
    cardSubtypeMap,
    cardCostMap
  ]);

  // Group cards by various attributes
  const groupedCards = useMemo(() => {
    if (sortMode === 'none') {
      return null;
    }

    if (sortMode === 'pitch') {
      const pitchGroups = new Map<number, string[]>();
      const noPitchCards: string[] = [];

      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const pitch = cardPitchMap.get(cardId);

        if (pitch !== undefined) {
          if (!pitchGroups.has(pitch)) {
            pitchGroups.set(pitch, []);
          }
          pitchGroups.get(pitch)!.push(card);
        } else {
          noPitchCards.push(card);
        }
      });

      return {
        type: 'numeric',
        groups: pitchGroups,
        noValueCards: noPitchCards,
        headerPrefix: 'Pitch'
      };
    }

    if (sortMode === 'power') {
      const powerGroups = new Map<number, string[]>();
      const noPowerCards: string[] = [];

      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const power = cardPowerMap.get(cardId);

        if (power !== undefined) {
          if (!powerGroups.has(power)) {
            powerGroups.set(power, []);
          }
          powerGroups.get(power)!.push(card);
        } else {
          noPowerCards.push(card);
        }
      });

      return {
        type: 'numeric',
        groups: powerGroups,
        noValueCards: noPowerCards,
        headerPrefix: 'Power'
      };
    }

    if (sortMode === 'blockValue') {
      const blockGroups = new Map<number, string[]>();
      const noBlockCards: string[] = [];

      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const block = cardBlockValueMap.get(cardId);

        if (block !== undefined && block !== -1) {
          if (!blockGroups.has(block)) {
            blockGroups.set(block, []);
          }
          blockGroups.get(block)!.push(card);
        } else {
          noBlockCards.push(card);
        }
      });

      return {
        type: 'numeric',
        groups: blockGroups,
        noValueCards: noBlockCards,
        headerPrefix: 'Block'
      };
    }

    if (sortMode === 'class') {
      const classGroups = new Map<string, string[]>();
      const noClassCards: string[] = [];

      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const cardClass = cardClassMap.get(cardId);

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

      return {
        type: 'string',
        groups: classGroups,
        noValueCards: noClassCards,
        headerPrefix: 'Class'
      };
    }

    if (sortMode === 'talent') {
      const talentGroups = new Map<string, string[]>();
      const noTalentCards: string[] = [];

      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const talent = cardTalentMap.get(cardId);

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

      return {
        type: 'string',
        groups: talentGroups,
        noValueCards: noTalentCards,
        headerPrefix: 'Talent'
      };
    }

    if (sortMode === 'type') {
      const typeGroups = new Map<string, string[]>();
      const noTypeCards: string[] = [];

      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const type = cardTypeMap.get(cardId);

        if (type !== undefined && type !== '') {
          const key = formatTypeLabel(type);
          if (!typeGroups.has(key)) {
            typeGroups.set(key, []);
          }
          typeGroups.get(key)!.push(card);
        } else {
          noTypeCards.push(card);
        }
      });

      return {
        type: 'string',
        groups: typeGroups,
        noValueCards: noTypeCards,
        headerPrefix: ''
      };
    }

    if (sortMode === 'subtype') {
      const subtypeGroups = new Map<string, string[]>();
      const noSubtypeCards: string[] = [];

      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const subtype = cardSubtypeMap.get(cardId);

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

      return {
        type: 'string',
        groups: subtypeGroups,
        noValueCards: noSubtypeCards,
        headerPrefix: ''
      };
    }

    if (sortMode === 'cost') {
      const costGroups = new Map<number, string[]>();
      const noCostCards: string[] = [];

      sortedDeck.forEach((card) => {
        const cardId = card.split('-')[0];
        const cost = cardCostMap.get(cardId);

        if (cost !== undefined && cost !== -1) {
          if (!costGroups.has(cost)) {
            costGroups.set(cost, []);
          }
          costGroups.get(cost)!.push(card);
        } else {
          noCostCards.push(card);
        }
      });

      return {
        type: 'numeric',
        groups: costGroups,
        noValueCards: noCostCards,
        headerPrefix: 'Cost'
      };
    }

    return null;
  }, [
    sortedDeck,
    sortMode,
    cardPitchMap,
    cardPowerMap,
    cardBlockValueMap,
    cardClassMap,
    cardTalentMap,
    cardTypeMap,
    cardSubtypeMap,
    cardCostMap
  ]);

  return (
    <div className={styles.deckContainer}>
      <div
        className={styles.sortControls}
        style={{ padding: isDesktop ? (filtersExpanded ? '15px' : 0) : '15px' }}
      >
        <DeckSelectionButtons
          deck={deck}
          filtersExpanded={filtersExpanded}
          setFiltersExpanded={setFiltersExpanded}
        />
        {filtersExpanded && (
          <>
            <button
              className={`${styles.sortButton} ${
                sortMode === 'none' ? styles.active : ''
              }`}
              onClick={() => setSortMode('none')}
              type="button"
              title={t('GAME_LOBBY.DISPLAY_ORDER')}
            >
              {t('GAME_LOBBY.DEFAULT')}
            </button>
            <button
              className={`${styles.sortButton} ${
                sortMode === 'pitch' ? styles.active : ''
              }`}
              onClick={() => setSortMode('pitch')}
              type="button"
              title={t('GAME_LOBBY.PITCH_SORT')}
            >
              {t('GAME_LOBBY.PITCH')}
            </button>
            <button
              className={`${styles.sortButton} ${
                sortMode === 'power' ? styles.active : ''
              }`}
              onClick={() => setSortMode('power')}
              type="button"
              title={t('GAME_LOBBY.POWER_SORT')}
            >
              {t('GAME_LOBBY.POWER')}
            </button>
            <button
              className={`${styles.sortButton} ${
                sortMode === 'blockValue' ? styles.active : ''
              }`}
              onClick={() => setSortMode('blockValue')}
              type="button"
              title={t('GAME_LOBBY.BLOCK_SORT')}
            >
              {t('GAME_LOBBY.BLOCK')}
            </button>
            <button
              className={`${styles.sortButton} ${
                sortMode === 'class' ? styles.active : ''
              }`}
              onClick={() => setSortMode('class')}
              type="button"
              title={t('GAME_LOBBY.CLASS_SORT')}
            >
              {t('GAME_LOBBY.CLASS')}
            </button>
            <button
              className={`${styles.sortButton} ${
                sortMode === 'talent' ? styles.active : ''
              }`}
              onClick={() => setSortMode('talent')}
              type="button"
              title={t('GAME_LOBBY.TALENT_SORT')}
            >
              {t('GAME_LOBBY.TALENT')}
            </button>
            <button
              className={`${styles.sortButton} ${
                sortMode === 'type' ? styles.active : ''
              }`}
              onClick={() => setSortMode('type')}
              type="button"
              title={t('GAME_LOBBY.TYPE_SORT')}
            >
              {t('GAME_LOBBY.TYPE')}
            </button>
            <button
              className={`${styles.sortButton} ${
                sortMode === 'subtype' ? styles.active : ''
              }`}
              onClick={() => setSortMode('subtype')}
              type="button"
              title={t('GAME_LOBBY.SUBTYPE_SORT')}
            >
              {t('GAME_LOBBY.SUBTYPE')}
            </button>
            <button
              className={`${styles.sortButton} ${
                sortMode === 'cost' ? styles.active : ''
              }`}
              onClick={() => setSortMode('cost')}
              type="button"
              title={t('GAME_LOBBY.COST_SORT')}
            >
              {t('GAME_LOBBY.COST')}
            </button>
          </>
        )}
      </div>

      <div className={styles.container}>
        {groupedCards ? (
          // Grouped view
          <>
            {Array.from(groupedCards.groups as Map<number | string, string[]>)
              .sort(([keyA], [keyB]) => {
                if (groupedCards.type !== 'numeric') {
                  return (keyA as string).localeCompare(keyB as string);
                }
                // For power and block, sort descending (higher first)
                if (sortMode === 'power' || sortMode === 'blockValue') {
                  return (keyB as number) - (keyA as number);
                }
                // For pitch, sort ascending
                return (keyA as number) - (keyB as number);
              })
              .map(([key, cards]: [number | string, string[]]) => {
                const selectedCount = cards.filter((card) =>
                  values.deck.includes(card)
                ).length;
                return (
                  <div key={`${sortMode}-${key}`} className={styles.pitchGroup}>
                    <div className={styles.pitchHeader}>
                      {`${groupedCards.headerPrefix} ${key}`}
                      <span className={styles.cardCount}>
                        ({selectedCount}/{cards.length})
                      </span>
                    </div>
                    <div className={styles.cardsGroup}>
                      {cards.map((card: string) => (
                        <div key={card} className={styles.deckCardContainer}>
                          <DeckCardCheckbox
                            card={card}
                            imageSrc={getImageSrc(card.split('-')[0])}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            {groupedCards.noValueCards.length > 0 && (
              <div className={styles.pitchGroup}>
                <div className={styles.pitchHeader}>
                  {sortMode === 'subtype'
                    ? t('GAME_LOBBY.NO_SUBTYPE')
                    : t('GAME_LOBBY.NO_VARIABLE', {
                        variable: groupedCards.headerPrefix
                      })}
                  <span className={styles.cardCount}>
                    (
                    {
                      groupedCards.noValueCards.filter((card) =>
                        values.deck.includes(card)
                      ).length
                    }
                    /{groupedCards.noValueCards.length})
                  </span>
                </div>
                <div className={styles.cardsGroup}>
                  {groupedCards.noValueCards.map((card: string) => (
                    <div key={card} className={styles.deckCardContainer}>
                      <DeckCardCheckbox
                        card={card}
                        imageSrc={getImageSrc(card.split('-')[0])}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // Flat view
          <>
            {sortedDeck.map((card: string) => {
              return (
                <div key={card} className={styles.deckCardContainer}>
                  <DeckCardCheckbox
                    card={card}
                    imageSrc={getImageSrc(card.split('-')[0])}
                  />
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
