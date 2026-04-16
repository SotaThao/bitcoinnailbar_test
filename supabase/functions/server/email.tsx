/**
 * Email Service Helper using Resend API
 * 
 * IMPORTANT: 
 * - Domain 'tnsthao94.online' must be verified in Resend Dashboard
 * - API key must be set in RESEND_API_KEY environment variable
 * - For production, also set RESEND_FROM_EMAIL to override default
 */

export const sendEmail = async (
  to: string, 
  subject: string, 
  html: string,
  from?: string
) => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!apiKey) {
    throw new Error("Email configuration missing (API Key not found)");
  }

  // Use custom from email or fallback to verified domain
  const fromEmail = from 
    || Deno.env.get('RESEND_FROM_EMAIL') 
    || 'Bitcoin Nail Bar <bookings@tnsthao94.online>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to], // Resend API requires array format
      subject: subject,
      html: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw error with detailed message
    const errorMessage = data.message || data.error || 'Failed to send email via Resend';
    throw new Error(`Resend Error (${response.status}): ${errorMessage}`);
  }

  return data;
};

/**
 * Send test email to verify configuration
 */
export const sendTestEmail = async (recipientEmail: string) => {
  return await sendEmail(
    recipientEmail,
    'Test Email - Bitcoin Nail Bar',
    `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background-color: #f8fafc; 
              margin: 0; 
              padding: 40px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 12px; 
              padding: 40px; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { 
              color: #f7931a; 
              margin: 0 0 20px 0; 
            }
            p { 
              color: #333; 
              line-height: 1.6; 
            }
            .success { 
              background: #dcfce7; 
              border-left: 4px solid #16a34a; 
              padding: 16px; 
              margin: 20px 0; 
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Test Successful!</h1>
            <p>Congratulations! Your Resend email configuration is working correctly.</p>
            
            <div class="success">
              <strong>What this means:</strong>
              <ul>
                <li>RESEND_API_KEY is configured ✓</li>
                <li>Domain tnsthao94.online is verified ✓</li>
                <li>Email delivery is functional ✓</li>
              </ul>
            </div>
            
            <p>You can now send booking confirmation emails to your customers.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6b7280;">
              © 2026 Bitcoin Nail Bar. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `
  );
};
