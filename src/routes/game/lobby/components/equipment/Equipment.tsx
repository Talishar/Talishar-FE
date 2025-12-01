import { Field, FieldArray, useFormikContext } from 'formik';
import React from 'react';
import { useAppDispatch } from 'app/Hooks';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import {
  DeckResponse,
  GetLobbyInfoResponse,
  Weapon
} from 'interface/API/GetLobbyInfo.php';
import { clearPopUp } from 'features/game/GameSlice';
import styles from './Equipment.module.css';
import CardPopUp from 'routes/game/components/elements/cardPopUp/CardPopUp';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';

type EquipmentProps = {
  lobbyInfo: GetLobbyInfoResponse;
  weapons: Weapon[];
  weaponSB: Weapon[];
};

type EquipFieldName = 'head' | 'chest' | 'arms' | 'legs';

const EQUIP_FIELDS: EquipFieldName[] = ['head', 'chest', 'arms', 'legs'];

const Equipment = ({ lobbyInfo, weapons, weaponSB }: EquipmentProps) => {
  const { values, setFieldValue } = useFormikContext<DeckResponse>();
  const dispatch = useAppDispatch();
  const { getLanguage } = useLanguageSelector();
  const locale = getLanguage();

  const hands = React.useMemo(
    () => [...weapons, ...weaponSB],
    [weapons, weaponSB]
  );

  const baseEquipment = React.useMemo(
    () => ({
      head: [...lobbyInfo.deck.head, ...lobbyInfo.deck.headSB],
      chest: [...lobbyInfo.deck.chest, ...lobbyInfo.deck.chestSB],
      arms: [...lobbyInfo.deck.arms, ...lobbyInfo.deck.armsSB],
      legs: [...lobbyInfo.deck.legs, ...lobbyInfo.deck.legsSB],
      demi: lobbyInfo.deck.demiHero ?? [],
      modular: lobbyInfo.deck.modular ?? []
    }),
    [lobbyInfo.deck]
  );

  const [assigned, setAssigned] = React.useState<
    Record<EquipFieldName, string[]>
  >({
    head: [],
    chest: [],
    arms: [],
    legs: []
  });

  const [modularState, setModularState] = React.useState<string[]>(
    baseEquipment.modular
  );

  React.useEffect(() => {
    setAssigned({ head: [], chest: [], arms: [], legs: [] });
    setModularState(baseEquipment.modular);
  }, [baseEquipment.modular]);

  // Sync with Formik submit
  React.useEffect(() => {
    setFieldValue('assignedModulars', assigned);
  }, [assigned, setFieldValue]);

  const removeOne = (arr: string[], value: string) => {
    const next = arr.slice();
    const idx = next.indexOf(value);
    if (idx !== -1) next.splice(idx, 1);
    return next;
  };

  const handleModularDragStart = (e: React.DragEvent, card: string) => {
    dispatch(clearPopUp());
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ card, from: 'modular' })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleAssignedDragStart = (
    e: React.DragEvent,
    card: string,
    fromField: EquipFieldName
  ) => {
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ card, from: fromField })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEquipmentDrop = (e: React.DragEvent, field: EquipFieldName) => {
    e.preventDefault();

    let data: { card: string; from?: string };
    try {
      data = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch {
      return;
    }

    const { card, from } = data;

    if (from && EQUIP_FIELDS.includes(from as EquipFieldName)) {
      const fromField = from as EquipFieldName;

      setAssigned((prev) => ({
        ...prev,
        [fromField]: removeOne(prev[fromField], card)
      }));

      if (values[fromField] === card) {
        setFieldValue(fromField, 'NONE00');
      }
    }

    if (!from || from === 'modular') {
      setModularState((prev) => removeOne(prev, card));
    }

    setAssigned((prev) => ({
      ...prev, [field]: [...prev[field], card]
      // [...prev[field], card]
      // [field]: prev[field].includes(card) ? prev[field] : [...prev[field], card]
    }));

    setFieldValue(field, card);
  };

  const handleReturnToModular = (e: React.DragEvent) => {
    e.preventDefault();

    let data: { card: string; from?: string };
    try {
      data = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch {
      return;
    }

    const { card, from } = data;

    if (!from || !EQUIP_FIELDS.includes(from as EquipFieldName)) return;

    const fromField = from as EquipFieldName;

    setAssigned((prev) => ({
      ...prev,
      [fromField]: removeOne(prev[fromField], card)
    }));

    if (values[fromField] === card) {
      setFieldValue(fromField, 'NONE00');
    }

    setModularState((prev) => [...prev, card]);
  };

  const getCardSrc = (card: string) =>
    getCollectionCardImagePath({
      path: CARD_SQUARES_PATH,
      locale,
      cardNumber: card
    });

  const renderEquipZone = (
    label: string,
    field: EquipFieldName,
    baseList: string[]
  ) => {
    const fullList = [...baseList, ...assigned[field], 'NONE00'];

    return (
      <div
        className={styles.eqCategory}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleEquipmentDrop(e, field)}
      >
        <h3>{label}</h3>

        <div className={styles.categoryContainer}>
          {fullList.map((card, i) => {
            const isAssigned = assigned[field].includes(card);

            return (
              <div
                key={`${field}-${i}`}
                className={styles.cardContainer}
                draggable={isAssigned}
                onDragStart={
                  isAssigned
                    ? (e) => handleAssignedDragStart(e, card, field)
                    : undefined
                }
              >
                <label>
                  <Field type="radio" name={field} value={card} />
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
    );
  };

  return (
    <div className={styles.container} onContextMenu={(e) => e.preventDefault()}>
      <div className={styles.eqCategory}>
        <h3>Weapons / Off-Hand</h3>

        <FieldArray
          name="weapons"
          render={(arrayHelpers) => (
            <div className={styles.categoryContainer}>
              {hands.map((weapon, ix) => {
                const id = weapon.id.split('-')[0];
                const checked = values.weapons.some((w) => w.id === weapon.id);

                return (
                  <div key={`weapon-${ix}`} className={styles.cardContainer}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) arrayHelpers.push(weapon);
                          else {
                            const idx = values.weapons.findIndex(
                              (w) => w.id === weapon.id
                            );
                            arrayHelpers.remove(idx);
                          }
                        }}
                      />
                      <CardPopUp cardNumber={id}>
                        <CardImage
                          src={getCardSrc(id)}
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

      {renderEquipZone('Head', 'head', baseEquipment.head)}
      {renderEquipZone('Chest', 'chest', baseEquipment.chest)}
      {renderEquipZone('Arms', 'arms', baseEquipment.arms)}
      {renderEquipZone('Legs', 'legs', baseEquipment.legs)}

      {baseEquipment.demi.length > 0 && (
        <div className={styles.eqCategory}>
          <h3>Demi-Hero</h3>
          <div className={styles.categoryContainer}>
            {baseEquipment.demi.map((card, ix) => (
              <div key={`demi-${ix}`} className={styles.cardContainer}>
                <CardPopUp cardNumber={card}>
                  <CardImage src={getCardSrc(card)} className={styles.card} />
                </CardPopUp>
              </div>
            ))}
          </div>
        </div>
      )}

      {modularState.length > 0 && (
        <div
          className={styles.eqCategory}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleReturnToModular}
        >
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <h3>Modular</h3>
            <h6 style={{ paddingLeft: '10px' }}>
              <i>(drag into Zone)</i>
            </h6>
          </div>

          <div className={styles.categoryContainer}>
            {modularState.map((card, ix) => (
              <div
                key={`mod-${ix}`}
                className={styles.cardContainer}
                draggable
                onDragStart={(e) => handleModularDragStart(e, card)}
              >
                <CardPopUp cardNumber={card}>
                  <CardImage
                    src={getCardSrc(card)}
                    className={styles.card}
                    draggable
                  />
                </CardPopUp>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.spacerDiv} />
    </div>
  );
};

export default Equipment;
