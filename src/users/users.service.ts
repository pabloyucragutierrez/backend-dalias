import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { username, email, password, nombre, apellido } = createUserDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
      if (existingUser.email === email) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nombre,
        apellido,
      },
    });

    // Retornar sin la contraseña
    const { password: _, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Retornar sin las contraseñas
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el nuevo username o email ya están en uso por otro usuario
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                updateUserDto.username ? { username: updateUserDto.username } : {},
                updateUserDto.email ? { email: updateUserDto.email } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.username === updateUserDto.username) {
          throw new ConflictException('El nombre de usuario ya está en uso');
        }
        if (existingUser.email === updateUserDto.email) {
          throw new ConflictException('El correo electrónico ya está registrado');
        }
      }
    }

    // Si se está actualizando la contraseña, encriptarla
    let dataToUpdate: any = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar usuario
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    // Retornar sin la contraseña
    const { password: _, ...result } = updatedUser;
    return result;
  }

  async remove(id: number) {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Eliminar usuario (los blogs se eliminarán en cascada según el schema)
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuario eliminado exitosamente' };
  }
}