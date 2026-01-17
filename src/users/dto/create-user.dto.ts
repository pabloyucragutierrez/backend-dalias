import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Nombre de usuario único',
  })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña del usuario',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'Nombre del usuario',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Apellido del usuario',
  })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  apellido: string;
}