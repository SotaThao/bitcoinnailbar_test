/**
 * Email Templates for Bitcoin Nail Bar
 * 
 * Extracted from inline code to avoid deployment parsing issues
 * with large HTML/CSS template strings
 */

export interface BookingConfirmationParams {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentId: string;
  displayServices: string;
  formattedTime: string;
  qrCodeUrl?: string;
}

/**
 * Generate booking confirmation email HTML
 */
export function generateBookingConfirmationEmail(params: BookingConfirmationParams): string {
  const { customerName, customerEmail, customerPhone, appointmentId, displayServices, formattedTime, qrCodeUrl } = params;
  
  const shortId = appointmentId.split(':')[1].substring(0, 8).toUpperCase();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>Booking Confirmed - Bitcoin Nail Bar</title>
  <style>
    :root { color-scheme: light only; supported-color-schemes: light; }
    body { background-color: #f8fafc !important; }
    .email-container { background-color: #ffffff !important; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #f8fafc !important; }
      .email-container { background-color: #ffffff !important; }
      [data-ogsc] .email-container { background-color: #ffffff !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc !important;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc !important;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff !important; border-radius: 0; overflow: hidden;">
          <tr>
            <td style="padding: 40px 32px 0 32px; background-color: #ffffff !important;">
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td>
                    <p style="font-size: 16px; line-height: 24px; color: #45556c !important; margin: 0 0 8px 0;">
                      Hello <strong style="color: #0f172b !important;">${customerName}</strong>,
                    </p>
                    <p style="font-size: 16px; line-height: 24px; color: #45556c !important; margin: 0;">
                      Thank you for booking! We're excited to see you at Bitcoin Nail Bar.
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin-bottom: 32px; background: #f8fafc !important; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
                <tr>
                  <td style="padding: 25px; background-color: #f8fafc !important;">
                    <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                      <tr>
                        <td>
                          <p style="font-size: 20px; font-weight: bold; line-height: 30px; color: #0f172b !important; margin: 0;">
                            Appointment Details
                          </p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" style="width: 100%; margin-bottom: 12px;">
                      <tr>
                        <td style="vertical-align: top;">
                          <p style="font-size: 16px; font-weight: bold; line-height: 24px; color: #0f172b !important; margin: 0 0 2px 0;">
                            ${displayServices}
                          </p>
                          <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                            Bitcoin Nail Bar - Houston, TX
                          </p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="vertical-align: top;">
                          <p style="font-size: 16px; line-height: 24px; color: #0f172b !important; margin: 0 0 2px 0;">
                            Date & Time
                          </p>
                          <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                            ${formattedTime}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td>
                    <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                      <tr>
                        <td>
                          <p style="font-size: 20px; font-weight: bold; line-height: 30px; color: #0f172b !important; margin: 0;">
                            Your Booking
                          </p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" style="width: 100%; background-color: #ffffff !important; border: 2px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
                      <tr>
                        <td style="background: linear-gradient(135.223deg, #0B0F19 0%, #1d293d 100%) !important; padding: 32px; text-align: center; vertical-align: middle; width: 258px;">
                          ${qrCodeUrl ? 
                            `<div style="background-color: #ffffff; border-radius: 10px; padding: 16px; display: inline-block; box-shadow: inset 0px 2px 4px 0px rgba(0,0,0,0.05);">
                              <img src="${qrCodeUrl}" width="160" height="160" alt="Check-in QR Code" style="display: block;" />
                            </div>` : 
                            '<div style="width: 192px; height: 192px; background-color: #f1f5f9; border-radius: 10px;"></div>'}
                        </td>
                        <td style="padding: 24px; vertical-align: top; background-color: #ffffff !important;">
                          <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                            <tr>
                              <td style="vertical-align: top;">
                                <p style="font-size: 12px; line-height: 16px; color: #62748e !important; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 4px 0;">
                                  Booking ID
                                </p>
                                <div style="background-color: #f1f5f9 !important; border: 1px solid #cad5e2; border-radius: 10px; padding: 8px 13px;">
                                  <p style="font-family: Consolas, monospace; font-size: 16px; line-height: 24px; color: #0f172b !important; letter-spacing: 0.8px; margin: 0;">
                                    ${shortId}
                                  </p>
                                </div>
                              </td>
                              <td style="text-align: right; vertical-align: top;">
                                <div style="background-color: #dcfce7 !important; border-radius: 999px; padding: 4px 12px; display: inline-block;">
                                  <p style="font-size: 12px; line-height: 16px; color: #016630 !important; margin: 0;">
                                    Active
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table role="presentation" style="width: 100%; border-top: 1px solid #e2e8f0; padding-top: 17px;">
                            <tr>
                              <td style="padding-bottom: 12px;">
                                <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                                  <span style="color: #90A1B9; margin-right: 4px;">Name:</span> ${customerName}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 12px;">
                                <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                                  <span style="color: #90A1B9; margin-right: 4px;">Phone:</span> ${customerPhone}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                                  <span style="color: #90A1B9; margin-right: 4px;">Email:</span> ${customerEmail}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin-bottom: 32px; background-color: #fffbeb !important; border-left: 4px solid #FF9800; border-radius: 0 10px 10px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 20px 20px 24px; background-color: #fffbeb !important;">
                    <p style="font-size: 18px; font-weight: bold; line-height: 27px; color: #7b3306 !important; margin: 0 0 8px 0;">
                      Important Check-in Information
                    </p>
                    <ul style="margin: 0; padding: 0; list-style: none;">
                      <li style="font-size: 14px; line-height: 20px; color: #973c00 !important; margin-bottom: 4px;">
                        • Please present this QR code at the reception desk
                      </li>
                      <li style="font-size: 14px; line-height: 20px; color: #973c00 !important; margin-bottom: 4px;">
                        • You can save this email or screenshot the QR code
                      </li>
                      <li style="font-size: 14px; line-height: 20px; color: #973c00 !important; margin-bottom: 4px;">
                        • Arrive 5-10 minutes before your appointment
                      </li>
                      <li style="font-size: 14px; line-height: 20px; color: #973c00 !important;">
                        • One QR code = One booking entry
                      </li>
                    </ul>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin-bottom: 32px; background: #FF9800 !important; border-radius: 14px; padding: 24px; text-align: center;">
                <tr>
                  <td style="background-color: #FF9800 !important;">
                    <p style="font-size: 16px; line-height: 24px; color: #ffffff !important; margin: 0 0 12px 0;">
                      Need help or want to reschedule?
                    </p>
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="background-color: #ffffff !important; border-radius: 10px; padding: 12px 32px;">
                          <a href="tel:+18327993990" style="font-size: 16px; font-weight: bold; line-height: 24px; color: #FF9800 !important; text-decoration: none;">
                            Call Us: (832) 799-3990
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 14px; line-height: 20px; color: #ffffff !important; margin: 12px 0 0 0;">
                      9793 Westheimer Rd, Houston, TX 77042
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 40px 32px; border-top: 1px solid #e2e8f0; background-color: #ffffff !important;">
              <table role="presentation" style="width: 100%; padding-top: 33px;">
                <tr>
                  <td style="text-align: center;">
                    <p style="font-size: 14px; line-height: 20px; color: #62748e !important; margin: 0 0 8px 0;">
                      Questions? Contact our support team
                    </p>
                    <p style="font-size: 12px; line-height: 16px; color: #90a1b9 !important; margin: 0;">
                      © 2026 Bitcoin Nail Bar. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
