import { UserInterface } from './user.interface.js';

export interface CommentInterface {
  text: string;
  publishDate: Date;
  rating: number;
  author: UserInterface;
}
