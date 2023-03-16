import { useGetFavoriteDecksQuery } from 'features/api/apiSlice';
import { GiTrashCan } from 'react-icons/gi';
import styles from './profile.module.css';

export const ProfilePage = () => {
  const { data, isLoading } = useGetFavoriteDecksQuery(undefined);

  const handleButtonClick = (deckKey: string) => {
    console.log('clicked this one', deckKey);
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
                      onClick={() => handleButtonClick(deck.key)}
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
