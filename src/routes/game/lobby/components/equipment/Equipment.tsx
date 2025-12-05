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

export type EquipFieldName = 'head' | 'chest' | 'arms' | 'legs';
const EQUIP_FIELDS: EquipFieldName[] = ['head', 'chest', 'arms', 'legs'];

export interface AssignedState {
  head: string[];
  chest: string[];
  arms: string[];
  legs: string[];
}

export interface BaseEquipment {
  head: string[];
  chest: string[];
  arms: string[];
  legs: string[];
  demi: string[];
}

export interface HandWeapon {
  id: string;
}

export interface EquipmentProps {
  lobbyInfo: GetLobbyInfoResponse;
  weapons: Weapon[];
  weaponSB: Weapon[];
  baseEquipment: BaseEquipment;
  hands: HandWeapon[];
  modularState: string[];
  setModularState: React.Dispatch<React.SetStateAction<string[]>>;
  assigned: AssignedState;
  setAssigned: React.Dispatch<React.SetStateAction<AssignedState>>;
}

interface DragPayload {
  card: string;
  from?: string;
}

const Equipment = ({
  baseEquipment,
  hands,
  modularState,
  setModularState,
  assigned,
  setAssigned
}: EquipmentProps) => {
  const { values, setFieldValue } = useFormikContext<DeckResponse>();
  const dispatch = useAppDispatch();
  const { getLanguage } = useLanguageSelector();
  const locale = getLanguage();

  React.useEffect(() => {
    setFieldValue('assignedModulars', assigned);
  }, [assigned, setFieldValue]);

  const removeOne = (arr: string[], value: string): string[] => {
    const idx = arr.indexOf(value);
    if (idx === -1) return arr;
    return [...arr.slice(0, idx), ...arr.slice(idx + 1)];
  };

  const parseDragPayload = (e: React.DragEvent): DragPayload | null => {
    try {
      return JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch {
      return null;
    }
  };

  const getCardSrc = (card: string) =>
    getCollectionCardImagePath({
      path: CARD_SQUARES_PATH,
      locale,
      cardNumber: card
    });


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
    const data = parseDragPayload(e);
    if (!data) return;

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
      ...prev,
      [field]: [...prev[field], card]
    }));

    setFieldValue(field, card);
  };

  const handleReturnToModular = (e: React.DragEvent) => {
    e.preventDefault();
    const data = parseDragPayload(e);
    if (!data) return;

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
                            if (idx !== -1) arrayHelpers.remove(idx);
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
