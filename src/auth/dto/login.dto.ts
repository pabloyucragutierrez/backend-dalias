import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Nombre de usuario',
  })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña del usuario',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  password: string;
}