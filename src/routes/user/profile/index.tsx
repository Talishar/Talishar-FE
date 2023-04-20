import {
  useDeleteDeckMutation,
  useGetFavoriteDecksQuery
} from 'features/api/apiSlice';
import { DeleteDeckAPIResponse } from 'interface/API/DeleteDeckAPI.php';
import { toast } from 'react-hot-toast';
import { GiNotebook, GiTrashCan } from 'react-icons/gi';
import styles from './profile.module.css';

const CODE = 'code';
const CLIENT_ID =
  'UMs7_V2SPi656fczWY0SDtg9M3RJy-gd4H95h7fd05BUJ2UMnd0IM77dp0ZAtBng';
const REDIRECT_URI = 'https://talishar.net/user/profile/linkpatreon';
const SCOPE = 'identity identity.memberships';
const PATREON_URL = 'https://www.patreon.com/oauth2/authorize?';

export const ProfilePage = () => {
  const { data, isLoading, refetch } = useGetFavoriteDecksQuery(undefined);
  const [deleteDeck] = useDeleteDeckMutation();

  const handleDeleteDeckMessage = (resp: DeleteDeckAPIResponse): string => {
    if (resp.message === 'Deck deleted successfully.') {
      return 'The deck has been removed from your favorites list. It is still available to view on the deckbuilding site.';
    } else {
      return 'There has been a problem deleting your deck, please try again.';
    }
  };

  const handleDeleteDeck = async (deckLink: string) => {
    try {
      const deleteDeckPromise = deleteDeck({ deckLink }).unwrap();
      toast.promise(
        deleteDeckPromise,
        {
          loading: 'Deleting deck...',
          success: (data) => handleDeleteDeckMessage(data),
          error: (err) =>
            `There has been an error, please try again. Error: ${err.toString()}`
        },
        {
          style: {
            minWidth: '250px'
          },
          position: 'top-center'
        }
      );
      const resp = await deleteDeckPromise;
    } catch (err) {
      console.warn(err);
    } finally {
      refetch();
    }
  };

  const handleEditDeck = (deckLink: string) => {
    window.location.href = deckLink;
  };

  const PatreonOAuthParam = new URLSearchParams();
  PatreonOAuthParam.append('response_type', CODE);
  PatreonOAuthParam.append('client_id', CLIENT_ID);
  PatreonOAuthParam.append('redirect_uri', REDIRECT_URI);
  PatreonOAuthParam.append('scope', SCOPE);

  return (
    <div>
      <div className="container">
        <h1>Profile Page</h1>
        <article>
          <h3>Profile:</h3>
          <div>
            <a href={PATREON_URL + PatreonOAuthParam.toString()}>
              Connect to Patreon
            </a>
          </div>
          <h3>Your decks:</h3>
          <table>
            <thead>
              <tr>
                <th scope="col">Hero</th>
                <th scope="col">Name</th>
                <th scope="col">Format</th>
                <th scope="col">Card Back</th>
                <th scope="col">Playmat</th>
                <th scope="col">View / Edit</th>
                <th scope="col">Delete</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <div>Loading...</div>}
              {data?.favoriteDecks.map((deck, ix) => (
                <tr key={deck.key}>
                  <th scope="row">
                    {!!deck.hero && (
                      <img
                        src={`/crops/${deck.hero}_cropped.png`}
                        className={styles.heroImage}
                      />
                    )}
                  </th>
                  <td>{deck.name}</td>
                  <td>{deck.format}</td>
                  <td>{deck.cardBack}</td>
                  <td>{deck.playmat}</td>
                  <td className={styles.editButton}>
                    <button
                      className={styles.button}
                      onClick={() => handleEditDeck(deck.link)}
                    >
                      <GiNotebook
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
                      <GiTrashCan
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
  );
};

export default ProfilePage;
