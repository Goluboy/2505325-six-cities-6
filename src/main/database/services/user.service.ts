import { injectable } from 'inversify';
import { UserModel, UserEntity } from '../models/user.model.js';
import { UserServiceInterface } from './database-service.interface.js';
import { CreateUserDto } from '../../../shared/dto/create-user.dto.js';

@injectable()
export class UserService implements UserServiceInterface {
  public async findById(id: string): Promise<UserModel | null> {
    return UserEntity.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<UserModel | null> {
    return UserEntity.findOne({ email }).exec();
  }

  public async create(dto: CreateUserDto): Promise<UserModel> {
    const user = new UserEntity(dto);
    return user.save();
  }

  public async findOrCreate(userData: Partial<UserModel>): Promise<UserModel> {
    if (!userData.email) {
      throw new Error('Email is required');
    }

    let user = await this.findByEmail(userData.email);
    if (!user) {
      user = await this.create(userData as CreateUserDto);
    }
    return user;
  }

  public async updateAvatar(id: string, avatarPath: string): Promise<UserModel | null> {
    return UserEntity.findByIdAndUpdate(id, { avatar: avatarPath }, { new: true }).exec();
  }
}
