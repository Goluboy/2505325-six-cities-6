export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number, precision = 0): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(precision));
}

export function getRandomElement<T>(array: T[]): T {
  return array[getRandomNumber(0, array.length - 1)];
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getRandomDate(start?: Date, end?: Date): Date {
  const startDate = start ?? new Date(2024, 0, 1);
  const endDate = end ?? new Date();
  const timestamp = getRandomNumber(
    Math.floor(startDate.getTime()),
    Math.floor(endDate.getTime())
  );
  return new Date(timestamp);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
