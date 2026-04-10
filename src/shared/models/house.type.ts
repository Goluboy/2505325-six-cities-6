export const HOUSE_TYPES = ['apartment', 'house', 'room', 'hotel'] as const;

export type HouseType = typeof HOUSE_TYPES[number];

export const findHouseType = (value: string): HouseType | undefined =>
  HOUSE_TYPES.find((type) => type === value);
