import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateContactoDto {
  @ApiProperty({
    example: 'Información sobre residencia',
    description: 'Tipo de consulta o servicio de interés',
  })
  @IsNotEmpty({ message: 'El tipo de consulta es obligatorio' })
  @IsString()
  tipoConsulta: string;

  @ApiProperty({
    example: 'Juan Pérez García',
    description: 'Nombre completo del remitente',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'Quisiera información sobre los servicios disponibles...',
    description: 'Mensaje del contacto',
  })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @IsString()
  mensaje: string;
}