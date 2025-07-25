import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { CreateSignDto } from './dto/create-sign.dto'
import { SupabaseClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcrypt'
import { GetItemsDto } from './dto/get-items-dto'
import { image_bucket, sign_table, strokes_table } from './constant'
import { getStringFromKeyword } from 'src/lib/getStringFromKeyword'

@Injectable()
export class SignsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async create(createSignDto: CreateSignDto, image: Express.Multer.File) {
    if (!image) throw new BadRequestException('이미지 파일이 누락되었습니다.')

    const uniqueFilename = `${Date.now()}-${image.originalname}`

    try {
      const { error: uploadError } = await this.supabase.storage
        .from(image_bucket)
        .upload(`public/${uniqueFilename}`, image.buffer, {
          contentType: image.mimetype,
          upsert: false,
        })

      if (uploadError)
        throw new BadRequestException('이미지 업로드중 에러가 발생했습니다.')

      const { data: publicImageUrl } = this.supabase.storage
        .from(image_bucket)
        .getPublicUrl(`public/${uniqueFilename}`)

      //Supabase Database에 데이터 저장
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(
        createSignDto.password,
        saltRounds,
      )

      const { data: signData, error: signError } = await this.supabase
        .from(sign_table)
        .insert({
          avatar: createSignDto.avatar,
          writer: createSignDto.writer,
          message: createSignDto.message,
          image_url: publicImageUrl.publicUrl,
          password: hashedPassword,
        })
        .select('id')
        .single()

      if (signError)
        throw new BadRequestException(
          '서명 데이터 저장 중 에러가 발생했습니다.',
        )

      const signId = signData.id as string

      const { error: strokeError } = await this.supabase
        .from(strokes_table)
        .insert({
          sign_id: signId,
          points: createSignDto.paths,
        })
        .select('id')
        .single()

      if (strokeError)
        throw new BadRequestException('Paths 저장 중 에러가 발생했습니다.')

      return { message: '서명 저장에 성공했습니다.' }
    } catch (e) {
      console.error('이미지 저장 에러', e)
    }
  }

  async findSign(query: GetItemsDto) {
    const { limit, lastId } = query

    let supabaseQuery = this.supabase
      .from(sign_table)
      .select('id, created_at, writer, message, image_url, avatar')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (lastId) {
      const { data: lastItemData, error: lastItemError } = await this.supabase
        .from(sign_table)
        .select('created_at')
        .eq('id', lastId)
        .single()

      if (!lastItemData || lastItemError) throw lastItemError

      supabaseQuery = supabaseQuery.or(
        `created_at.lt.${lastItemData.created_at}, and(created_at.eq.${lastItemData.created_at},id.lt.${lastId})`,
      )
    }

    const { data, error } = (await supabaseQuery) as {
      data:
        | {
            id: string
            writer: string
            message: string
            image_url: string
            created_at: string
          }[]
        | null
      error: Error
    }

    if (error) throw error

    const hasNextPage = data?.length === limit
    const nextCursor = hasNextPage ? data[data.length - 1].id : null

    return {
      item: data,
      nextCursor: nextCursor,
      hasNextPage: hasNextPage,
    }
  }

  async deleteSign(signId: string, password: string) {
    const { data, error: fetchError } = await this.supabase
      .from(sign_table)
      .select('id, password, image_url')
      .eq('id', signId)
      .single()

    if (!data || !data.password || fetchError)
      throw new BadRequestException('해당 ID의 서명이 존재하지 않습니다.')

    const hashedPassword = data?.password as string
    const isMatch = await bcrypt.compare(password, hashedPassword)

    if (!isMatch) throw new BadRequestException('비밀번호가 일치하지 않습니다.')

    const { error: deleteError } = await this.supabase
      .from(sign_table)
      .delete()
      .eq('id', signId)

    const url = data.image_url as string

    // 이미지 삭제
    const firstPaths = getStringFromKeyword(url, image_bucket)
    const imagePaths = getStringFromKeyword(firstPaths || '', 'public')
    if (!imagePaths) throw new BadRequestException('이미지를 확인해주세요.')

    const { error: removeImageError } = await this.supabase.storage
      .from(image_bucket)
      .remove([imagePaths])

    if (deleteError || removeImageError)
      throw new BadRequestException('삭제 중 오류가 발생했습니다.')

    return { message: '삭제 성공' }
  }

  async findPath(signId: string) {
    try {
      const { data: strokes, error } = await this.supabase
        .from(strokes_table)
        .select('points')
        .eq('sign_id', signId)
        .single()

      if (error) throw error

      return strokes
    } catch (e) {
      console.error('findPath Error', e)
    }
  }
}
