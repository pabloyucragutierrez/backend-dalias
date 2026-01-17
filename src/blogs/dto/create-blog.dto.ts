import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({
    example: 'Mi primer blog sobre NestJS',
    description: 'Título del blog',
  })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString()
  titulo: string;

  @ApiProperty({
    example: 'Una breve introducción a NestJS',
    description: 'Descripción corta del blog',
  })
  @IsNotEmpty({ message: 'La descripción corta es obligatoria' })
  @IsString()
  descripcionCorta: string;

  @ApiProperty({
    example: 'Contenido completo del blog...',
    description: 'Descripción completa del blog',
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  descripcion: string;
}