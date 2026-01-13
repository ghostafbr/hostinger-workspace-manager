/**
 * Email Templates for Domain Renewal Notifications
 *
 * Professional HTML templates with payment options integration
 */

interface RenewalEmailData {
  domainName: string;
  expirationDate: string;
  daysUntilExpiration: number;
  renewalPrice: number; // Total price (backward compatibility)
  hostingRenewalPrice?: number;
  domainRenewalPrice?: number;
  paymentLink?: string;
  bancolombia?: {
    accountType: string;
    accountNumber: string;
    ownerName: string;
    ownerDocument: string;
  };
  nequi?: {
    phoneNumber: string;
    ownerName: string;
  };
}

export function generateRenewalEmailHTML(data: RenewalEmailData): string {
  const {
    domainName,
    expirationDate,
    daysUntilExpiration,
    renewalPrice,
    paymentLink,
    bancolombia,
    nequi,
  } = data;

  const urgencyColor = daysUntilExpiration <= 7 ? '#DC2626' : daysUntilExpiration <= 30 ? '#F59E0B' : '#3B82F6';
  const urgencyText = daysUntilExpiration <= 7 ? '¡URGENTE!' : daysUntilExpiration <= 30 ? 'Atención' : 'Recordatorio';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Renovación de Dominio - ${domainName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}DD 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 700;">
                ${urgencyText} Renovación de Dominio
              </h1>
              <p style="color: #FFFFFF; margin: 10px 0 0; font-size: 16px; opacity: 0.95;">
                Tu dominio está próximo a vencer
              </p>
            </td>
          </tr>

          <!-- Domain Info -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="background-color: #F9FAFB; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; color: #6B7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Dominio
                </p>
                <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: 600;">
                  ${domainName}
                </h2>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td width="50%" style="padding: 16px; background-color: #FEF3C7; border-radius: 8px;">
                    <p style="margin: 0 0 4px; color: #92400E; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Vence en
                    </p>
                    <p style="margin: 0; color: #78350F; font-size: 28px; font-weight: 700;">
                      ${daysUntilExpiration} días
                    </p>
                  </td>
                  <td width="10"></td>
                  <td width="50%" style="padding: 16px; background-color: #DBEAFE; border-radius: 8px;">
                    <p style="margin: 0 0 4px; color: #1E40AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Fecha de vencimiento
                    </p>
                    <p style="margin: 0; color: #1E3A8A; font-size: 18px; font-weight: 600;">
                      ${expirationDate}
                    </p>
                  </td>
                </tr>
              </table>

              <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 4px; margin-bottom: 32px; text-align: left;">
                <p style="margin: 0; color: #1E3A8A; font-size: 14px; line-height: 1.6;">
                  <strong>¿Por qué renovar ahora?</strong><br>
                  Si tu dominio vence, tu sitio web dejará de funcionar y podrías perder el control sobre tu dominio. ¡No dejes que eso suceda!
                </p>
              </div>

              <!-- Servicios Incluidos -->
              <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; border-radius: 4px; margin-bottom: 32px; text-align: left;">
                <h4 style="margin: 0 0 16px; color: #065F46; font-size: 16px; font-weight: 600;">
                  ✨ Servicios Incluidos en tu Renovación
                </h4>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #047857; font-size: 14px; line-height: 2;">
                  <li><strong>Renovación de hosting + dominio</strong></li>
                  <li>Actualizaciones (plugins/tema/core)</li>
                  <li>Backups y verificación básica</li>
                  <li>Revisión mensual rápida</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Payment Options -->
          <tr>
            <td style="padding: 0 30px 40px;">
              <h3 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 24px; text-align: center;">
                Opciones de Pago
              </h3>

              ${data.hostingRenewalPrice || data.domainRenewalPrice ? `
              <!-- Desglose de Precios -->
              <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${data.hostingRenewalPrice ? `
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 16px;">
                      <strong>Hosting:</strong>
                    </td>
                    <td style="padding: 8px 0; text-align: right; color: #059669; font-size: 16px; font-weight: 600;">
                      $${data.hostingRenewalPrice.toLocaleString('es-CO')} COP
                    </td>
                  </tr>
                  ` : ''}
                  ${data.domainRenewalPrice ? `
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 16px;">
                      <strong>Dominio:</strong>
                    </td>
                    <td style="padding: 8px 0; text-align: right; color: #059669; font-size: 16px; font-weight: 600;">
                      $${data.domainRenewalPrice.toLocaleString('es-CO')} COP
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="2" style="padding: 12px 0 8px; border-top: 2px solid #D1D5DB;"></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #111827; font-size: 18px;">
                      <strong>Total:</strong>
                    </td>
                    <td style="padding: 8px 0; text-align: right; color: #059669; font-size: 20px; font-weight: 700;">
                      $${renewalPrice.toLocaleString('es-CO')} COP
                    </td>
                  </tr>
                </table>
              </div>
              ` : `
              <p style="text-align: center; color: #374151; font-size: 18px; font-weight: 600; margin: 0 0 24px;">
                Valor de renovación: <span style="color: #059669;">$${renewalPrice.toLocaleString('es-CO')} COP</span>
              </p>
              `}

              ${paymentLink ? `
              <!-- Wompi Payment Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${paymentLink}" style="display: inline-block; background-color: #8B5CF6; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">
                  💳 Pagar con Tarjeta (Wompi)
                </a>
                <p style="margin: 8px 0 0; color: #6B7280; font-size: 12px;">
                  Pago seguro procesado por Wompi
                </p>
              </div>
              <div style="text-align: center; margin: 24px 0; color: #D1D5DB;">
                ─────── o ───────
              </div>
              ` : ''}

              ${bancolombia ? `
              <!-- Bancolombia Transfer -->
              <div style="background-color: #FEF3C7; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                <h4 style="margin: 0 0 12px; color: #92400E; font-size: 16px; font-weight: 600;">
                  🏦 Transferencia Bancolombia
                </h4>
                <table width="100%" style="color: #78350F; font-size: 14px;">
                  <tr>
                    <td width="40%" style="padding: 4px 0;"><strong>Tipo de cuenta:</strong></td>
                    <td style="padding: 4px 0;">${bancolombia.accountType === 'ahorros' ? 'Ahorros' : 'Corriente'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;"><strong>Número:</strong></td>
                    <td style="padding: 4px 0; font-weight: 600;">${bancolombia.accountNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;"><strong>Titular:</strong></td>
                    <td style="padding: 4px 0;">${bancolombia.ownerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;"><strong>Documento:</strong></td>
                    <td style="padding: 4px 0;">${bancolombia.ownerDocument}</td>
                  </tr>
                </table>
              </div>
              ` : ''}

              ${nequi ? `
              <!-- Nequi Transfer -->
              <div style="background-color: #FCE7F3; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                <h4 style="margin: 0 0 12px; color: #9F1239; font-size: 16px; font-weight: 600;">
                  📱 Transferencia Nequi
                </h4>
                <table width="100%" style="color: #881337; font-size: 14px;">
                  <tr>
                    <td width="40%" style="padding: 4px 0;"><strong>Número:</strong></td>
                    <td style="padding: 4px 0; font-weight: 600;">${nequi.phoneNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;"><strong>Titular:</strong></td>
                    <td style="padding: 4px 0;">${nequi.ownerName}</td>
                  </tr>
                </table>
              </div>
              ` : ''}

              ${bancolombia || nequi ? `
              <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; border-radius: 4px; margin-top: 16px;">
                <p style="margin: 0; color: #991B1B; font-size: 13px; line-height: 1.5;">
                  <strong>Importante:</strong> Después de realizar la transferencia, por favor envía el comprobante de pago por WhatsApp o correo electrónico para confirmar tu renovación.
                </p>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 24px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">
                ¿Necesitas ayuda? Contáctanos
              </p>
              <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 500;">
                📧 afbolanos@andres-bolanos.dev
              </p>
              <p style="margin: 16px 0 0; color: #9CA3AF; font-size: 12px;">
                Este es un correo automático. Por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateRenewalEmailText(data: RenewalEmailData): string {
  const {
    domainName,
    expirationDate,
    daysUntilExpiration,
    renewalPrice,
    paymentLink,
    bancolombia,
    nequi,
  } = data;

  let text = `
RENOVACIÓN DE DOMINIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dominio: ${domainName}
Vence en: ${daysUntilExpiration} días
Fecha de vencimiento: ${expirationDate}

¿Por qué renovar ahora?
Si tu dominio vence, tu sitio web dejará de funcionar y podrías perder el control sobre tu dominio.

✨ SERVICIOS INCLUIDOS EN TU RENOVACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Renovación de hosting + dominio
• Actualizaciones (plugins/tema/core)
• Backups y verificación básica
• Revisión mensual rápida

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPCIONES DE PAGO
${data.hostingRenewalPrice || data.domainRenewalPrice ? `
DESGLOSE:
${data.hostingRenewalPrice ? `- Hosting: $${data.hostingRenewalPrice.toLocaleString('es-CO')} COP\n` : ''}${data.domainRenewalPrice ? `- Dominio: $${data.domainRenewalPrice.toLocaleString('es-CO')} COP\n` : ''}
TOTAL: $${renewalPrice.toLocaleString('es-CO')} COP
` : `Valor de renovación: $${renewalPrice.toLocaleString('es-CO')} COP`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

  if (paymentLink) {
    text += `
💳 PAGAR CON TARJETA (WOMPI)
${paymentLink}

`;
  }

  if (bancolombia) {
    text += `
🏦 TRANSFERENCIA BANCOLOMBIA
Tipo de cuenta: ${bancolombia.accountType === 'ahorros' ? 'Ahorros' : 'Corriente'}
Número: ${bancolombia.accountNumber}
Titular: ${bancolombia.ownerName}
Documento: ${bancolombia.ownerDocument}

`;
  }

  if (nequi) {
    text += `
📱 TRANSFERENCIA NEQUI
Número: ${nequi.phoneNumber}
Titular: ${nequi.ownerName}

`;
  }

  if (bancolombia || nequi) {
    text += `
⚠️ IMPORTANTE: Después de realizar la transferencia, envía el comprobante de pago por WhatsApp o correo electrónico.

`;
  }

  text += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
¿Necesitas ayuda? Contáctanos
📧 afbolanos@andres-bolanos.dev

Este es un correo automático.
  `.trim();

  return text;
}
