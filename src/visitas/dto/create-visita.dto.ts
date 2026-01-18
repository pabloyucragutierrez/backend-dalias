import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsNumber, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CondicionesMedicasDto {
  @IsOptional()
  hipertension?: boolean;

  @IsOptional()
  diabetes?: boolean;

  @IsOptional()
  dificultadesCaminar?: boolean;

  @IsOptional()
  incontinencia?: boolean;

  @IsOptional()
  problemasAudicionVision?: boolean;

  @IsOptional()
  postOperatoria?: boolean;

  @IsOptional()
  otra?: boolean;
}

class EvaluacionDto {
  @IsOptional()
  @IsString()
  movilidad?: string;

  @IsOptional()
  @IsString()
  avd?: string;

  @IsOptional()
  @IsString()
  cognitivo?: string;

  @IsOptional()
  @IsString()
  emocional?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CondicionesMedicasDto)
  condiciones?: CondicionesMedicasDto;

  @IsOptional()
  @IsString()
  medicacion?: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}

export class CreateVisitaDto {
  @ApiProperty({
    example: 'Juan Pérez García',
    description: 'Nombre y apellido del solicitante',
  })
  @IsNotEmpty({ message: 'El nombre y apellido es obligatorio' })
  @IsString()
  nombreApellido: string;

  @ApiProperty({
    example: 'juan.perez@email.com',
    description: 'Correo electrónico del solicitante',
  })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  correoElectronico: string;

  @ApiProperty({
    example: 75,
    description: 'Edad del adulto mayor',
  })
  @IsNotEmpty({ message: 'La edad del adulto mayor es obligatoria' })
  @IsNumber()
  edadAdultoMayor: number;

  @ApiProperty({
    example: 'independiente',
    description: 'Nivel de dependencia del adulto mayor',
  })
  @IsNotEmpty({ message: 'El nivel de dependencia es obligatorio' })
  @IsString()
  nivelDependencia: string;

  @ApiProperty({
    example: 'Diabético, hipertenso',
    description: 'Observaciones sobre la salud del adulto mayor',
    required: false,
  })
  @IsOptional()
  @IsString()
  observacionesSalud?: string;

  @ApiProperty({
    example: '15/1/2026',
    description: 'Fecha seleccionada para la visita',
  })
  @IsNotEmpty({ message: 'La fecha de visita es obligatoria' })
  @IsString()
  fechaSeleccionada: string;

  @ApiProperty({
    example: '10:00 AM',
    description: 'Hora seleccionada para la visita',
  })
  @IsNotEmpty({ message: 'La hora de visita es obligatoria' })
  @IsString()
  horaSeleccionada: string;

  @ApiProperty({
    description: 'Evaluación inicial del adulto mayor (opcional)',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EvaluacionDto)
  evaluacion?: EvaluacionDto;
}