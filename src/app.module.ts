import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { ActividadesModule } from './actividades/actividades.module';
import { ContactoModule } from './contacto/contacto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CloudinaryModule,
    UsersModule,
    AuthModule,
    BlogsModule,
    ActividadesModule,
    ContactoModule,
  ],
})
export class AppModule {}