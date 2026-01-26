import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { CreateContactoDto } from './dto/create-contacto.dto';

@Injectable()
export class ContactoService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async enviarContacto(createContactoDto: CreateContactoDto) {
    const { tipoConsulta, nombre, correo, numeroMovil, mensaje } = createContactoDto;

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
            background: #f5f5ef;
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
            background-color: #f5f5ef;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            font-size: 12px;
          }
          .footer a {
            color: #d9b756;
            text-decoration: none;
          }
          .footer p {
            margin: 8px 0;
            color: #003e5c;
          }
          .footer-socials {
            margin: 15px 0;
            text-align: center;
          }
          .social-link {
            display: inline-block;
            width: 20px;
            height: 20px;
            margin: 0 4px;
            background-color: #d9b756;
            border-radius: 50%;
            text-decoration: none;
            padding: 5px;
            transition: background-color 0.3s;
          }
          .social-link:hover {
            background-color: #c7a645;
          }
          .social-link img {
            width: 100%;
            height: 100%;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="https://dalias.pablogutierrezz.com/logo_header.png" alt="Residencia Las Dalias">
            <h1>Nueva Consulta Recibida</h1>
          </div>
          
          <div class="content">
            <div class="info-row">
              <div class="info-label">👤 Nombre Completo</div>
              <div class="info-value">${nombre}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">📧 Correo Electrónico</div>
              <div class="info-value">${correo}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">📱 Número de Móvil</div>
              <div class="info-value">${numeroMovil}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">🎯 ¿Qué servicio le interesa?</div>
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
            
            <div class="footer-socials">
              <a href="https://www.facebook.com/p/Residencia-Las-Dalias-100094992432554/" class="social-link" title="Facebook" target="_blank">
                <img src="https://res.cloudinary.com/dd5mnpde5/image/upload/v1768945481/81341_opqlde.png" alt="Facebook">
              </a>
              <a href="https://www.instagram.com/residencialasdalias" class="social-link" title="Instagram" target="_blank">
                <img src="https://res.cloudinary.com/dd5mnpde5/image/upload/v1768945481/logotipo-de-instagram_fwwxqy.png" alt="Instagram">
              </a>
              <a href="https://www.youtube.com/@ResidenciaLasDalias" class="social-link" title="YouTube" target="_blank">
                <img src="https://res.cloudinary.com/dd5mnpde5/image/upload/v1768945481/youtube_zrp6jo.png" alt="YouTube">
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.resend.emails.send({
      from: 'Residencia Las Dalias <contacto@pablogutierrezz.com>',
      to: ['residencialasdalias156@gmail.com'],
      subject: `📩 Nueva Consulta: ${tipoConsulta}`,
      html: htmlEmail,
    });

    return {
      success: true,
      message: 'Mensaje enviado correctamente',
    };
  }
}