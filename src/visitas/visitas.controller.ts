import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VisitasService } from './visitas.service';
import { CreateVisitaDto } from './dto/create-visita.dto';

@ApiTags('visitas')
@Controller('visitas')
export class VisitasController {
  constructor(private readonly visitasService: VisitasService) {}

  @Post('agendar')
  @ApiOperation({ summary: 'Agendar una visita' })
  @ApiResponse({ status: 201, description: 'Visita agendada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Fecha y hora ya reservada' })
  async agendarVisita(@Body() createVisitaDto: CreateVisitaDto) {
    return this.visitasService.agendarVisita(createVisitaDto);
  }

  @Get('verificar-disponibilidad')
  @ApiOperation({ summary: 'Verificar si una fecha y hora está disponible' })
  @ApiQuery({ name: 'fecha', example: '15/1/2026' })
  @ApiQuery({ name: 'hora', example: '11:00 - 12:00' })
  @ApiResponse({ status: 200, description: 'Disponibilidad verificada' })
  async verificarDisponibilidad(
    @Query('fecha') fecha: string,
    @Query('hora') hora: string,
  ) {
    return this.visitasService.verificarDisponibilidad(fecha, hora);
  }

  @Get('horas-ocupadas')
  @ApiOperation({ summary: 'Obtener horas ocupadas para una fecha específica' })
  @ApiQuery({ name: 'fecha', example: '15/1/2026' })
  @ApiResponse({ status: 200, description: 'Lista de horas ocupadas' })
  async obtenerHorasOcupadas(@Query('fecha') fecha: string) {
    return this.visitasService.obtenerHorasOcupadas(fecha);
  }
}
