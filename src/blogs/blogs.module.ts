import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService, CloudinaryService],
})
export class BlogsModule {}