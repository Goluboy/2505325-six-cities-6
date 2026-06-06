import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength, MaxLength, IsIn, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @Expose()
  @IsString()
  @MinLength(1)
  @MaxLength(15)
    name!: string;

  @Expose()
  @IsEmail()
  @IsString()
    email!: string;

  @Expose()
  @IsString()
  @MinLength(6)
  @MaxLength(12)
    password!: string;

  @Expose()
  @Transform(({ value }) => value ?? false)
  @IsBoolean()
    isPro!: boolean;

  @Expose()
  @IsOptional()
  @IsString()
    avatarUrl?: string;
}
