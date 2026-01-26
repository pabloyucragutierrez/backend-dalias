import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';
import { CreateVisitaDto } from './dto/create-visita.dto';

interface ConclusionEvaluacion {
  pregunta: string;
  conclusion: string;
  porcentaje: number;
}

interface PerfilGlobal {
  clasificacion: string;
  porcentajeTotal: number;
  descripcion: string;
}

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
    let perfilGlobalHtml = '';

    if (evaluacion) {
      const conclusiones = this.generarConclusionesEvaluacion(evaluacion);
      const perfilGlobal = this.calcularPerfilGlobal(conclusiones);

      // Generar HTML con las conclusiones
      evaluacionHtml = `
      <div class="evaluacion-section">
        <h3 style="color: #003e5c; margin-top: 30px; margin-bottom: 20px; border-bottom: 3px solid #d9b756; padding-bottom: 10px;">
          📋 Resultados de la Evaluación Inicial
        </h3>
        
        ${conclusiones
          .map(
            (item) => `
          <div class="conclusion-item" style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #d9b756; border-radius: 5px;">
            <div style="color: #003e5c; font-weight: bold; font-size: 14px; margin-bottom: 8px;">
              ${item.pregunta}
            </div>
            <div style="color: #333; font-size: 16px; line-height: 1.6;">
              ${item.conclusion}
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;

      // Generar HTML del perfil global
      perfilGlobalHtml = `
      <div class="perfil-global" style="background: linear-gradient(135deg, #003e5c 0%, #005a7f 100%); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
        <h3 style="color: #d9b756; margin: 0 0 15px 0; font-size: 22px;">
          🎯 Perfil Global del Adulto Mayor
        </h3>
        <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin-top: 15px;">
          <p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #d9b756;">
            ${perfilGlobal.porcentajeTotal}%
          </p>
          <p style="font-size: 20px; font-weight: bold; margin: 10px 0;">
            ${perfilGlobal.clasificacion}
          </p>
          <p style="font-size: 16px; margin: 10px 0; line-height: 1.6;">
            ${perfilGlobal.descripcion}
          </p>
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
          font-size: 26px;
          font-weight: bold;
        }
        .header p {
          color: #003e5c;
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
          background-color: #f5f5ef;
          color: #ffffff;
          text-align: center;
          padding: 20px;
          font-size: 12px;
        }
        .footer p {
          margin: 8px 0;
          color: #003e5c;
        }
        .footer a {
          color: #d9b756;
          text-decoration: none;
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
          
          ${
            observacionesSalud
              ? `
          <div class="info-row">
            <div class="info-label">Observaciones de Salud</div>
            <div class="info-value">${observacionesSalud}</div>
          </div>
          `
              : ''
          }

          <div class="cita-destacada">
            <h3>📅 Fecha y Hora de la Visita</h3>
            <p>📆 ${fechaSeleccionada}</p>
            <p>🕐 ${horaSeleccionada}</p>
          </div>

          ${perfilGlobalHtml}
          ${evaluacionHtml}
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

    // EMAIL PARA EL CLIENTE (confirmación) - AHORA CON RESULTADOS
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
          font-size: 26px;
          font-weight: bold;
        }
        .header p {
          color: #003e5c;
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
          background-color: #f5f5ef;
          color: #ffffff;
          text-align: center;
          padding: 20px;
          font-size: 12px;
        }
        .footer p{
          margin: 8px 0;
          color: #003e5c;
        }
        .footer a {
          color: #d9b756;
          text-decoration: none;
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

          ${perfilGlobalHtml}
          ${evaluacionHtml}

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

    // Enviar correo al administrador
    await this.resend.emails.send({
      from: 'Residencia Las Dalias <visitas@pablogutierrezz.com>',
      to: ['pabloyucragutierrez@gmail.com'],
      subject: `Nueva Solicitud de Visita - ${nombreApellido}`,
      html: htmlEmailAdmin,
    });

    // Enviar correo de confirmación al cliente
    await this.resend.emails.send({
      from: 'Residencia Las Dalias <visitas@pablogutierrezz.com>',
      to: [correoElectronico],
      subject: `✅ Confirmación de Visita - Residencia Las Dalias`,
      html: htmlEmailCliente,
    });

    return {
      success: true,
      message: 'Solicitud de visita enviada correctamente',
    };
  }

  // NUEVO MÉTODO: Generar conclusiones de la evaluación
  private generarConclusionesEvaluacion(
    evaluacion: any,
  ): ConclusionEvaluacion[] {
    const conclusiones: ConclusionEvaluacion[] = [];

    // 1. Autonomía y movilidad
    if (evaluacion.movilidad) {
      const movilidadMap = {
        solo: {
          conclusion:
            '100% - Adulto mayor independiente en movilidad. Bajo riesgo de caídas si el entorno es adecuado.',
          porcentaje: 100,
        },
        'apoyo-parcial': {
          conclusion:
            '70% - Dependencia leve. Puede requerir bastón, andador o supervisión ocasional.',
          porcentaje: 70,
        },
        'ayuda-constante': {
          conclusion:
            '40% - Dependencia moderada. Riesgo alto de caídas, requiere acompañamiento continuo.',
          porcentaje: 40,
        },
        'en-cama': {
          conclusion:
            '10% - Dependencia severa. Riesgo de úlceras, sarcopenia y complicaciones respiratorias.',
          porcentaje: 10,
        },
      };

      const resultado = movilidadMap[evaluacion.movilidad];
      if (resultado) {
        conclusiones.push({
          pregunta: '1. Autonomía y movilidad',
          conclusion: resultado.conclusion,
          porcentaje: resultado.porcentaje,
        });
      }
    }

    // 2. Actividades de la Vida Diaria (AVD)
    if (evaluacion.avd) {
      const avdMap = {
        independiente: {
          conclusion:
            '100% - Funcionalidad conservada. Equivale a Barthel alto.',
          porcentaje: 100,
        },
        supervision: {
          conclusion: '75% - Autonomía parcial. Puede vivir con apoyo leve.',
          porcentaje: 75,
        },
        'ayuda-constante': {
          conclusion: '40% - Dependencia moderada. Necesita cuidador diario.',
          porcentaje: 40,
        },
        'no-puede': {
          conclusion: '10% - Dependencia severa. Requiere cuidado integral.',
          porcentaje: 10,
        },
      };

      const resultado = avdMap[evaluacion.avd];
      if (resultado) {
        conclusiones.push({
          pregunta: '2. Actividades de la Vida Diaria (AVD)',
          conclusion: resultado.conclusion,
          porcentaje: resultado.porcentaje,
        });
      }
    }

    // 3. Estado cognitivo
    if (evaluacion.cognitivo) {
      const cognitivoMap = {
        'sin-dificultades': {
          conclusion: '100% - Cognición conservada. Puede tomar decisiones.',
          porcentaje: 100,
        },
        'olvidos-ocasionales': {
          conclusion:
            '80% - Deterioro cognitivo leve compatible con envejecimiento.',
          porcentaje: 80,
        },
        'confusion-frecuente': {
          conclusion: '40% - Sospecha de deterioro cognitivo moderado.',
          porcentaje: 40,
        },
        'diagnostico-deterioro': {
          conclusion:
            '10% - Dependencia cognitiva. Necesita supervisión permanente.',
          porcentaje: 10,
        },
      };

      const resultado = cognitivoMap[evaluacion.cognitivo];
      if (resultado) {
        conclusiones.push({
          pregunta: '3. Estado cognitivo (orientativo)',
          conclusion: resultado.conclusion,
          porcentaje: resultado.porcentaje,
        });
      }
    }

    // 4. Estado emocional y conducta
    if (evaluacion.emocional) {
      const emocionalMap = {
        estable: {
          conclusion: '100% - Buen ajuste emocional.',
          porcentaje: 100,
        },
        'a-veces-triste': {
          conclusion:
            '75% - Riesgo emocional leve. Recomendable estimulación social.',
          porcentaje: 75,
        },
        irritable: {
          conclusion:
            '40% - Riesgo de depresión geriátrica. Necesita abordaje emocional.',
          porcentaje: 40,
        },
        'cambios-conducta': {
          conclusion:
            '20% - Posible trastorno neuropsiquiátrico. Requiere seguimiento.',
          porcentaje: 20,
        },
      };

      const resultado = emocionalMap[evaluacion.emocional];
      if (resultado) {
        conclusiones.push({
          pregunta: '4. Estado emocional y conducta',
          conclusion: resultado.conclusion,
          porcentaje: resultado.porcentaje,
        });
      }
    }

    // 5. Condiciones médicas relevantes
    if (evaluacion.condiciones) {
      const condicionesTexto: string[] = [];

      if (
        evaluacion.condiciones.hipertension ||
        evaluacion.condiciones.diabetes
      ) {
        condicionesTexto.push('Crónica controlable');
      }
      if (evaluacion.condiciones.postOperatoria) {
        condicionesTexto.push('Dependencia temporal');
      }
      if (evaluacion.condiciones.dificultadesCaminar) {
        condicionesTexto.push('Aumenta dependencia funcional');
      }
      if (evaluacion.condiciones.problemasAudicionVision) {
        condicionesTexto.push('Riesgo de aislamiento');
      }
      if (evaluacion.condiciones.incontinencia) {
        condicionesTexto.push('Aumenta nivel de cuidado');
      }
      if (evaluacion.condiciones.otra) {
        condicionesTexto.push('Evaluación individual');
      }

      if (condicionesTexto.length > 0) {
        conclusiones.push({
          pregunta: '5. Condiciones médicas relevantes',
          conclusion: condicionesTexto.join(', '),
          porcentaje: 0, // No se usa para el cálculo del promedio
        });
      }
    }

    // 6. Medicación y cuidados especiales
    if (evaluacion.medicacion) {
      const medicacionMap = {
        no: {
          conclusion:
            '100% - Adulto mayor autónomo en su tratamiento. Comprende, recuerda y cumple su medicación.',
          porcentaje: 100,
        },
        recordatorio: {
          conclusion:
            '70% - Dependencia leve. Requiere apoyo cognitivo o supervisión puntual.',
          porcentaje: 70,
        },
        'administracion-completa': {
          conclusion:
            '30% - Dependencia moderada–severa. Incapaz de manejar su tratamiento de forma segura.',
          porcentaje: 30,
        },
      };

      const resultado = medicacionMap[evaluacion.medicacion];
      if (resultado) {
        conclusiones.push({
          pregunta: '6. Medicación y cuidados especiales',
          conclusion: resultado.conclusion,
          porcentaje: resultado.porcentaje,
        });
      }
    }

    // 7. Motivo principal de la consulta
    if (evaluacion.motivo) {
      const motivoMap = {
        'centro-dia': {
          conclusion:
            '90% - Adulto mayor mayormente autónomo, busca socialización y prevención.',
          porcentaje: 90,
        },
        'descanso-cuidador': {
          conclusion: '75% - Dependencia leve–moderada o sobrecarga familiar.',
          porcentaje: 75,
        },
        'recuperacion-temporal': {
          conclusion:
            '65% - Dependencia transitoria, con potencial de recuperación.',
          porcentaje: 65,
        },
        'cuidado-permanente': {
          conclusion: '35% - Dependencia moderada–severa establecida.',
          porcentaje: 35,
        },
        otro: {
          conclusion: '50% - Motivo no claro, requiere evaluación individual.',
          porcentaje: 50,
        },
      };

      const resultado = motivoMap[evaluacion.motivo];
      if (resultado) {
        conclusiones.push({
          pregunta: '7. Motivo principal de la consulta',
          conclusion: resultado.conclusion,
          porcentaje: resultado.porcentaje,
        });
      }
    }

    return conclusiones;
  }

  // NUEVO MÉTODO: Calcular perfil global
  private calcularPerfilGlobal(
    conclusiones: ConclusionEvaluacion[],
  ): PerfilGlobal {
    // Filtrar solo las conclusiones que tienen porcentaje válido (excluir condiciones médicas)
    const conclusionesConPorcentaje = conclusiones.filter(
      (c) => c.porcentaje > 0,
    );

    if (conclusionesConPorcentaje.length === 0) {
      return {
        clasificacion: 'No evaluado',
        porcentajeTotal: 0,
        descripcion: 'No se pudo calcular el perfil.',
      };
    }

    // Calcular promedio
    const sumaPorcentajes = conclusionesConPorcentaje.reduce(
      (sum, c) => sum + c.porcentaje,
      0,
    );
    const porcentajeTotal = Math.round(
      sumaPorcentajes / conclusionesConPorcentaje.length,
    );

    // Determinar clasificación según el porcentaje
    let clasificacion = '';
    let descripcion = '';

    if (porcentajeTotal >= 80) {
      clasificacion = 'Independiente';
      descripcion =
        'El adulto mayor presenta un alto grado de autonomía. Requiere mínimo apoyo y puede desenvolverse con independencia en la mayoría de actividades.';
    } else if (porcentajeTotal >= 60) {
      clasificacion = 'Dependencia leve';
      descripcion =
        'El adulto mayor mantiene buena autonomía con necesidades puntuales de apoyo. Puede vivir de forma semi-independiente con supervisión ocasional.';
    } else if (porcentajeTotal >= 40) {
      clasificacion = 'Dependencia moderada';
      descripcion =
        'El adulto mayor requiere asistencia regular en diversas actividades diarias. Necesita acompañamiento y cuidados especializados frecuentes.';
    } else {
      clasificacion = 'Dependencia severa';
      descripcion =
        'El adulto mayor necesita cuidado integral y supervisión permanente. Requiere atención especializada continua para garantizar su bienestar y seguridad.';
    }

    return {
      clasificacion,
      porcentajeTotal,
      descripcion,
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
      independiente: 'Independiente',
      'semi-dependiente': 'Semi dependiente',
      dependiente: 'Dependiente',
    };
    return niveles[nivel] || nivel;
  }
  private formatearRespuesta(valor: string): string {
    if (!valor) return 'No especificado';
    const respuestas = {
      // Movilidad
      solo: 'Se moviliza solo',
      'apoyo-parcial': 'Necesita apoyo parcial',
      'ayuda-constante': 'Requiere ayuda constante',
      'en-cama': 'Permanece mayormente en cama',

      // AVD
      independiente: 'De forma independiente',
      supervision: 'Con supervisión',
      'no-puede': 'No puede realizarlas solo',

      // Cognitivo
      'sin-dificultades': 'No presenta dificultades',
      'olvidos-ocasionales': 'Olvidos ocasionales',
      'confusion-frecuente': 'Confusión frecuente',
      'diagnostico-deterioro': 'Diagnóstico de deterioro cognitivo o demencia',

      // Emocional
      estable: 'Estable y tranquilo',
      'a-veces-triste': 'A veces triste o ansioso',
      irritable: 'Frecuentemente irritable o deprimido',
      'cambios-conducta': 'Presenta cambios de conducta importantes',

      // Medicación
      no: 'No',
      recordatorio: 'Sí, recordatorio',
      'administracion-completa': 'Sí, administración completa',

      // Motivo
      'cuidado-permanente': 'Cuidado permanente',
      'recuperacion-temporal': 'Recuperación temporal / post operatoria',
      'centro-dia': 'Centro de día',
      'descanso-cuidador': 'Descanso del cuidador',
      otro: 'Otro',
    };

    return respuestas[valor] || valor;
  }
}
