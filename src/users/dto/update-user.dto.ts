import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'johndoe',
    description: 'Nombre de usuario único',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  email?: string;

  @ApiPropertyOptional({
    example: 'Password123!',
    description: 'Contraseña del usuario',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'Nombre del usuario',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Apellido del usuario',
  })
  @IsOptional()
  @IsString()
  apellido?: string;
}