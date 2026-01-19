import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';
import { CreateVisitaDto } from './dto/create-visita.dto';

@Injectable()
export class VisitasService {
  private resend: Resend;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async agendarVisita(createVisitaDto: CreateVisitaDto) {
    const {
      nombreApellido,
      correoElectronico,
      edadAdultoMayor,
      nivelDependencia,
      observacionesSalud,
      fechaSeleccionada,
      horaSeleccionada,
      evaluacion,
    } = createVisitaDto;

    // Verificar si ya existe una cita en esa fecha y hora
    const citaExistente = await this.prisma.visita.findUnique({
      where: {
        fechaSeleccionada_horaSeleccionada: {
          fechaSeleccionada,
          horaSeleccionada,
        },
      },
    });

    if (citaExistente) {
      throw new ConflictException(
        'Lo sentimos, esa fecha y hora ya está reservada. Por favor, selecciona otro horario.',
      );
    }

    // Guardar la cita en la base de datos
    await this.prisma.visita.create({
      data: {
        nombreApellido,
        correoElectronico,
        edadAdultoMayor,
        nivelDependencia,
        observacionesSalud,
        fechaSeleccionada,
        horaSeleccionada,
        evaluacion: evaluacion ? JSON.parse(JSON.stringify(evaluacion)) : null,
        estado: 'pendiente',
      },
    });

    // Generar HTML de evaluación si existe
    let evaluacionHtml = '';
    if (evaluacion) {
      const condiciones = [];
      if (evaluacion.condiciones) {
        if (evaluacion.condiciones.hipertension) condiciones.push('Hipertensión');
        if (evaluacion.condiciones.diabetes) condiciones.push('Diabetes');
        if (evaluacion.condiciones.dificultadesCaminar) condiciones.push('Dificultades para caminar');
        if (evaluacion.condiciones.incontinencia) condiciones.push('Incontinencia');
        if (evaluacion.condiciones.problemasAudicionVision) condiciones.push('Problemas de audición o visión');
        if (evaluacion.condiciones.postOperatoria) condiciones.push('Recuperación post operatoria');
        if (evaluacion.condiciones.otra) condiciones.push('Otra');
      }

      evaluacionHtml = `
        <div class="evaluacion-section">
          <h3 style="color: #003e5c; margin-top: 30px; margin-bottom: 20px; border-bottom: 3px solid #d9b756; padding-bottom: 10px;">
            📋 Evaluación Inicial del Adulto Mayor
          </h3>
          
          <div class="info-row">
            <div class="info-label">1. Autonomía y movilidad</div>
            <div class="info-value">${this.formatearRespuesta(evaluacion.movilidad)}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">2. Actividades de la vida diaria (AVD)</div>
            <div class="info-value">${this.formatearRespuesta(evaluacion.avd)}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">3. Estado cognitivo</div>
            <div class="info-value">${this.formatearRespuesta(evaluacion.cognitivo)}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">4. Estado emocional y conducta</div>
            <div class="info-value">${this.formatearRespuesta(evaluacion.emocional)}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">5. Condiciones médicas relevantes</div>
            <div class="info-value">${condiciones.length > 0 ? condiciones.join(', ') : 'No especificadas'}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">6. Medicación y cuidados especiales</div>
            <div class="info-value">${this.formatearRespuesta(evaluacion.medicacion)}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">7. Motivo principal de la consulta</div>
            <div class="info-value">${this.formatearRespuesta(evaluacion.motivo)}</div>
          </div>
        </div>
      `;
    }

    // EMAIL PARA LA RESIDENCIA (administrador)
    const htmlEmailAdmin = `
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
            max-width: 650px;
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
            font-size: 26px;
            font-weight: bold;
          }
          .header p {
            color: #aed3da;
            margin: 10px 0 0 0;
            font-size: 14px;
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
          .cita-destacada {
            background: linear-gradient(135deg, #d9b756 0%, #c9a746 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
          }
          .cita-destacada h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
          }
          .cita-destacada p {
            margin: 5px 0;
            font-size: 20px;
            font-weight: bold;
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
            <h1>🗓️ Nueva Solicitud de Visita</h1>
            <p>Se ha recibido una nueva solicitud para agendar una visita</p>
          </div>
          
          <div class="content">
            <h3 style="color: #003e5c; margin-bottom: 20px; border-bottom: 3px solid #d9b756; padding-bottom: 10px;">
              👤 Información del Solicitante
            </h3>
            
            <div class="info-row">
              <div class="info-label">Nombre y Apellido</div>
              <div class="info-value">${nombreApellido}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Correo Electrónico</div>
              <div class="info-value">${correoElectronico}</div>
            </div>

            <h3 style="color: #003e5c; margin-top: 30px; margin-bottom: 20px; border-bottom: 3px solid #d9b756; padding-bottom: 10px;">
              👴 Información del Adulto Mayor
            </h3>
            
            <div class="info-row">
              <div class="info-label">Edad</div>
              <div class="info-value">${edadAdultoMayor} años</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Nivel de Dependencia</div>
              <div class="info-value">${this.formatearDependencia(nivelDependencia)}</div>
            </div>
            
            ${observacionesSalud ? `
            <div class="info-row">
              <div class="info-label">Observaciones de Salud</div>
              <div class="info-value">${observacionesSalud}</div>
            </div>
            ` : ''}

            <div class="cita-destacada">
              <h3>📅 Fecha y Hora de la Visita</h3>
              <p>📆 ${fechaSeleccionada}</p>
              <p>🕐 ${horaSeleccionada}</p>
            </div>

            ${evaluacionHtml}
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

    // EMAIL PARA EL CLIENTE (confirmación)
    const htmlEmailCliente = `
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
            max-width: 650px;
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
            font-size: 26px;
            font-weight: bold;
          }
          .header p {
            color: #aed3da;
            margin: 10px 0 0 0;
            font-size: 14px;
          }
          .content {
            padding: 30px 25px;
          }
          .saludo {
            color: #003e5c;
            font-size: 18px;
            margin-bottom: 20px;
          }
          .mensaje-confirmacion {
            background-color: #e8f5f7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #d9b756;
            margin-bottom: 25px;
          }
          .mensaje-confirmacion p {
            color: #333;
            line-height: 1.8;
            margin: 10px 0;
          }
          .cita-destacada {
            background: linear-gradient(135deg, #d9b756 0%, #c9a746 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
          }
          .cita-destacada h3 {
            margin: 0 0 15px 0;
            font-size: 20px;
          }
          .cita-info {
            background-color: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
          }
          .cita-info p {
            margin: 8px 0;
            font-size: 18px;
            font-weight: bold;
          }
          .info-adicional {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .info-adicional h4 {
            color: #003e5c;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .info-adicional ul {
            color: #333;
            line-height: 1.8;
            padding-left: 20px;
          }
          .contacto-box {
            background-color: #aed3da;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
          }
          .contacto-box h4 {
            color: #003e5c;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .contacto-box p {
            color: #333;
            margin: 5px 0;
          }
          .contacto-box a {
            color: #003e5c;
            text-decoration: none;
            font-weight: bold;
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
            <h1>✅ Visita Confirmada</h1>
            <p>Hemos recibido tu solicitud exitosamente</p>
          </div>
          
          <div class="content">
            <p class="saludo">Estimado/a <strong>${nombreApellido}</strong>,</p>
            
            <div class="mensaje-confirmacion">
              <p>¡Gracias por confiar en <strong>Residencia Las Dalias</strong>!</p>
              <p>Hemos recibido tu solicitud de visita y confirmamos que está agendada para la siguiente fecha:</p>
            </div>

            <div class="cita-destacada">
              <h3>📅 Detalles de tu Visita</h3>
              <div class="cita-info">
                <p>📆 Fecha: ${fechaSeleccionada}</p>
                <p>🕐 Hora: ${horaSeleccionada}</p>
              </div>
            </div>

            <div class="info-adicional">
              <h4>📍 Información importante para tu visita:</h4>
              <ul>
                <li><strong>Dirección:</strong> Las Dalias 156, La Molina 15024, Perú</li>
                <li>Por favor, llega 10 minutos antes de tu cita</li>
                <li>Trae cualquier documento médico relevante que desees compartir</li>
                <li>Si necesitas reprogramar, contáctanos con al menos 24 horas de anticipación</li>
              </ul>
            </div>

            <div class="contacto-box">
              <h4>¿Tienes alguna pregunta?</h4>
              <p>📧 Email: <a href="mailto:residencialasdalias156@gmail.com">residencialasdalias156@gmail.com</a></p>
              <p>Estamos aquí para ayudarte en lo que necesites</p>
            </div>

            <p style="color: #666; margin-top: 25px; text-align: center;">
              Nos vemos pronto. ¡Esperamos conocerte!
            </p>
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

    // Enviar correo al administrador
    await this.resend.emails.send({
      from: 'Residencia Las Dalias <visitas@pablogutierrezz.com>',
      to: ['pabloyucragutierrez@gmail.com'],
      subject: `Nueva Solicitud de Visita - ${nombreApellido}`,
      html: htmlEmailAdmin,
    });

    // Enviar correo de confirmación al cliente
    await this.resend.emails.send({
      from: 'Residencia Las Dalias <onboarding@resend.dev>', // Cambia esto cuando verifiques tu dominio
      to: [correoElectronico],
      subject: `✅ Confirmación de Visita - Residencia Las Dalias`,
      html: htmlEmailCliente,
    });

    return {
      success: true,
      message: 'Solicitud de visita enviada correctamente',
    };
  }

  async verificarDisponibilidad(fecha: string, hora: string) {
    const citaExistente = await this.prisma.visita.findUnique({
      where: {
        fechaSeleccionada_horaSeleccionada: {
          fechaSeleccionada: fecha,
          horaSeleccionada: hora,
        },
      },
    });

    return {
      disponible: !citaExistente,
    };
  }

  async obtenerHorasOcupadas(fecha: string) {
    const citas = await this.prisma.visita.findMany({
      where: {
        fechaSeleccionada: fecha,
      },
      select: {
        horaSeleccionada: true,
      },
    });

    return {
      horasOcupadas: citas.map((cita) => cita.horaSeleccionada),
    };
  }

  private formatearDependencia(nivel: string): string {
    const niveles = {
      'independiente': 'Independiente',
      'semi-dependiente': 'Semi dependiente',
      'dependiente': 'Dependiente',
    };
    return niveles[nivel] || nivel;
  }

  private formatearRespuesta(valor: string): string {
    if (!valor) return 'No especificado';
    
    const respuestas = {
      // Movilidad
      'solo': 'Se moviliza solo',
      'apoyo-parcial': 'Necesita apoyo parcial',
      'ayuda-constante-movilidad': 'Requiere ayuda constante',
      'en-cama': 'Permanece mayormente en cama',
      
      // AVD
      'independiente': 'De forma independiente',
      'supervision': 'Con supervisión',
      'ayuda-constante': 'Con ayuda constante',
      'no-puede': 'No puede realizarlas solo',
      
      // Cognitivo
      'sin-dificultades': 'No presenta dificultades',
      'olvidos-ocasionales': 'Olvidos ocasionales',
      'confusion-frecuente': 'Confusión frecuente',
      'diagnostico-deterioro': 'Diagnóstico de deterioro cognitivo o demencia',
      
      // Emocional
      'estable': 'Estable y tranquilo',
      'a-veces-triste': 'A veces triste o ansioso',
      'irritable': 'Frecuentemente irritable o deprimido',
      'cambios-conducta': 'Presenta cambios de conducta importantes',
      
      // Medicación
      'no': 'No',
      'recordatorio': 'Sí, recordatorio',
      'administracion-completa': 'Sí, administración completa',
      
      // Motivo
      'cuidado-permanente': 'Cuidado permanente',
      'recuperacion-temporal': 'Recuperación temporal / post operatoria',
      'centro-dia': 'Centro de día',
      'descanso-cuidador': 'Descanso del cuidador',
      'otro': 'Otro',
    };
    
    return respuestas[valor] || valor;
  }
}