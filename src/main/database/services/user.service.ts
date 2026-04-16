import { injectable } from 'inversify';
import { UserModel, UserEntity } from '../models/user.model.js';
import { UserServiceInterface } from './database-service.interface.js';

@injectable()
export class UserService implements UserServiceInterface {
  public async findById(id: string): Promise<UserModel | null> {
    return UserEntity.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<UserModel | null> {
    return UserEntity.findOne({ email }).exec();
  }

  public async create(userData: Partial<UserModel>): Promise<UserModel> {
    const user = new UserEntity(userData);
    return user.save();
  }
}
