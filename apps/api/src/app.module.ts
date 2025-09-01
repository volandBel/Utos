import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        genReqId: (req) => (req as any).id ?? (req.headers['x-request-id'] as string) ?? undefined,
        customProps: (req) => ({ trace_id: (req as any).id }),
        serializers: {
          req: (req) => ({ id: (req as any).id, method: req.method, url: req.url }),
          res: (res) => ({ statusCode: res.statusCode })
        }
      }
    }),
    HealthModule
  ],
})
export class AppModule {}
