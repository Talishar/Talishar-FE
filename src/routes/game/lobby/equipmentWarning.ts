export const EQUIPMENT_SLOT_NAMES = ['head', 'chest', 'arms', 'legs'] as const;

export type EquipmentSlotName = (typeof EQUIPMENT_SLOT_NAMES)[number];

type EquipmentSelection = Record<EquipmentSlotName, string | undefined>;

type EquipmentPool = Partial<Record<EquipmentSlotName, string[]>>;

const isEmpty = (card: string | undefined) => !card || card === 'NONE00';

export const getEmptyEquipmentSlots = (
  equipment: EquipmentSelection,
  modularEquipment: string[] = [],
  available?: EquipmentPool
): EquipmentSlotName[] => {
  if (modularEquipment.length > 0) return [];

  return EQUIPMENT_SLOT_NAMES.filter(
    (slot) =>
      isEmpty(equipment[slot]) &&
      (!available || (available[slot] ?? []).some((card) => !isEmpty(card)))
  );
};
