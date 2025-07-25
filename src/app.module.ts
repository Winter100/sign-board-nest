import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SupabaseModule } from './supabase/supabase.module'
import { SignsModule } from './signs/signs.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    SignsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
