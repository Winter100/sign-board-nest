import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Query,
  Delete,
} from '@nestjs/common'
import { SignsService } from './signs.service'
import { CreateSignDto } from './dto/create-sign.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { GetItemsDto } from './dto/get-items-dto'
import { DeleteSignDto } from './dto/delete-sign-dto'

@Controller('signs')
export class SignsController {
  constructor(private readonly signsService: SignsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createSignDto: CreateSignDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.signsService.create(createSignDto, file)
  }

  @Get()
  findSign(@Query() query: GetItemsDto) {
    return this.signsService.findSign(query)
  }

  @Get(':id/paths')
  findPath(@Param('id') id: string) {
    return this.signsService.findPath(id)
  }

  @Delete(':id')
  deleteSign(@Param('id') id: string, @Body() body: DeleteSignDto) {
    const { password } = body
    return this.signsService.deleteSign(id, password)
  }
}
