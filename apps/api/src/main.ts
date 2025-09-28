import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { TraceIdInterceptor } from './shared/trace-id.interceptor';
import { ValidationPipe } from '@nestjs/common';
import fastifyCors from '@fastify/cors'; // 👈 добавил

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new TraceIdInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // 👇 разрешаем CORS для фронта
  await app.register(fastifyCors, {
    origin: "http://localhost:3001",
    credentials: true,
  });

  await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
}
bootstrap();
