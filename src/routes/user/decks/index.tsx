import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { RiArrowDownSLine, RiEdit2Line, RiDeleteBin5Line } from 'react-icons/ri';
import { usePageTitle } from 'hooks/usePageTitle';
import useSupporterStatus from 'hooks/useSupporterStatus';
import {
  useGetFavoriteDecksQuery,
  useGetCosmeticsQuery,
  useLazyGetDeckCardsQuery,
  useSaveDeckCosmeticsMutation,
  useDeleteDeckMutation,
  useAddFavoriteDeckMutation,
  useUpdateFavoriteDeckMutation
} from 'features/api/apiSlice';
import { FavoriteDeck } from 'interface/API/GetFavoriteDecks.php';
import { CardBack as CosmeticOption } from 'interface/API/GetCosmeticsResponse.php';
import { DeckCardAltArtOptions } from 'interface/API/GetDeckCards.php';
import { DeleteDeckAPIResponse } from 'interface/API/DeleteDeckAPI.php';
import { AddFavoriteDeckRequest } from 'interface/API/AddFavoriteDeck.php';
import { UpdateFavoriteDeckRequest } from 'interface/API/UpdateFavoriteDeck.php';
import { PLAYMATS, PLAYMAT_DISPLAY_NAMES, CARD_BACK } from 'features/options/cardBacks';
import {
  CARD_IMAGES_PATH,
  CARD_SQUARES_PATH,
  DEFAULT_LANGUAGE,
  getCollectionCardImagePath
} from 'utils';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { getReadableFormatName } from 'utils/formatUtils';
import { HEROES_OF_RATHE } from 'routes/index/components/filter/constants';
import styles from './decks.module.css';

interface DeckEditState {
  cardBackId: string;
  playmatId: string;
  altArts: Record<string, string>;
}

const toEditState = (deck: FavoriteDeck): DeckEditState => ({
  cardBackId: deck.cardBack || '0',
  playmatId: deck.playmat || '0',
  altArts: {}
});

const getAllAltArtSelection = (
  cards: DeckCardAltArtOptions[]
): Record<string, string> => {
  const altArts: Record<string, string> = {};
  cards.forEach((card) => {
    if (card.altArts.length > 0) {
      altArts[card.cardId] = card.altArts[0];
    }
  });
  return altArts;
};

const getReadableCardName = (cardId: string) =>
  cardId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getPlaymatImagePath = (playmatId: string) =>
  `/playmats/${PLAYMATS[playmatId]}.webp`;

const getPlaymatDisplayName = (playmatId: string) =>
  PLAYMAT_DISPLAY_NAMES[playmatId] || PLAYMATS[playmatId] || playmatId;

// Full-card hover preview. Cards are portrait (~1.4 aspect); keep the preview
// small enough to sit beside the cursor without overflowing typical viewports.
const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH * 1.396);

interface HoverPreviewState {
  cardNumber: string;
  x: number;
  y: number;
}

const CardHoverPreview = ({ preview }: { preview: HoverPreviewState }) => {
  const offset = 24;
  const flipToLeft =
    preview.x + offset + PREVIEW_WIDTH > window.innerWidth;
  const left = flipToLeft ? preview.x - offset - PREVIEW_WIDTH : preview.x + offset;
  const top = Math.max(
    8,
    Math.min(preview.y - PREVIEW_HEIGHT / 2, window.innerHeight - PREVIEW_HEIGHT - 8)
  );

  return createPortal(
    <div className={styles.hoverPreview} style={{ left: `${left}px`, top: `${top}px` }}>
      <img
        src={getCollectionCardImagePath({
          path: CARD_IMAGES_PATH,
          locale: DEFAULT_LANGUAGE,
          cardNumber: preview.cardNumber
        })}
        alt=""
        draggable={false}
        className={styles.hoverPreviewImg}
      />
    </div>,
    document.body
  );
};

export const DecksPage = () => {
  usePageTitle('My Decks');
  const [searchParams] = useSearchParams();
  const focusDeck = searchParams.get('focus');

  const { isSupporter } = useSupporterStatus();
  const {
    data: decksData,
    isLoading: decksLoading,
    refetch: refetchDecks
  } = useGetFavoriteDecksQuery(undefined);
  const { data: cosmeticsData } = useGetCosmeticsQuery(undefined);
  const [fetchDeckCards] = useLazyGetDeckCardsQuery();
  const [saveDeckCosmetics] = useSaveDeckCosmeticsMutation();
  const [deleteDeck] = useDeleteDeckMutation();
  const [addFavoriteDeck] = useAddFavoriteDeckMutation();
  const [updateFavoriteDeck] = useUpdateFavoriteDeckMutation();

  const [expandedDeck, setExpandedDeck] = useState<string | null>(
    focusDeck ? decodeURIComponent(focusDeck) : null
  );
  const [editState, setEditState] = useState<Record<string, DeckEditState>>({});
  const [deckCards, setDeckCards] = useState<Record<string, DeckCardAltArtOptions[]>>({});
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [newDeckUrl, setNewDeckUrl] = useState('');
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [selectedHeroByDeck, setSelectedHeroByDeck] = useState<
    Record<string, string>
  >({});
  const [updatingDeckLink, setUpdatingDeckLink] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState<HoverPreviewState | null>(
    null
  );

  const showPreview = (cardNumber: string, e: React.MouseEvent) =>
    setHoverPreview({ cardNumber, x: e.clientX, y: e.clientY });
  const movePreview = (e: React.MouseEvent) =>
    setHoverPreview((prev) =>
      prev ? { ...prev, x: e.clientX, y: e.clientY } : prev
    );
  const hidePreview = () => setHoverPreview(null);

  const decks = decksData?.favoriteDecks ?? [];

  useEffect(() => {
    if (!focusDeck) return;
    setExpandedDeck(decodeURIComponent(focusDeck));
  }, [focusDeck]);

  const cardBacks: CosmeticOption[] = cosmeticsData?.cardBacks ?? [];
  const playmats: CosmeticOption[] = cosmeticsData?.playmats ?? [];

  const ensureEditState = (deck: FavoriteDeck) => {
    if (!editState[deck.link]) {
      setEditState((prev) => ({ ...prev, [deck.link]: toEditState(deck) }));
    }
  };

  const loadDeckCards = async (deck: FavoriteDeck) => {
    if (deckCards[deck.link] || loadingCards[deck.link]) return;
    setLoadingCards((prev) => ({ ...prev, [deck.link]: true }));
    try {
      const result = await fetchDeckCards({ decklink: deck.link }).unwrap();
      setDeckCards((prev) => ({ ...prev, [deck.link]: result.cards }));

      const savedAltArts: Record<string, string> = {};
      result.cards.forEach((card) => {
        if (card.selectedAltPath) savedAltArts[card.cardId] = card.selectedAltPath;
      });

      setEditState((prev) => {
        const current = prev[deck.link] ?? toEditState(deck);
        if (Object.keys(current.altArts).length > 0) return prev;
        // Prefer whatever was actually saved for this deck. If the deck has
        // never been customized, default supporters to their unlocked alt
        // arts instead of showing base art.
        const nextAltArts =
          Object.keys(savedAltArts).length > 0
            ? savedAltArts
            : !deck.altArtsCustomized && isSupporter
              ? getAllAltArtSelection(result.cards)
              : {};
        return { ...prev, [deck.link]: { ...current, altArts: nextAltArts } };
      });
    } catch (err) {
      // Non-fatal: just means alt art picker for this deck stays empty.
    } finally {
      setLoadingCards((prev) => ({ ...prev, [deck.link]: false }));
    }
  };

  const handleToggleDeck = (deck: FavoriteDeck) => {
    ensureEditState(deck);
    const isOpening = expandedDeck !== deck.link;
    setExpandedDeck(isOpening ? deck.link : null);
    if (isOpening) loadDeckCards(deck);
  };

  const handlePlaymatSelect = (deck: FavoriteDeck, playmatId: string) => {
    ensureEditState(deck);
    setEditState((prev) => ({
      ...prev,
      [deck.link]: { ...(prev[deck.link] ?? toEditState(deck)), playmatId }
    }));
  };

  const handleCardBackSelect = (deck: FavoriteDeck, cardBackId: string) => {
    ensureEditState(deck);
    setEditState((prev) => ({
      ...prev,
      [deck.link]: { ...(prev[deck.link] ?? toEditState(deck)), cardBackId }
    }));
  };

  const handleAltArtSelect = (deck: FavoriteDeck, cardId: string, altPath: string) => {
    ensureEditState(deck);
    setEditState((prev) => {
      const current = prev[deck.link] ?? toEditState(deck);
      const nextAltArts = { ...current.altArts };
      if (nextAltArts[cardId] === altPath) {
        delete nextAltArts[cardId];
      } else {
        nextAltArts[cardId] = altPath;
      }
      return { ...prev, [deck.link]: { ...current, altArts: nextAltArts } };
    });
  };

  const handleAltArtClear = (deck: FavoriteDeck, cardId: string) => {
    ensureEditState(deck);
    setEditState((prev) => {
      const current = prev[deck.link] ?? toEditState(deck);
      const nextAltArts = { ...current.altArts };
      delete nextAltArts[cardId];
      return { ...prev, [deck.link]: { ...current, altArts: nextAltArts } };
    });
  };

  const handleSetAllDefaultArt = (deck: FavoriteDeck) => {
    ensureEditState(deck);
    setEditState((prev) => {
      const current = prev[deck.link] ?? toEditState(deck);
      return { ...prev, [deck.link]: { ...current, altArts: {} } };
    });
  };

  const handleSetAllAltArt = (deck: FavoriteDeck) => {
    ensureEditState(deck);
    const cards = deckCards[deck.link] ?? [];
    setEditState((prev) => {
      const current = prev[deck.link] ?? toEditState(deck);
      return {
        ...prev,
        [deck.link]: { ...current, altArts: getAllAltArtSelection(cards) }
      };
    });
  };

  const handleSave = async (deck: FavoriteDeck) => {
    const state = editState[deck.link] ?? toEditState(deck);
    setSaving((prev) => ({ ...prev, [deck.link]: true }));
    try {
      await saveDeckCosmetics({
        decklink: deck.link,
        cardBackId: state.cardBackId,
        playmatId: state.playmatId,
        altArts: Object.entries(state.altArts).map(([cardId, altPath]) => ({
          cardId,
          altPath
        }))
      }).unwrap();
      toast.success('Deck customization saved!', { position: 'top-center' });
      refetchDecks();
    } catch (err: any) {
      const message =
        err?.data?.message ?? 'Failed to save deck customization. Please try again.';
      toast.error(message, { position: 'top-center' });
    } finally {
      setSaving((prev) => ({ ...prev, [deck.link]: false }));
    }
  };

  const handleAddDeck = async () => {
    if (!newDeckUrl.trim()) {
      toast.error('Please enter a deck URL', { position: 'top-center' });
      return;
    }

    setIsAddingDeck(true);
    try {
      const deckPayload: AddFavoriteDeckRequest = { fabdb: newDeckUrl };
      const addDeckPromise = addFavoriteDeck(deckPayload).unwrap();
      toast.promise(
        addDeckPromise,
        {
          loading: 'Adding deck to favorites...',
          success: () => 'Deck added to favorites successfully!',
          error: (err) =>
            `Error adding deck: ${
              err?.message ||
              err?.error ||
              err?.toString() ||
              'Invalid deck URL or deck not accessible'
            }`
        },
        { style: { minWidth: '250px' }, position: 'top-center' }
      );
      await addDeckPromise;
      setNewDeckUrl('');
    } catch (err) {
      // Non-fatal: toast.promise above already surfaced the error to the user.
    } finally {
      setIsAddingDeck(false);
      refetchDecks();
    }
  };

  const handleEditDeck = (deckLink: string) => {
    window.open(deckLink, '_blank');
  };

  const handleHeroChange = async (deckLink: string, newHeroValue: string) => {
    setUpdatingDeckLink(deckLink);
    try {
      const updatePayload: UpdateFavoriteDeckRequest = {
        decklink: deckLink,
        heroID: newHeroValue
      };
      const updatePromise = updateFavoriteDeck(updatePayload).unwrap();
      toast.promise(
        updatePromise,
        {
          loading: 'Updating hero...',
          success: () => {
            setSelectedHeroByDeck((prev) => ({ ...prev, [deckLink]: newHeroValue }));
            return 'Hero updated successfully!';
          },
          error: (err) =>
            `Error updating hero: ${
              err?.message || err?.error || err?.toString() || 'Unknown error'
            }`
        },
        { style: { minWidth: '250px' }, position: 'top-center' }
      );
      await updatePromise;
      refetchDecks();
    } catch (err) {
      // Non-fatal: toast.promise above already surfaced the error to the user.
    } finally {
      setUpdatingDeckLink(null);
    }
  };

  const handleDeleteDeckMessage = (resp: DeleteDeckAPIResponse): string => {
    if (resp.message === 'Deck deleted successfully.') {
      return 'The deck has been removed from your favorites list. It is still available to view on the deckbuilding site.';
    }
    return 'There has been a problem deleting your deck, please try again.';
  };

  const handleDeleteDeck = async (deckLink: string) => {
    try {
      const deleteDeckPromise = deleteDeck({ deckLink }).unwrap();
      toast.promise(
        deleteDeckPromise,
        {
          loading: 'Deleting deck...',
          success: (data) => handleDeleteDeckMessage(data),
          error: (err) => `There has been an error, please try again. Error: ${err.toString()}`
        },
        { style: { minWidth: '250px' }, position: 'top-center' }
      );
      await deleteDeckPromise;
    } catch (err) {
      // Non-fatal: toast.promise above already surfaced the error to the user.
    } finally {
      refetchDecks();
    }
  };

  const showUpsell = !isSupporter;

  return (
    <div className={styles.wideContainer}>
      {hoverPreview && <CardHoverPreview preview={hoverPreview} />}
      <h1 className={styles.title}>My Decks</h1>
      <p className={styles.intro}>
        Assign a playmat, card back, and alt arts to each of your favorited decks.
      </p>

      {showUpsell && (
        <div className={styles.upsellBanner}>
          Card backs, playmats, and alt arts beyond the defaults are a supporter
          perk.{' '}
          <a href={TALISHAR_METAFY_URL} target="_blank" rel="noopener noreferrer">
            Support Talishar on Metafy
          </a>{' '}
          to unlock more.
        </div>
      )}

      <div className={styles.addDeckSection}>
        <p>
          Paste a deck link from{' '}
          <a href="https://FaBrary.net" target="_blank" rel="noopener noreferrer">
            FaBrary.net
          </a>{' '}
          to add it to your favorites.
        </p>
        <div className={styles.addDeckContainer}>
          <input
            type="text"
            placeholder="Paste deck URL here..."
            value={newDeckUrl}
            onChange={(e) => setNewDeckUrl(e.target.value)}
            disabled={isAddingDeck}
            className={styles.addDeckInput}
          />
          <button
            onClick={handleAddDeck}
            disabled={isAddingDeck || !newDeckUrl.trim()}
            className={styles.addDeckButton}
          >
            {isAddingDeck ? 'Adding...' : 'Add Deck'}
          </button>
        </div>
      </div>

      {decksLoading && <p>Loading your decks...</p>}
      {!decksLoading && decks.length === 0 && (
        <p className={styles.emptyState}>
          You haven't favorited any decks yet. Add one above.
        </p>
      )}

      {decks.map((deck) => {
        const isExpanded = expandedDeck === deck.link;
        const state = editState[deck.link] ?? toEditState(deck);
        const cards = deckCards[deck.link] ?? [];
        const isLoadingCards = !!loadingCards[deck.link];
        const isSaving = !!saving[deck.link];

        return (
          <div className={styles.deckCard} key={deck.key}>
            <button
              type="button"
              className={styles.deckCardHeader}
              onClick={() => handleToggleDeck(deck)}
            >
              {!!deck.hero && (
                <img
                  src={generateCroppedImageUrl(deck.hero)}
                  className={styles.deckHeroImage}
                  alt={deck.hero}
                />
              )}
              <div className={styles.deckMeta}>
                <div className={styles.deckName}>{deck.name}</div>
                <div className={styles.deckSub}>
                  {getReadableFormatName(deck.format || '')}
                </div>
              </div>
              <RiArrowDownSLine
                fontSize={'1.4em'}
                className={`${styles.expandIcon} ${
                  isExpanded ? styles.expandIconOpen : ''
                }`}
              />
            </button>

            {isExpanded && (
              <div className={styles.deckPanel}>
                <div className={styles.deckDetailsRowSticky}>
                  <select
                    value={selectedHeroByDeck[deck.link] || deck.hero || ''}
                    onChange={(e) => handleHeroChange(deck.link, e.target.value)}
                    disabled={updatingDeckLink === deck.link}
                    className={styles.heroSelect}
                  >
                    <option value="">-- Select Hero --</option>
                    {[...HEROES_OF_RATHE]
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((hero) => (
                        <option key={hero.value} value={hero.value}>
                          {hero.label}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    className={styles.deckActionButton}
                    onClick={() => handleEditDeck(deck.link)}
                    title="Edit Deck"
                  >
                    <RiEdit2Line fontSize={'1.3em'} /> Edit
                  </button>
                  <button
                    type="button"
                    className={styles.deckActionButton}
                    onClick={() => handleDeleteDeck(deck.link)}
                    title="Delete Deck"
                  >
                    <RiDeleteBin5Line fontSize={'1.3em'} /> Delete
                  </button>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={() => handleSave(deck)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  {(deck.cardBack !== state.cardBackId ||
                    deck.playmat !== state.playmatId) && (
                    <span className={styles.savedHint}>Unsaved changes</span>
                  )}
                </div>

                <label className={styles.pickerLabel}>
                  <strong>Playmat</strong>
                </label>
                <div className={styles.thumbGrid}>
                  {playmats.map((pm) => {
                    const id = String(pm.id);
                    return (
                      <div
                        key={`playmat-${id}`}
                        className={styles.playmatThumbWrapper}
                        onClick={() => handlePlaymatSelect(deck, id)}
                        title={getPlaymatDisplayName(id)}
                      >
                        <img
                          src={getPlaymatImagePath(id)}
                          alt={getPlaymatDisplayName(id)}
                          draggable={false}
                          loading="lazy"
                          className={`${styles.playmatThumb} ${
                            state.playmatId === id ? styles.thumbSelected : ''
                          }`}
                        />
                        <span className={styles.thumbLabel}>
                          {getPlaymatDisplayName(id)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <label className={styles.pickerLabel}>
                  <strong>Card Back</strong>
                </label>
                <div className={styles.thumbGrid}>
                  {cardBacks.map((cb) => {
                    const id = String(cb.id);
                    return (
                      <div
                        key={`cardback-${id}`}
                        className={styles.cardBackThumbWrapper}
                        onClick={() => handleCardBackSelect(deck, id)}
                        title={cb.name}
                      >
                        <img
                          src={getCollectionCardImagePath({
                            path: CARD_SQUARES_PATH,
                            locale: DEFAULT_LANGUAGE,
                            cardNumber: CARD_BACK[id]
                          })}
                          draggable={false}
                          loading="lazy"
                          alt={cb.name}
                          onMouseEnter={(e) => showPreview(CARD_BACK[id], e)}
                          onMouseMove={movePreview}
                          onMouseLeave={hidePreview}
                          className={`${styles.cardBackThumb} ${
                            state.cardBackId === id ? styles.thumbSelected : ''
                          }`}
                        />
                        <span className={styles.thumbLabel}>{cb.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.pickerLabelRow}>
                  <strong>Alt Art</strong>
                  <div className={styles.altArtToggleButtons}>
                    <button
                      type="button"
                      className={styles.altArtToggleButton}
                      onClick={() => handleSetAllDefaultArt(deck)}
                    >
                      Select All Default Art
                    </button>
                    <button
                      type="button"
                      className={styles.altArtToggleButton}
                      onClick={() => handleSetAllAltArt(deck)}
                      disabled={cards.length === 0}
                    >
                      Select All Alt Art
                    </button>
                  </div>
                </div>
                {isLoadingCards && <p className={styles.pickerHint}>Checking your deck for unlocked alt arts...</p>}
                {!isLoadingCards && cards.length === 0 && (
                  <p className={styles.pickerHint}>
                    Feature available to paid supporters of Talishar. Support Talishar on{' '}
                    <a href={TALISHAR_METAFY_URL} target="_blank" rel="noopener noreferrer">
                      Metafy
                    </a>{' '}
                    to unlock all alt arts and customize your decks.
                  </p>
                )}
                <div className={styles.altArtGrid}>
                  {cards.map((card) => {
                    const isBaseSelected = !state.altArts[card.cardId];
                    return (
                      <div className={styles.altArtRow} key={card.cardId}>
                        <span className={styles.altArtCardName}>
                          {getReadableCardName(card.cardId)}
                        </span>
                        <div className={styles.thumbGrid}>
                          {card.baseCardNumber && (
                            <div
                              className={styles.altArtThumbWrapper}
                              onClick={() => handleAltArtClear(deck, card.cardId)}
                              title={isBaseSelected ? 'Selected' : 'Use the base art'}
                            >
                              <img
                                src={getCollectionCardImagePath({
                                  path: CARD_SQUARES_PATH,
                                  locale: DEFAULT_LANGUAGE,
                                  cardNumber: card.baseCardNumber
                                })}
                                draggable={false}
                                loading="lazy"
                                alt="Default"
                                onMouseEnter={(e) =>
                                  showPreview(card.baseCardNumber, e)
                                }
                                onMouseMove={movePreview}
                                onMouseLeave={hidePreview}
                                className={`${styles.altArtThumb} ${
                                  isBaseSelected ? styles.thumbSelected : ''
                                }`}
                              />
                            </div>
                          )}
                          {card.altArts.map((altPath) => (
                            <div
                              key={altPath}
                              className={styles.altArtThumbWrapper}
                              onClick={() => handleAltArtSelect(deck, card.cardId, altPath)}
                              title={
                                state.altArts[card.cardId] === altPath
                                  ? 'Selected — click to use base art'
                                  : 'Use this alt art'
                              }
                            >
                              <img
                                src={getCollectionCardImagePath({
                                  path: CARD_SQUARES_PATH,
                                  locale: DEFAULT_LANGUAGE,
                                  cardNumber: altPath
                                })}
                                draggable={false}
                                loading="lazy"
                                alt={altPath}
                                onMouseEnter={(e) => showPreview(altPath, e)}
                                onMouseMove={movePreview}
                                onMouseLeave={hidePreview}
                                className={`${styles.altArtThumb} ${
                                  state.altArts[card.cardId] === altPath
                                    ? styles.thumbSelected
                                    : ''
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DecksPage;
