import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CondicionesMedicasDto {
  @ApiProperty({
    example: true,
    description: 'Padece hipertensión',
    required: false,
  })
  @IsOptional()
  hipertension?: boolean;

  @ApiProperty({
    example: false,
    description: 'Padece diabetes',
    required: false,
  })
  @IsOptional()
  diabetes?: boolean;

  @ApiProperty({
    example: true,
    description: 'Presenta dificultades para caminar',
    required: false,
  })
  @IsOptional()
  dificultadesCaminar?: boolean;

  @ApiProperty({
    example: false,
    description: 'Presenta incontinencia',
    required: false,
  })
  @IsOptional()
  incontinencia?: boolean;

  @ApiProperty({
    example: true,
    description: 'Tiene problemas de audición o visión',
    required: false,
  })
  @IsOptional()
  problemasAudicionVision?: boolean;

  @ApiProperty({
    example: false,
    description: 'En recuperación post operatoria',
    required: false,
  })
  @IsOptional()
  postOperatoria?: boolean;

  @ApiProperty({
    example: false,
    description: 'Otra condición médica',
    required: false,
  })
  @IsOptional()
  otra?: boolean;
}

class EvaluacionDto {
  @ApiProperty({
    example: 'apoyo-parcial',
    description: 'Nivel de movilidad del adulto mayor',
    enum: ['solo', 'apoyo-parcial', 'ayuda-constante', 'en-cama'],
    required: false,
  })
  @IsOptional()
  @IsString()
  movilidad?: string;

  @ApiProperty({
    example: 'supervision',
    description: 'Actividades de la vida diaria (AVD)',
    enum: ['independiente', 'supervision', 'ayuda-constante', 'no-puede'],
    required: false,
  })
  @IsOptional()
  @IsString()
  avd?: string;

  @ApiProperty({
    example: 'olvidos-ocasionales',
    description: 'Estado cognitivo del adulto mayor',
    enum: [
      'sin-dificultades',
      'olvidos-ocasionales',
      'confusion-frecuente',
      'diagnostico-deterioro',
    ],
    required: false,
  })
  @IsOptional()
  @IsString()
  cognitivo?: string;

  @ApiProperty({
    example: 'estable',
    description: 'Estado emocional y conducta',
    enum: ['estable', 'a-veces-triste', 'irritable', 'cambios-conducta'],
    required: false,
  })
  @IsOptional()
  @IsString()
  emocional?: string;

  @ApiProperty({
    type: CondicionesMedicasDto,
    description: 'Condiciones médicas relevantes',
    required: false,
    example: {
      hipertension: true,
      diabetes: false,
      dificultadesCaminar: true,
      incontinencia: false,
      problemasAudicionVision: true,
      postOperatoria: false,
      otra: false,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CondicionesMedicasDto)
  condiciones?: CondicionesMedicasDto;

  @ApiProperty({
    example: 'recordatorio',
    description: 'Requiere ayuda con medicación',
    enum: ['no', 'recordatorio', 'administracion-completa'],
    required: false,
  })
  @IsOptional()
  @IsString()
  medicacion?: string;

  @ApiProperty({
    example: 'cuidado-permanente',
    description: 'Motivo principal de la consulta',
    enum: [
      'cuidado-permanente',
      'recuperacion-temporal',
      'centro-dia',
      'descanso-cuidador',
      'otro',
    ],
    required: false,
  })
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
    example: 'llantauniversity@gmail.com',
    description: 'Correo electrónico del solicitante',
  })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  correoElectronico: string;

  @ApiProperty({
    example: '+51987654321',
    description: 'Número de teléfono/móvil del solicitante',
  })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString()
  telefono: string;

  @ApiProperty({
    example: 75,
    description: 'Edad del adulto mayor',
  })
  @IsNotEmpty({ message: 'La edad del adulto mayor es obligatoria' })
  @IsNumber()
  edadAdultoMayor: number;

  @ApiProperty({
    example: 'semi-dependiente',
    description: 'Nivel de dependencia del adulto mayor',
    enum: ['independiente', 'semi-dependiente', 'dependiente'],
  })
  @IsNotEmpty({ message: 'El nivel de dependencia es obligatorio' })
  @IsString()
  nivelDependencia: string;

  @ApiProperty({
    example:
      'Hipertenso controlado con medicación. Presenta dificultades visuales (usa lentes). Camina con bastón.',
    description: 'Observaciones sobre la salud del adulto mayor',
    required: false,
  })
  @IsOptional()
  @IsString()
  observacionesSalud?: string;

  @ApiProperty({
    example: '25/1/2026',
    description: 'Fecha seleccionada para la visita (formato: DD/M/YYYY)',
  })
  @IsNotEmpty({ message: 'La fecha de visita es obligatoria' })
  @IsString()
  fechaSeleccionada: string;

  @ApiProperty({
    example: '11:00 - 12:00',
    description: 'Hora seleccionada para la visita (formato: HH:MM - HH:MM)',
  })
  @IsNotEmpty({ message: 'La hora de visita es obligatoria' })
  @IsString()
  horaSeleccionada: string;

  @ApiProperty({
    type: EvaluacionDto,
    description: 'Evaluación inicial del adulto mayor (test completo)',
    required: false,
    example: {
      movilidad: 'apoyo-parcial',
      avd: 'supervision',
      cognitivo: 'olvidos-ocasionales',
      emocional: 'estable',
      condiciones: {
        hipertension: true,
        diabetes: false,
        dificultadesCaminar: true,
        incontinencia: false,
        problemasAudicionVision: true,
        postOperatoria: false,
        otra: false,
      },
      medicacion: 'recordatorio',
      motivo: 'cuidado-permanente',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EvaluacionDto)
  evaluacion?: EvaluacionDto;
}
