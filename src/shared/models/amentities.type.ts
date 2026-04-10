export const AMENITY_TYPES = [
  'Breakfast', 'Air conditioning', 'Laptop friendly workspace',
  'Baby seat', 'Washer', 'Towels', 'Fridge',
] as const;

export type AmenitiesType = typeof AMENITY_TYPES[number];

export const findAmenityType = (value: string): AmenitiesType | undefined =>
  AMENITY_TYPES.find((type) => type === value);
