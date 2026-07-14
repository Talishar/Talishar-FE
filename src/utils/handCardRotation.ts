let handCardRotationHeld = false;

export const setHandCardRotationHeld = (isHeld: boolean) => {
  handCardRotationHeld = isHeld;
};

export const isHandCardRotationHeld = () => handCardRotationHeld;
