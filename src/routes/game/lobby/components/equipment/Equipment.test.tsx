import { fireEvent, render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DeckResponse } from 'interface/API/GetLobbyInfo.php';
import Equipment, { AssignedState, BaseEquipment } from './Equipment';
import styles from './Equipment.module.css';

vi.mock('hooks/useLanguageSelector', () => ({
  useLanguageSelector: () => ({ getLanguage: () => 'en' })
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'GAME_LOBBY.WEAPONS': 'Weapons',
        'GAME_LOBBY.HEAD': 'Head',
        'GAME_LOBBY.CHEST': 'Chest',
        'GAME_LOBBY.ARMS': 'Arms',
        'GAME_LOBBY.LEGS': 'Legs',
        'GAME_LOBBY.MODULAR': 'Modular',
        'GAME_LOBBY.DRAG': 'Drag'
      }[key] ?? key)
  })
}));

vi.mock('utils', () => ({
  CARD_SQUARES_PATH: '/cards',
  getCollectionCardImagePath: ({ cardNumber }: { cardNumber: string }) =>
    cardNumber
}));

vi.mock('routes/game/components/elements/cardPortal/cardPreviewStore', () => ({
  clearCardPreview: vi.fn()
}));

vi.mock('routes/game/components/elements/cardPopUp/CardPopUp', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}));

vi.mock('routes/game/components/elements/cardImage/CardImage', () => ({
  default: ({ src, draggable }: { src: string; draggable?: boolean }) => (
    <img src={src} alt={src} draggable={draggable} />
  )
}));

const EMPTY_ASSIGNED: AssignedState = {
  head: [],
  chest: [],
  arms: [],
  legs: []
};

const EMPTY_EQUIPMENT: BaseEquipment = {
  head: [],
  chest: [],
  arms: [],
  legs: [],
  demi: []
};

const createDataTransfer = () => {
  const data = new Map<string, string>();
  return {
    data,
    effectAllowed: 'none',
    dropEffect: 'none',
    getData: vi.fn((type: string) => data.get(type) ?? ''),
    setData: vi.fn((type: string, value: string) => data.set(type, value))
  };
};

const EquipmentHarness = () => {
  const [modularState, setModularState] = React.useState(['modular-card']);
  const [assigned, setAssigned] = React.useState(EMPTY_ASSIGNED);
  const initialValues: DeckResponse = {
    deck: [],
    weapons: [],
    head: 'NONE00',
    chest: 'NONE00',
    arms: 'NONE00',
    legs: 'NONE00'
  };

  return (
    <Formik initialValues={initialValues} onSubmit={vi.fn()}>
      <Equipment
        lobbyInfo={{} as never}
        weapons={[]}
        weaponSB={[]}
        baseEquipment={EMPTY_EQUIPMENT}
        hands={[]}
        modularState={modularState}
        setModularState={setModularState}
        assigned={assigned}
        setAssigned={setAssigned}
      />
    </Formik>
  );
};

const getDropZone = (name: string) =>
  screen
    .getByRole('heading', { name })
    .closest(`.${styles.equipmentDropZone}`) as HTMLElement;

describe('lobby modular equipment drag and drop', () => {
  it('keeps empty equipment zones usable and lets the final card return', () => {
    render(<EquipmentHarness />);

    const image = screen.getByRole('img', { name: 'modular-card' });
    const source = image.closest('[draggable="true"]') as HTMLElement;
    const headDropZone = getDropZone('Head');
    const firstTransfer = createDataTransfer();

    expect(headDropZone).toBeInTheDocument();
    expect(
      headDropZone.querySelector(`.${styles.dropPlaceholder}`)
    ).not.toBeInTheDocument();
    expect(image).toHaveAttribute('draggable', 'false');

    fireEvent.dragStart(source, { dataTransfer: firstTransfer });
    expect(firstTransfer.setData).toHaveBeenCalledWith(
      'application/x-talishar-modular-equipment',
      expect.any(String)
    );
    expect(firstTransfer.setData).toHaveBeenCalledWith(
      'text/plain',
      expect.any(String)
    );

    // Exercise the same-component fallback used when a browser withholds the
    // DataTransfer payload at drop time.
    firstTransfer.data.clear();
    fireEvent.dragOver(headDropZone, { dataTransfer: firstTransfer });
    expect(firstTransfer.dropEffect).toBe('move');
    const placeholder = headDropZone.querySelector(
      `.${styles.dropPlaceholder}`
    );
    expect(placeholder).toBeInTheDocument();
    expect(placeholder?.querySelector('img')).not.toBeInTheDocument();
    fireEvent.drop(headDropZone, { dataTransfer: firstTransfer });

    expect(getDropZone('Head')).toContainElement(
      screen.getByRole('img', { name: 'modular-card' })
    );
    expect(
      getDropZone('Head').querySelector(`.${styles.dropPlaceholder}`)
    ).not.toBeInTheDocument();

    const modularDropZone = getDropZone('Modular');
    expect(modularDropZone).toBeInTheDocument();

    const assignedSource = screen
      .getByRole('img', { name: 'modular-card' })
      .closest('[draggable="true"]') as HTMLElement;
    const secondTransfer = createDataTransfer();
    fireEvent.dragStart(assignedSource, { dataTransfer: secondTransfer });
    fireEvent.drop(modularDropZone, { dataTransfer: secondTransfer });

    expect(getDropZone('Modular')).toContainElement(
      screen.getByRole('img', { name: 'modular-card' })
    );
  });
});
