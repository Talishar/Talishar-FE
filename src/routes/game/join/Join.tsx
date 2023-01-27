import React from 'react';
import Deck from './components/deck/Deck';
import LobbyChat from './components/lobbyChat/LobbyChat';
import testData from './mockdata.json';
import styles from './Join.module.css';
import Equipment from './components/equipment/Equipment';
import { useState } from 'react';
import classNames from 'classnames';
import { FaExclamationCircle } from 'react-icons/fa';
import { Form, Formik } from 'formik';
import deckValidation from './validation';
import StickyFooter from './components/stickyFooter/StickyFooter';

export interface Deck {
  heroName: string;
  hero: string;
  weapons: Weapon[];
  head: string[];
  chest: string[];
  arms: string[];
  legs: string[];
  offhand: Weapon[];
  cards: string[];
  headSB: string[];
  chestSB: string[];
  armsSB: string[];
  legsSB: string[];
  offhandSB: Weapon[];
  weaponSB: Weapon[];
  cardsSB: string[];
}

export interface Weapon {
  id: string;
  is1H: boolean;
  img?: string;
}

export interface LobbyInfo {
  badges: string[];
  amIActive: boolean;
  nameColor: string;
  displayName: string;
  overlayURL: string;
  deck: Deck;
}

export interface DeckResponse {
  deck: string[];
  weapons: Weapon[];
  head: string;
  chest: string;
  arms: string;
  legs: string;
}

const Join = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  const [unreadChat, setUnreadChat] = useState(true);
  const data = testData as LobbyInfo;

  const opponentHero = 'ARC002';
  const leftPic = `url(/crops/${data.deck.hero}_cropped.png)`;
  const rightPic = `url(/crops/${opponentHero}_cropped.png)`;

  const eqClasses = classNames({ secondary: activeTab !== 'equipment' });
  const deckClasses = classNames({ secondary: activeTab !== 'deck' });
  const chatClasses = classNames({ secondary: activeTab !== 'chat' });
  const canSubmit = true;

  // I'm not sure how I can get formik to understand checkboxes and repeating cards so give them all an index here.
  const deckIndexed = data.deck.cards.map((card, ix) => `${card}-${ix}`);
  const deckSBIndexed = data.deck.cardsSB.map(
    (card, ix) => `${card}-${ix + deckIndexed.length}`
  );
  const weaponsIndexed = [...data.deck.weapons, ...data.deck.offhand].map(
    (card, ix) => {
      return {
        id: `${card.id}-${ix}`,
        is1H: card.is1H,
        img: `${card.id}`
      } as Weapon;
    }
  );
  const weaponsSBIndexed = [
    ...data.deck.weaponSB,
    ...data.deck.offhandSB,
    { id: `none`, is1H: true, img: `none` }
  ].map((card, ix) => {
    return {
      id: `${card.id}-${ix + weaponsIndexed.length}`,
      img: `${card.id}`,
      is1H: card.is1H
    } as Weapon;
  });
  return (
    <div>
      <div>
        <Formik
          initialValues={{
            deck: deckIndexed,
            weapons: weaponsIndexed,
            head: data.deck.head[0],
            chest: data.deck.chest[0],
            arms: data.deck.arms[0],
            legs: data.deck.legs[0]
          }}
          onSubmit={(values) => {
            console.log(values);
          }}
          validationSchema={deckValidation(60)}
        >
          <Form>
            <div className={styles.titleContainer}>
              <div
                className={styles.leftCol}
                style={{ backgroundImage: leftPic }}
              >
                <div className={styles.dimPic}>
                  <h3>{data.displayName}</h3>
                  <h5>{data.deck.hero}</h5>
                </div>
              </div>
              <div
                className={styles.rightCol}
                style={{ backgroundImage: rightPic }}
              >
                <div className={styles.dimPic}>
                  <h3>Player 2</h3>
                  <h5>Dash, Inventor Extraordinaire</h5>
                </div>
              </div>
            </div>
            <nav>
              <ul>
                <li>Get ready!</li>
              </ul>
              <ul>
                <li>
                  <button
                    className={eqClasses}
                    onClick={() => setActiveTab('equipment')}
                    type="button"
                  >
                    Equipment
                  </button>
                </li>
                <li>
                  <button
                    className={deckClasses}
                    onClick={() => setActiveTab('deck')}
                    type="button"
                  >
                    Deck
                  </button>
                </li>
                <li>
                  <button
                    className={chatClasses}
                    onClick={() => setActiveTab('chat')}
                    type="button"
                  >
                    {unreadChat && (
                      <>
                        <FaExclamationCircle />{' '}
                      </>
                    )}
                    Chat
                  </button>
                </li>
              </ul>
            </nav>
            <div className={styles.contentContainer}>
              {activeTab === 'equipment' && (
                <Equipment
                  lobbyInfo={data}
                  weapons={weaponsIndexed}
                  weaponSB={weaponsSBIndexed}
                />
              )}
              {activeTab === 'deck' && (
                <Deck deck={[...deckIndexed, ...deckSBIndexed]} />
              )}
              {activeTab === 'chat' && <LobbyChat />}
            </div>
            <StickyFooter deckSize={60} />
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default Join;
