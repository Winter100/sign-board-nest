import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (configService: ConfigService): SupabaseClient => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL')
        const supabaseRoleKey = configService.get<string>(
          'SUPABASE_SERVICE_ROLE_KEY',
        )

        if (!supabaseUrl || !supabaseRoleKey) {
          throw new Error('Supabase URL or Key is not configured.')
        }

        return createClient(supabaseUrl, supabaseRoleKey)
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
