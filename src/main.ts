import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Autenticación')
    .setDescription('API REST para autenticación de usuarios con JWT')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 🚨 IMPORTANTE: usar el puerto que asigna Render
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Aplicación corriendo en el puerto: ${port}`);
  console.log(`📚 Swagger disponible en /api/docs`);
}

bootstrap();
