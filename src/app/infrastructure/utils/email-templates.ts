/**
 * Email Template Generator
 *
 * Generates responsive HTML email templates for different notification types
 */

import type { IEmailTemplateData } from '@app/domain';

/**
 * Base email template with responsive styles
 */
const baseEmailTemplate = (content: string, preheader: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Hostinger Workspace Manager</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100%; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }

    /* Container styles */
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .email-header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .email-body { padding: 40px 30px; }
    .email-footer { background-color: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #6c757d; }

    /* Content styles */
    .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .alert-box.danger { background-color: #f8d7da; border-left-color: #dc3545; }
    .alert-box.success { background-color: #d4edda; border-left-color: #28a745; }
    .alert-box.info { background-color: #d1ecf1; border-left-color: #17a2b8; }

    .alert-title { font-size: 20px; font-weight: 600; margin: 0 0 10px 0; color: #212529; }
    .alert-message { font-size: 16px; line-height: 1.6; color: #495057; margin: 0; }

    .info-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
    .info-table tr { border-bottom: 1px solid #e9ecef; }
    .info-table td { padding: 12px 0; font-size: 15px; }
    .info-table td:first-child { font-weight: 600; color: #495057; width: 40%; }
    .info-table td:last-child { color: #212529; }

    .btn { display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .btn:hover { background-color: #5568d3; }

    .preheader { display: none; max-height: 0; overflow: hidden; }

    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-body { padding: 30px 20px !important; }
      .email-header h1 { font-size: 24px !important; }
      .btn { padding: 12px 24px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 20px 0;">
        <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0">
          <!-- Header -->
          <tr>
            <td class="email-header">
              <h1>🔔 Hostinger Workspace Manager</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer">
              <p style="margin: 0 0 10px 0;">Este es un mensaje automático. Por favor no responder.</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Hostinger Workspace Manager. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Generate domain expiration email template
 */
export const generateDomainExpiringEmail = (data: IEmailTemplateData): string => {
  const alertType = data.daysRemaining <= 7 ? 'danger' : data.daysRemaining <= 30 ? 'alert-box' : 'info';

  const content = `
    <div class="alert-box ${alertType}">
      <h2 class="alert-title">⚠️ Dominio próximo a vencer</h2>
      <p class="alert-message">
        El dominio <strong>${data.entityName}</strong> en el workspace <strong>${data.workspaceName}</strong>
        vencerá en <strong>${data.daysRemaining} día${data.daysRemaining !== 1 ? 's' : ''}</strong>.
      </p>
    </div>

    <table class="info-table">
      <tr>
        <td>Workspace:</td>
        <td><strong>${data.workspaceName}</strong></td>
      </tr>
      <tr>
        <td>Dominio:</td>
        <td><strong>${data.entityName}</strong></td>
      </tr>
      <tr>
        <td>Días restantes:</td>
        <td><strong style="color: ${data.daysRemaining <= 7 ? '#dc3545' : data.daysRemaining <= 30 ? '#ffc107' : '#28a745'};">${data.daysRemaining}</strong></td>
      </tr>
      <tr>
        <td>Fecha de vencimiento:</td>
        <td><strong>${data.expirationDate}</strong></td>
      </tr>
    </table>

    <p style="font-size: 15px; line-height: 1.6; color: #495057; margin: 20px 0;">
      Te recomendamos renovar el dominio lo antes posible para evitar interrupciones en tu servicio.
    </p>

    <div style="text-align: center;">
      <a href="${data.dashboardUrl}" class="btn">Ver Dashboard</a>
    </div>

    <p style="font-size: 14px; color: #6c757d; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
      <strong>Acciones recomendadas:</strong><br>
      • Verificar métodos de pago activos<br>
      • Renovar el dominio antes del vencimiento<br>
      • Actualizar información de contacto si es necesario
    </p>
  `;

  const preheader = `El dominio ${data.entityName} vence en ${data.daysRemaining} días`;

  return baseEmailTemplate(content, preheader);
};

/**
 * Generate subscription expiration email template
 */
export const generateSubscriptionExpiringEmail = (data: IEmailTemplateData): string => {
  const alertType = data.daysRemaining <= 7 ? 'danger' : data.daysRemaining <= 30 ? 'alert-box' : 'info';

  const content = `
    <div class="alert-box ${alertType}">
      <h2 class="alert-title">⚠️ Suscripción próxima a vencer</h2>
      <p class="alert-message">
        La suscripción <strong>${data.entityName}</strong> en el workspace <strong>${data.workspaceName}</strong>
        vencerá en <strong>${data.daysRemaining} día${data.daysRemaining !== 1 ? 's' : ''}</strong>.
      </p>
    </div>

    <table class="info-table">
      <tr>
        <td>Workspace:</td>
        <td><strong>${data.workspaceName}</strong></td>
      </tr>
      <tr>
        <td>Suscripción:</td>
        <td><strong>${data.entityName}</strong></td>
      </tr>
      <tr>
        <td>Días restantes:</td>
        <td><strong style="color: ${data.daysRemaining <= 7 ? '#dc3545' : data.daysRemaining <= 30 ? '#ffc107' : '#28a745'};">${data.daysRemaining}</strong></td>
      </tr>
      <tr>
        <td>Fecha de vencimiento:</td>
        <td><strong>${data.expirationDate}</strong></td>
      </tr>
    </table>

    <p style="font-size: 15px; line-height: 1.6; color: #495057; margin: 20px 0;">
      Asegúrate de renovar tu suscripción para mantener activos todos tus servicios de hosting.
    </p>

    <div style="text-align: center;">
      <a href="${data.dashboardUrl}" class="btn">Ver Dashboard</a>
    </div>

    <p style="font-size: 14px; color: #6c757d; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
      <strong>Servicios que podrían verse afectados:</strong><br>
      • Hosting web<br>
      • Bases de datos<br>
      • Correo electrónico<br>
      • Certificados SSL
    </p>
  `;

  const preheader = `La suscripción ${data.entityName} vence en ${data.daysRemaining} días`;

  return baseEmailTemplate(content, preheader);
};

/**
 * Generate health alert email template
 */
export const generateHealthAlertEmail = (data: IEmailTemplateData): string => {
  const content = `
    <div class="alert-box danger">
      <h2 class="alert-title">🚨 Alerta de Salud del Sistema</h2>
      <p class="alert-message">
        Se ha detectado un problema en el workspace <strong>${data.workspaceName}</strong>.
      </p>
    </div>

    <table class="info-table">
      <tr>
        <td>Workspace:</td>
        <td><strong>${data.workspaceName}</strong></td>
      </tr>
      <tr>
        <td>Tipo de alerta:</td>
        <td><strong>${data.entityName}</strong></td>
      </tr>
      <tr>
        <td>Severidad:</td>
        <td><strong style="color: #dc3545;">ALTA</strong></td>
      </tr>
    </table>

    <p style="font-size: 15px; line-height: 1.6; color: #495057; margin: 20px 0;">
      Revisa el panel de salud del sistema para obtener más detalles sobre este problema.
    </p>

    <div style="text-align: center;">
      <a href="${data.dashboardUrl}" class="btn">Ver Panel de Salud</a>
    </div>
  `;

  const preheader = `Alerta de salud: ${data.entityName}`;

  return baseEmailTemplate(content, preheader);
};

/**
 * Generate plain text version of email
 */
export const generatePlainTextEmail = (data: IEmailTemplateData, type: 'domain' | 'subscription' | 'health'): string => {
  const header = '='.repeat(60);

  if (type === 'domain') {
    return `
${header}
HOSTINGER WORKSPACE MANAGER - ALERTA DE DOMINIO
${header}

Dominio próximo a vencer

Workspace: ${data.workspaceName}
Dominio: ${data.entityName}
Días restantes: ${data.daysRemaining}
Fecha de vencimiento: ${data.expirationDate}

Te recomendamos renovar el dominio lo antes posible para evitar
interrupciones en tu servicio.

Ver dashboard: ${data.dashboardUrl}

${header}
Este es un mensaje automático. Por favor no responder.
© ${new Date().getFullYear()} Hostinger Workspace Manager
    `.trim();
  }

  if (type === 'subscription') {
    return `
${header}
HOSTINGER WORKSPACE MANAGER - ALERTA DE SUSCRIPCIÓN
${header}

Suscripción próxima a vencer

Workspace: ${data.workspaceName}
Suscripción: ${data.entityName}
Días restantes: ${data.daysRemaining}
Fecha de vencimiento: ${data.expirationDate}

Asegúrate de renovar tu suscripción para mantener activos todos
tus servicios de hosting.

Ver dashboard: ${data.dashboardUrl}

${header}
Este es un mensaje automático. Por favor no responder.
© ${new Date().getFullYear()} Hostinger Workspace Manager
    `.trim();
  }

  // Health alert
  return `
${header}
HOSTINGER WORKSPACE MANAGER - ALERTA DE SALUD
${header}

Alerta de Salud del Sistema

Workspace: ${data.workspaceName}
Tipo de alerta: ${data.entityName}
Severidad: ALTA

Revisa el panel de salud del sistema para obtener más detalles.

Ver panel de salud: ${data.dashboardUrl}

${header}
Este es un mensaje automático. Por favor no responder.
© ${new Date().getFullYear()} Hostinger Workspace Manager
  `.trim();
};
