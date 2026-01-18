import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BlogsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createBlogDto: CreateBlogDto, userId: number, file?: Express.Multer.File) {
    let imagen = null;
    let imagePublicId = null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'blogs');
      imagen = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const blog = await this.prisma.blog.create({
      data: {
        ...createBlogDto,
        imagen,
        imagePublicId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return blog;
  }

  async findAll() {
    return this.prisma.blog.findMany({
      where: {
        estado: 'activo',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog no encontrado');
    }

    return blog;
  }

  async update(id: number, updateBlogDto: UpdateBlogDto, userId: number, file?: Express.Multer.File) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Blog no encontrado');
    }

    let imagen = blog.imagen;
    let imagePublicId = blog.imagePublicId;

    if (file) {
      if (blog.imagePublicId) {
        await this.cloudinaryService.deleteImage(blog.imagePublicId);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'blogs');
      imagen = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: {
        ...updateBlogDto,
        imagen,
        imagePublicId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return updatedBlog;
  }

  async remove(id: number, userId: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Blog no encontrado');
    }

    if (blog.imagePublicId) {
      await this.cloudinaryService.deleteImage(blog.imagePublicId);
    }

    await this.prisma.blog.delete({ where: { id } });

    return { message: 'Blog eliminado exitosamente' };
  }
}