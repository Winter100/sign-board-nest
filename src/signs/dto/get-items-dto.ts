import { Type } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'

export class GetItemsDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'limit은 최소 1이상이어야 합니다.' })
  limit: number = 10

  @IsOptional()
  lastId?: string
}
