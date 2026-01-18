import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS abierto para cualquier frontend (producción + local)
  app.enableCors();

  // ✅ Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Swagger
  const config = new DocumentBuilder()
    .setTitle('API Dalias')
    .setDescription('API REST del backend Dalias')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ⚠️ IMPORTANTE PARA RENDER
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 API corriendo en puerto ${port}`);
  console.log(`📚 Swagger: /api/docs`);
}

bootstrap();
