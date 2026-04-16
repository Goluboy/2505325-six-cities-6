import { prop, getModelForClass, defaultClasses, modelOptions } from '@typegoose/typegoose';
import { UserType } from '../../../shared/models/user.interface.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
@modelOptions({ options: { allowMixed: 0 } })
export class UserModel extends defaultClasses.TimeStamps {
  @prop({ required: true, minlength: 1, maxlength: 15 })
  public name!: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: false })
  public avatar?: string;

  @prop({ required: true, minlength: 6, maxlength: 12 })
  public password!: string;

  @prop({ required: true, type: String, enum: ['default', 'pro'] })
  public type!: UserType;
}

export const UserEntity = getModelForClass(UserModel);
