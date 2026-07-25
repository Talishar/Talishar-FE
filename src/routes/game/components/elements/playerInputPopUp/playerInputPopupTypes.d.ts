import React from 'react';

export interface FormProps {
  cards: Card[];
  cardOriginalIndexes: number[];
  topCards: Card[];
  bottomCards: Card[];
  buttons: Button[];
  onClickButton: (button: Button) => void;
  id: 'OPT' | string;
  customInput: string;
  choiceOptions: string;
  checkedState: boolean[];
  handleCheckBoxChange: (cardActivationNumber: number) => void;
  id: string;
  formOptions: GameState.playerInputPopUp;
  checkboxes: React.ReactElement[];
  checkBoxSubmit: () => void;
}
