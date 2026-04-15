import { OfferInterface } from '../../../models/index.js';

export interface FileReader {
  read(): void;
  toArray(): OfferInterface[];
  parseLine(line: string): OfferInterface;
}
