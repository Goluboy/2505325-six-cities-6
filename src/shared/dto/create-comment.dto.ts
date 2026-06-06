import { Expose, Transform } from 'class-transformer';
import { IsString, MinLength, MaxLength, IsNumber, Min, Max, IsDate, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @Expose()
  @IsString()
  @MinLength(5)
  @MaxLength(1024)
    text!: string;

  @Expose()
  @IsNumber()
  @Min(1)
  @Max(5)
    rating!: number;

  offer!: Types.ObjectId;

  author!: Types.ObjectId;

  publishDate!: Date;
}
