import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './dto/create-contacto.dto';

@ApiTags('contacto')
@Controller('contacto')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar formulario de contacto' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async enviarContacto(@Body() createContactoDto: CreateContactoDto) {
    return this.contactoService.enviarContacto(createContactoDto);
  }
}