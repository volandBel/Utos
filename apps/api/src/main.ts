import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { TraceIdInterceptor } from './shared/trace-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  // pino как логгер Nest
  app.useLogger(app.get(Logger));

  // общий интерсептор — добавит trace_id в заголовок и тело ответа
  app.useGlobalInterceptors(new TraceIdInterceptor());

  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
}
bootstrap();
