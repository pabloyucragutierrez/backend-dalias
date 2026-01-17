import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear un nuevo blog' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descripcionCorta: { type: 'string' },
        descripcion: { type: 'string' },
        imagen: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Blog creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.blogsService.create(createBlogDto, req.user.userId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los blogs' })
  @ApiResponse({ status: 200, description: 'Lista de blogs' })
  async findAll() {
    return this.blogsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un blog' })
  @ApiResponse({ status: 200, description: 'Blog encontrado' })
  @ApiResponse({ status: 404, description: 'Blog no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blogsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar un blog' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descripcionCorta: { type: 'string' },
        descripcion: { type: 'string' },
        imagen: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Blog actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para editar este blog' })
  @ApiResponse({ status: 404, description: 'Blog no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.blogsService.update(id, updateBlogDto, req.user.userId, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un blog' })
  @ApiResponse({ status: 200, description: 'Blog eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar este blog' })
  @ApiResponse({ status: 404, description: 'Blog no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.blogsService.remove(id, req.user.userId);
  }
}