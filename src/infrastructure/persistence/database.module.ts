import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../../../shared/schema';
import ws from 'ws';

const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL must be set');
        }

        // Configure WebSocket for Neon
        const neonConfig = await import('@neondatabase/serverless');
        neonConfig.neonConfig.webSocketConstructor = ws;

        const pool = new Pool({ connectionString });
        return drizzle({ client: pool, schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}