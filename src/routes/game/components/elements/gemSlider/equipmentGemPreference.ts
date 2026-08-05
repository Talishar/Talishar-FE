export const DISABLE_EQUIPMENT_GEM_BUTTONS_COOKIE =
  'disableEquipmentGemButtons';

export const areEquipmentGemButtonsDisabled = (
  cookieValue: string | undefined
): boolean => cookieValue === 'true';
