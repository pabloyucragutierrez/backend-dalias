import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ActividadesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createActividadDto: CreateActividadDto, file?: Express.Multer.File) {
    let imagen = null;
    let imagePublicId = null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'actividades');
      imagen = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const actividad = await this.prisma.actividad.create({
      data: {
        ...createActividadDto,
        imagen,
        imagePublicId,
      },
    });

    return actividad;
  }

  async findAll() {
    return this.prisma.actividad.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id },
    });

    if (!actividad) {
      throw new NotFoundException('Actividad no encontrada');
    }

    return actividad;
  }

  async update(id: number, updateActividadDto: UpdateActividadDto, file?: Express.Multer.File) {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id },
    });

    if (!actividad) {
      throw new NotFoundException('Actividad no encontrada');
    }

    let imagen = actividad.imagen;
    let imagePublicId = actividad.imagePublicId;

    if (file) {
      if (actividad.imagePublicId) {
        await this.cloudinaryService.deleteImage(actividad.imagePublicId);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'actividades');
      imagen = uploadResult.url;
      imagePublicId = uploadResult.publicId;
    }

    const updatedActividad = await this.prisma.actividad.update({
      where: { id },
      data: {
        ...updateActividadDto,
        imagen,
        imagePublicId,
      },
    });

    return updatedActividad;
  }

  async remove(id: number) {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id },
    });

    if (!actividad) {
      throw new NotFoundException('Actividad no encontrada');
    }

    if (actividad.imagePublicId) {
      await this.cloudinaryService.deleteImage(actividad.imagePublicId);
    }

    await this.prisma.actividad.delete({ where: { id } });

    return { message: 'Actividad eliminada exitosamente' };
  }
}