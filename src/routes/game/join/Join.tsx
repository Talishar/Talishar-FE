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

export interface Deck {
  hero: string;
  weapons: string[];
  head: string[];
  chest: string[];
  arms: string[];
  legs: string[];
  offhand: string[];
  cards: string[];
  headSB: string[];
  chestSB: string[];
  armsSB: string[];
  legsSB: string[];
  offhandSB: string[];
  weaponSB: string[];
  cardsSB: string[];
}

export interface LobbyInfo {
  badges: string[];
  amIActive: boolean;
  nameColor: string;
  displayName: string;
  overlayURL: string;
  deck: Deck;
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
  return (
    <div>
      <div>
        <Formik
          initialValues={{
            deck: [...data.deck.cards],
            weapons: [...data.deck.weapons],
            head: data.deck.head[0],
            chest: data.deck.chest[0],
            arms: data.deck.arms[0],
            legs: data.deck.legs[0]
          }}
          onSubmit={(values) => {
            console.log(values);
          }}
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
              {activeTab === 'equipment' && <Equipment {...data} />}
              {activeTab === 'deck' && <Deck {...data} />}
              {activeTab === 'chat' && <LobbyChat />}
            </div>
            <div className={styles.stickyFooter}>
              <div className={styles.footerContent}>
                <div>Deck 40/40</div>
                {!canSubmit && (
                  <div className={styles.alarm}>
                    <FaExclamationCircle /> Your deck no good
                  </div>
                )}
              </div>
              <div className={styles.buttonHolder}>
                <button
                  disabled={!canSubmit}
                  className={styles.buttonClass}
                  type="submit"
                >
                  Submit deck
                </button>
              </div>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default Join;
