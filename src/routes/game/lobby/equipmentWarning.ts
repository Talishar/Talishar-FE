export const EQUIPMENT_SLOT_NAMES = ['head', 'chest', 'arms', 'legs'] as const;

export type EquipmentSlotName = (typeof EQUIPMENT_SLOT_NAMES)[number];

type EquipmentSelection = Record<EquipmentSlotName, string | undefined>;

export const getEmptyEquipmentSlots = (
  equipment: EquipmentSelection,
  modularEquipment: string[] = []
): EquipmentSlotName[] => {
  if (modularEquipment.length > 0) return [];

  return EQUIPMENT_SLOT_NAMES.filter(
    (slot) => !equipment[slot] || equipment[slot] === 'NONE00'
  );
};
