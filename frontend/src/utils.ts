import { MAX_PERCENT_STARS_WIDTH, STARS_COUNT } from './const';
import Cookies from 'js-cookie';

export const formatDate = (date: string) => {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      return 'Unknown date';
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {'month':'long','year':'numeric'}
    ).format(d);
  } catch {
    return 'Unknown date';
  }
};

export const getStarsWidth = (rating: number) =>
  `${(MAX_PERCENT_STARS_WIDTH * Math.round(rating)) / STARS_COUNT}%`;

export const getRandomElement = <T>(array: readonly T[]): T => array[Math.floor(Math.random() * array.length)];
export const pluralize = (str: string, count: number) => count === 1 ? str : `${str}s`;
export const capitalize = (str: string | undefined | null): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export class Token {
  private static _name = 'six-cities-auth-token';
  private static _maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

  static get() {
    const name = this._name + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length);
      }
    }

    return '';
  }

  static save(token: string) {
    const expires = new Date();
    expires.setTime(expires.getTime() + this._maxAge * 1000);
    const expiresString = `expires=${expires.toUTCString()}`;
    document.cookie = `${this._name}=${token};${expiresString};path=/;SameSite=Strict`;
  }

  static drop() {
    document.cookie = `${this._name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}

