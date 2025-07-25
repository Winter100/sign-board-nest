import { Transform, Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator'
import { StrokeDto } from './stroke-dto'

export class CreateSignDto {
  @IsString()
  @IsNotEmpty()
  avatar: string

  @IsString()
  @IsNotEmpty()
  writer: string

  @IsString()
  @IsNotEmpty()
  message: string

  @IsString()
  @IsNotEmpty()
  password: string
  @Transform(({ value }) => {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value) as StrokeDto
      }
    } catch (e) {
      console.error(e)
      return []
    }
  })
  @IsArray()
  @ArrayMinSize(1, { message: '경로는 최소 하나의 획을 포함해야 합니다.' })
  @Type(() => StrokeDto)
  paths: StrokeDto[]
}
