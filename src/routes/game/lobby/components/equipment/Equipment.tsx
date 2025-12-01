import { Field, FieldArray, useFormikContext } from 'formik';
import React from 'react';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import {
  DeckResponse,
  GetLobbyInfoResponse,
  Weapon
} from 'interface/API/GetLobbyInfo.php';
import styles from './Equipment.module.css';
import CardPopUp from 'routes/game/components/elements/cardPopUp/CardPopUp';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';

type EquipmentProps = {
  lobbyInfo: GetLobbyInfoResponse;
  weapons: Weapon[];
  weaponSB: Weapon[];
};

const Equipment = ({ lobbyInfo, weapons, weaponSB }: EquipmentProps) => {
  const { values } = useFormikContext<DeckResponse>();
  const { getLanguage } = useLanguageSelector();
  const hands = [...weapons, ...weaponSB];
  const head = [...lobbyInfo.deck.head, ...lobbyInfo.deck.headSB, 'NONE00'];
  const chest = [...lobbyInfo.deck.chest, ...lobbyInfo.deck.chestSB, 'NONE00'];
  const arms = [...lobbyInfo.deck.arms, ...lobbyInfo.deck.armsSB, 'NONE00'];
  const legs = [...lobbyInfo.deck.legs, ...lobbyInfo.deck.legsSB, 'NONE00'];
  const demiHero = [...(lobbyInfo.deck.demiHero ?? [])];
  const modular = [...(lobbyInfo.deck.modular ?? [])];

  const locale = getLanguage();
  const getCardSrc = (cardNumber: any) =>
    getCollectionCardImagePath({ path: CARD_SQUARES_PATH, locale, cardNumber });

  return (
    <div className={styles.container} onContextMenu={(e)=> e.preventDefault()}>
      <div className={styles.eqCategory}>
        <h3>Weapons / Off-Hand</h3>
        <FieldArray
          name="weapons"
          render={(arrayHelpers) => (
            <div className={styles.categoryContainer}>
              {hands.map((weapon, ix) => {
                return (
                  <div key={`deck${ix}`} className={styles.cardContainer}>
                    <label>
                      <input
                        type="checkbox"
                        name="weapons"
                        value={`${weapon}`}
                        checked={values.weapons.some(
                          (value: Weapon) => value.id === weapon.id
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            arrayHelpers.push(weapon);
                          } else {
                            const idx = values.weapons.findIndex(
                              (value: Weapon) => value.id === weapon.id
                            );
                            arrayHelpers.remove(idx);
                          }
                        }}
                      />
                      <CardPopUp cardNumber={weapon.id.split("-")[0]}>
                        <CardImage
                          src={getCardSrc(weapon.id.split("-")[0])}
                          draggable={false}
                          className={styles.card}
                        />
                      </CardPopUp>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        />
      </div>
      <div className={styles.eqCategory}>
        <h3>Head</h3>
        <div className={styles.categoryContainer}>
          {head.map((card, ix) => {
            return (
              <div key={`deck${ix}`} className={styles.cardContainer}>
                <label>
                  <Field type="radio" name="head" value={`${card}`} />
                  <CardPopUp cardNumber={card}>
                    <CardImage
                      src={getCardSrc(card)}
                      draggable={false}
                      className={styles.card}
                    />
                  </CardPopUp>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.eqCategory}>
        <h3>Chest</h3>
        <div className={styles.categoryContainer}>
          {chest.map((card, ix) => {
            return (
              <div key={`deck${ix}`} className={styles.cardContainer}>
                <label className={styles.selection}>
                  <Field type="radio" name="chest" value={`${card}`} />
                  <CardPopUp cardNumber={card}>
                    <CardImage
                      src={getCardSrc(card)}
                      draggable={false}
                      className={styles.card}
                    />
                  </CardPopUp>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.eqCategory}>
        <h3>Arms</h3>
        <div className={styles.categoryContainer}>
          {arms.map((card, ix) => {
            return (
              <div key={`deck${ix}`} className={styles.cardContainer}>
                <label className={styles.selection}>
                  <Field type="radio" name="arms" value={`${card}`} />
                  <CardPopUp cardNumber={card}>
                    <CardImage
                      src={getCardSrc(card)}
                      draggable={false}
                      className={styles.card}
                    />
                  </CardPopUp>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.eqCategory}>
        <h3>Legs</h3>
        <div className={styles.categoryContainer}>
          {legs.map((card, ix) => {
            return (
              <div key={`deck${ix}`} className={styles.cardContainer}>
                <label>
                  <Field type="radio" name="legs" value={`${card}`} />
                  <CardPopUp cardNumber={card}>
                    <CardImage
                      src={getCardSrc(card)}
                      draggable={false}
                      className={styles.card}
                    />
                  </CardPopUp>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      {demiHero.length > 0 && (
        <div className={styles.eqCategory}>
          <h3>Demi-Hero</h3>
          <div className={styles.categoryContainer}>
            {demiHero.map((card, ix) => {
              return (
                <div key={`deck${ix}`} className={styles.cardContainer}>
                  <label>
                    <CardPopUp cardNumber={card}>
                      <CardImage
                        src={getCardSrc(card)}
                        draggable={false}
                        className={styles.card}
                      />
                    </CardPopUp>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {modular.length > 0 && (
        <div className={styles.eqCategory}>
          <h3>Modular</h3>
          <div className={styles.categoryContainer}>
            {modular.map((card, ix) => {
              return (
                <div key={`mod${ix}`} className={styles.cardContainer}>
                  <label>
                    <CardPopUp cardNumber={card}>
                      <CardImage
                        src={getCardSrc(card)}
                        draggable={false}
                        className={styles.card}
                      />
                    </CardPopUp>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className={styles.spacerDiv}></div>
    </div>
  );
};

export default Equipment;
