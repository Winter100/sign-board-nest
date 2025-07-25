import { IsNotEmpty, IsString } from 'class-validator'

export class DeleteSignDto {
  @IsString()
  @IsNotEmpty()
  password: string
}
