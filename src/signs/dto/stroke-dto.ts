import { PointDto } from './point.dto'
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class StrokeDto {
  @IsArray()
  @ArrayMinSize(1, { message: '최소 하나의 점이 존재해야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  points: PointDto[]
}
