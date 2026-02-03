import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactoDto {
  @ApiProperty({
    example: 'Información sobre residencia',
    description: 'Tipo de consulta o servicio de interés',
    required: false,
  })
  @IsOptional()
  @IsString()
  tipoConsulta?: string;

  @ApiProperty({
    example: 'Juan Pérez García',
    description: 'Nombre completo del remitente',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'juan.perez@email.com',
    description: 'Correo electrónico del remitente',
  })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  correo: string;

  @ApiProperty({
    example: '+51 987 654 321',
    description: 'Número de móvil del remitente',
  })
  @IsNotEmpty({ message: 'El número de móvil es obligatorio' })
  @IsString()
  numeroMovil: string;

  @ApiProperty({
    example: 'Quisiera información sobre los servicios disponibles...',
    description: 'Mensaje del contacto',
  })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @IsString()
  mensaje: string;
}