import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CreateContactoDto } from './dto/create-contacto.dto';

@Injectable()
export class ContactoService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // Cambiar de puerto
  secure: true, // true para puerto 465
  auth: {
    user: this.configService.get<string>('EMAIL_USER'),
    pass: this.configService.get<string>('EMAIL_PASSWORD'),
  },
  tls: {
    rejectUnauthorized: false
  }
});
  }

  async enviarContacto(createContactoDto: CreateContactoDto) {
    const { tipoConsulta, nombre, mensaje } = createContactoDto;

    const htmlEmail = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #003e5c 0%, #005a7f 100%);
            padding: 30px 20px;
            text-align: center;
          }
          .header img {
            max-width: 150px;
            height: auto;
            margin-bottom: 15px;
          }
          .header h1 {
            color: #d9b756;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 30px 25px;
          }
          .info-row {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #d9b756;
            border-radius: 5px;
          }
          .info-label {
            color: #003e5c;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .info-value {
            color: #333;
            font-size: 16px;
            line-height: 1.6;
          }
          .mensaje-box {
            background-color: #aed3da;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .footer {
            background-color: #003e5c;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            font-size: 12px;
          }
          .footer a {
            color: #d9b756;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="https://dalias.pablogutierrezz.com/logo_header2.png" alt="Residencia Las Dalias">
            <h1>Nueva Consulta Recibida</h1>
          </div>
          
          <div class="content">
            <div class="info-row">
              <div class="info-label">👤 Nombre Completo</div>
              <div class="info-value">${nombre}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">🎯 Servicio de Interés</div>
              <div class="info-value">${tipoConsulta}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">💬 Mensaje</div>
              <div class="mensaje-box">
                <div class="info-value">${mensaje}</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Residencia Las Dalias</strong></p>
            <p>Las Dalias 156, La Molina 15024, Perú</p>
            <p>📧 <a href="mailto:residencialasdalias156@gmail.com">residencialasdalias156@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"Residencia Las Dalias" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: 'pabloyucragutierrez@gmail.com',
      subject: `📩 Nueva Consulta: ${tipoConsulta}`,
      html: htmlEmail,
    });

    return {
      success: true,
      message: 'Mensaje enviado correctamente',
    };
  }
}