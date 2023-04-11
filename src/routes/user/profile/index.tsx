import {
  useDeleteDeckMutation,
  useGetFavoriteDecksQuery
} from 'features/api/apiSlice';
import { DeleteDeckAPIResponse } from 'interface/API/DeleteDeckAPI.php';
import { toast } from 'react-hot-toast';
import { GiTrashCan } from 'react-icons/gi';
import styles from './profile.module.css';

export const ProfilePage = () => {
  const { data, isLoading, refetch } = useGetFavoriteDecksQuery(undefined);
  const [deleteDeck] = useDeleteDeckMutation();

  const handleDeleteDeckMessage = (resp: DeleteDeckAPIResponse): string => {
    if (resp.message !== 'Deck deleted successfully.') {
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
    } finally {
      refetch();
    }
  };

  return (
    <div>
      <div className="container">
        <h1>Profile Page</h1>
        <article>
          <h3>Profile:</h3>
          <div>
            <a href="https://legacy.talishar.net/game/ProfilePage.php">
              Connect to Patreon on the legacy client
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
