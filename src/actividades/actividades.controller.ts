import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ActividadesService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('actividades')
@Controller('actividades')
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear una nueva actividad' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descripcion: { type: 'string' },
        imagen: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Actividad creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @Body() createActividadDto: CreateActividadDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.actividadesService.create(createActividadDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las actividades' })
  @ApiResponse({ status: 200, description: 'Lista de actividades' })
  async findAll() {
    return this.actividadesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una actividad' })
  @ApiResponse({ status: 200, description: 'Actividad encontrada' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.actividadesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar una actividad' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descripcion: { type: 'string' },
        imagen: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Actividad actualizada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActividadDto: UpdateActividadDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.actividadesService.update(id, updateActividadDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una actividad' })
  @ApiResponse({ status: 200, description: 'Actividad eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.actividadesService.remove(id);
  }
}