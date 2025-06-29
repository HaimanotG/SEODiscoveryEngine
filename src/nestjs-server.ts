import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrapNestJS() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // API prefix for new NestJS routes
  app.setGlobalPrefix('api/v2');

  const port = process.env.NESTJS_PORT || 5001;
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS Application is running on: http://localhost:${port}`);
}

// Export for integration with existing Express server
export { bootstrapNestJS };