import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import * as Sentry from '@sentry/node';

async function bootstrap() {
  // Inicializar Sentry si está configurado
  if (process.env.SENTRY_DSN) {
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   environment: process.env.NODE_ENV || 'development',
    //   tracesSampleRate: 1.0,
    // });
  }

  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Pipes globales para validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📝 Documentación: http://localhost:${port}/api`);
}

bootstrap();
