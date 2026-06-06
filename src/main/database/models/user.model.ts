import { prop, getModelForClass, defaultClasses, modelOptions } from '@typegoose/typegoose';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
@modelOptions({ options: { allowMixed: 0 } })
export class UserModel extends defaultClasses.TimeStamps {
  @prop({ required: true, minlength: 1, maxlength: 15 })
  public name!: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: false })
  public avatar?: string;

  @prop({ required: true, minlength: 64, maxlength: 64 })
  public password!: string;

  @prop({ required: true })
  public isPro!: boolean;
}

export const UserEntity = getModelForClass(UserModel);
