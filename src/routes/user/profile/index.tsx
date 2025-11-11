import {
  useDeleteDeckMutation,
  useDeleteAccountMutation,
  useGetFavoriteDecksQuery,
  useGetUserProfileQuery,
  useCreateGameMutation
} from 'features/api/apiSlice';
import { DeleteDeckAPIResponse } from 'interface/API/DeleteDeckAPI.php';
import { DeleteAccountAPIResponse } from 'interface/API/DeleteAccountAPI.php';
import { CreateGameAPI } from 'interface/API/CreateGame.php';
import { toast } from 'react-hot-toast';
import { RiEdit2Line, RiDeleteBin5Line } from "react-icons/ri";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './profile.module.css';
import { generateCroppedImageUrl } from 'utils/cropImages';
import FriendsList from './FriendsList';
import BlockedUsers from './BlockedUsers';

const CODE = 'code';
const CLIENT_ID =
  'UMs7_V2SPi656fczWY0SDtg9M3RJy-gd4H95h7fd05BUJ2UMnd0IM77dp0ZAtBng';
const REDIRECT_URI = 'https://talishar.net/user/profile/linkpatreon';
const SCOPE = 'identity identity.memberships';
const PATREON_URL = 'https://www.patreon.com/oauth2/authorize?';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationUsername, setConfirmationUsername] = useState('');
  const [newDeckUrl, setNewDeckUrl] = useState('');
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const {
    data: decksData,
    isLoading: deckIsLoading,
    refetch: deckRefetch
  } = useGetFavoriteDecksQuery(undefined);
  const {
    data: profileData,
    isLoading: profileIsLoading,
    refetch: profileRefetch
  } = useGetUserProfileQuery(undefined);
  const [deleteDeck] = useDeleteDeckMutation();
  const [createGame] = useCreateGameMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const handleDeleteDeckMessage = (resp: DeleteDeckAPIResponse): string => {
    if (resp.message === 'Deck deleted successfully.') {
      return 'The deck has been removed from your favorites list. It is still available to view on the deckbuilding site.';
    } else {
      return 'There has been a problem deleting your deck, please try again.';
    }
  };

  const handleDeleteDeck = async (deckLink: string) => {
    console.log('[Deck Deletion] Starting deck deletion for:', deckLink);
    try {
      const deleteDeckPromise = deleteDeck({ deckLink }).unwrap();
      toast.promise(
        deleteDeckPromise,
        {
          loading: 'Deleting deck...',
          success: (data) => {
            console.log('[Deck Deletion] Success response:', data);
            return handleDeleteDeckMessage(data);
          },
          error: (err) => {
            console.error('[Deck Deletion] Error response:', {
              errorObject: err,
              message: err?.message,
              error: err?.error,
              status: err?.status,
              statusCode: err?.statusCode,
              data: err?.data,
              toString: err?.toString()
            });
            return `There has been an error, please try again. Error: ${err.toString()}`;
          }
        },
        {
          style: {
            minWidth: '250px'
          },
          position: 'top-center'
        }
      );
      const resp = await deleteDeckPromise;
      console.log('[Deck Deletion] Full API response:', resp);
    } catch (err) {
      console.error('[Deck Deletion] Caught exception:', {
        errorObject: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        toString: err?.toString(),
        type: typeof err
      });
    } finally {
      console.log('[Deck Deletion] Refetching decks list');
      deckRefetch();
    }
  };

  const handleEditDeck = (deckLink: string) => {
    window.location.href = deckLink;
  };

  const handleAddDeck = async () => {
    if (!newDeckUrl.trim()) {
      toast.error('Please enter a deck URL', {
        position: 'top-center'
      });
      return;
    }

    setIsAddingDeck(true);
    console.log('[Deck Addition] Starting deck addition with URL:', newDeckUrl);
    try {
      // Reuse the existing CreateGame flow to save the deck to favorites
      const gamePayload: CreateGameAPI = {
        deck: '',
        fabdb: newDeckUrl,
        deckTestMode: false,
        format: 'cc',
        visibility: 'private',
        decksToTry: '',
        favoriteDeck: true, // This is the key - flag the deck to be saved
        favoriteDecks: '',
        gameDescription: ''
      };

      console.log('[Deck Addition] Game payload created:', gamePayload);

      const addDeckPromise = createGame(gamePayload).unwrap();
      toast.promise(
        addDeckPromise,
        {
          loading: 'Adding deck to favorites...',
          success: (data) => {
            console.log('[Deck Addition] Success response:', data);
            return 'Deck added to favorites successfully!';
          },
          error: (err) => {
            console.error('[Deck Addition] Error response:', {
              errorObject: err,
              message: err?.message,
              error: err?.error,
              status: err?.status,
              statusCode: err?.statusCode,
              originalStatus: err?.originalStatus,
              data: err?.data,
              toString: err?.toString()
            });
            return `Error adding deck: ${err?.message || err?.error || err?.toString() || 'Invalid deck URL or deck not accessible'}`;
          }
        },
        {
          style: {
            minWidth: '250px'
          },
          position: 'top-center'
        }
      );
      const result = await addDeckPromise;
      console.log('[Deck Addition] Full API response:', result);
      setNewDeckUrl('');
    } catch (err) {
      console.error('[Deck Addition] Caught exception:', {
        errorObject: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace',
        toString: err?.toString(),
        type: typeof err
      });
    } finally {
      console.log('[Deck Addition] Refetching decks list');
      setIsAddingDeck(false);
      deckRefetch();
    }
  };

  const handleDeleteAccountConfirm = async () => {
    if (!confirmationUsername) {
      toast.error('Please enter your username to confirm deletion', {
        position: 'top-center'
      });
      return;
    }

    try {
      const response = await deleteAccount({
        confirmationUsername
      }).unwrap();

      if (!response.success) {
        toast.error(`Error: ${response.message}`, {
          style: {
            minWidth: '250px'
          },
          position: 'top-center'
        });
        return;
      }

      toast.success(response.message, {
        style: {
          minWidth: '250px'
        },
        position: 'top-center'
      });

      // Force a hard refresh to clear all app state after account deletion
      setTimeout(() => {
        window.location.href = '/user/login';
      }, 1000);
    } catch (err) {
      console.warn(err);
      toast.error(`Error deleting account: ${err?.toString() || 'Unknown error'}`, {
        style: {
          minWidth: '250px'
        },
        position: 'top-center'
      });
    }
  };

  const PatreonOAuthParam = new URLSearchParams();
  PatreonOAuthParam.append('response_type', CODE);
  PatreonOAuthParam.append('client_id', CLIENT_ID);
  PatreonOAuthParam.append('redirect_uri', REDIRECT_URI);
  PatreonOAuthParam.append('scope', SCOPE);

  // console.log(
  //   'If you want to test the patreon connection go to this URL:',
  //   PATREON_URL + PatreonOAuthParam.toString()
  // );

  return (
    <div>
      <div className={styles.wideContainer}>
        <h1 className={styles.title}>Profile Page</h1>
        <div className={styles.twoColumnLayout}>
          <div className={styles.leftColumn}>
            <article className={styles.articleTitle}>
              <h5>Username: {profileData?.userName}</h5>
              <div>
                {profileIsLoading && <p>Loading Profile...</p>}
                {!profileIsLoading && profileData?.isPatreonLinked && (
                  <p>
                    You have linked your patreon. <br />
                    <a href={PATREON_URL + PatreonOAuthParam.toString()}>
                      Refresh your patreon connection
                    </a>{' '}
                    (in case you have new patreons and can't access their perks yet)
                  </p>
                )}
                {!profileIsLoading && !profileData?.isPatreonLinked && (
                  <p>
                    <a href={PATREON_URL + PatreonOAuthParam.toString()}>
                      Connect to Patreon
                    </a>
                  </p>
                )}
              </div>
              <FriendsList className={styles.friendsSection} />
              <BlockedUsers className={styles.friendsSection} />
              <h3 className={styles.title}>Delete Account</h3>
              <p style={{ color: '#fa3737ff', marginBottom: '1em' }}>
                <strong>Warning:</strong> This action is permanent and cannot be undone. All your account data will be deleted.
              </p>
              <button
                className={styles.deleteAccountButton}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Account
              </button>

              {showDeleteModal && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modal}>
                    <h4>Delete Account Confirmation</h4>
                    <p>
                      Are you sure you want to delete your account? This action is <strong>permanent</strong> and cannot be undone.
                    </p>
                    <p>
                      Please type your username <strong>{profileData?.userName}</strong> to confirm:
                    </p>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={confirmationUsername}
                      onChange={(e) => setConfirmationUsername(e.target.value)}
                      className={styles.modalInput}
                    />
                    <div className={styles.modalButtons}>
                      <button
                        className={styles.cancelButton}
                        onClick={() => {
                          setShowDeleteModal(false);
                          setConfirmationUsername('');
                        }}
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.confirmDeleteButton}
                        onClick={handleDeleteAccountConfirm}
                        disabled={isDeleting || confirmationUsername !== profileData?.userName}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>
          <div className={styles.rightColumn}>
            <article className={styles.articleTitle}>
              <h3 className={styles.title}>Your Decks</h3>
              {/* Add Deck Section */}
              <div className={styles.addDeckSection}>
                <p>
                  Paste a deck link from <a href="https://FaBrary.net" target="_blank" rel="noopener noreferrer">FaBrary.net</a> to add it to your favorites.
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
              <table>
                <thead>
                  <tr>
                    <th scope="col">Hero</th>
                    <th scope="col">Name</th>
                    <th scope="col">Format</th>
                    {/* <th scope="col">Card Back</th>
                <th scope="col">Playmat</th> */}
                    <th scope="col">Edit</th>
                    <th scope="col">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {deckIsLoading && <div>Loading...</div>}
                  {decksData?.favoriteDecks.map((deck, ix) => (
                    <tr key={deck.key}>
                      <th scope="row">
                        {!!deck.hero && (
                          <img
                            src={generateCroppedImageUrl(deck.hero)}
                            className={styles.heroImage}
                          />
                        )}
                      </th>
                      <td>{deck.name}</td>
                      <td>{deck.format ? deck.format.charAt(0).toUpperCase() + deck.format.slice(1) : ""}</td>
                      {/* <td>{deck.cardBack ? deck.cardBack.charAt(0).toUpperCase() + deck.cardBack.slice(1).toLowerCase() : ""}</td>
                  <td>{deck.playmat ? deck.playmat.charAt(0).toUpperCase() + deck.playmat.slice(1).toLowerCase() : ""}</td> */}
                      <td className={styles.editButton}>
                        <button
                          className={styles.button}
                          onClick={() => handleEditDeck(deck.link)}
                        >
                          <RiEdit2Line
                            fontSize={'1.5em'}
                            className={styles.trashcanIcon}
                          />
                        </button>
                      </td>
                      <td className={styles.deleteButton}>
                        <button
                          className={styles.button}
                          onClick={() => handleDeleteDeck(deck.link)}
                        >
                          <RiDeleteBin5Line
                            fontSize={'1.5em'}
                            className={styles.trashcanIcon}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
