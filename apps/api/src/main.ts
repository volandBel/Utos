import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { TraceIdInterceptor } from './shared/trace-id.interceptor';
import { ValidationPipe } from '@nestjs/common'; // ← добавь это

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new TraceIdInterceptor());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })); // ← и это

  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
}
bootstrap();

