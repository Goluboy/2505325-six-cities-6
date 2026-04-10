export const USER_TYPES = ['default', 'pro'] as const;

export type UserType = typeof USER_TYPES[number];

export const findUserType = (value: string): UserType | undefined =>
  USER_TYPES.find((type) => type === value);

export interface UserInterface {
  name: string;
  email: string;
  avatar?: string;
  password: string;
  type: UserType;
}
