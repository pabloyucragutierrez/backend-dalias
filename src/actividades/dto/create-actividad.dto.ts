import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateActividadDto {
  @ApiProperty({
    example: 'Conferencia sobre NestJS',
    description: 'Título de la actividad',
  })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString()
  titulo: string;

  @ApiProperty({
    example: 'Aprende las mejores prácticas',
    description: 'Subtítulo de la actividad',
    required: false,
  })
  @IsOptional()
  @IsString()
  subtitulo?: string;

  @ApiProperty({
    example: 'Una conferencia sobre las mejores prácticas en NestJS',
    description: 'Descripción de la actividad',
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  descripcion: string;
}