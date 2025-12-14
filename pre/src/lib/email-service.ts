import * as nodemailer from 'nodemailer';

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  name?: string;
}

let etherealTransporter: nodemailer.Transporter | null = null;

async function createEtherealAccount() {
  const testAccount = await nodemailer.createTestAccount();
  etherealTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return testAccount;
}

export async function sendEmail(config: EmailConfig): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> {
  const emailProvider = process.env.EMAIL_PROVIDER || 'console';

  try {
    switch (emailProvider) {
      case 'console':
        console.log('=== EMAIL SENT (CONSOLE MODE) ===');
        console.log('To:', config.to);
        console.log('Subject:', config.subject);
        console.log('Content:', config.html);
        console.log('================================');
        return { success: true, messageId: 'console-' + Date.now() };

      case 'ethereal':
        if (!etherealTransporter) {
          const testAccount = await createEtherealAccount();
          console.log('Ethereal test account created:', testAccount.user);
        }

        if (!etherealTransporter) {
          throw new Error('Failed to create Ethereal transporter');
        }

        const info = await etherealTransporter.sendMail({
          from: '"Precision Academic World" <noreply@precisionaw.com>',
          to: config.to,
          subject: config.subject,
          html: config.html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        console.log('Email sent via Ethereal:', previewUrl);
        
        return { 
          success: true, 
          messageId: info.messageId, 
          previewUrl 
        };

      case 'gmail':
        const gmailTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        const gmailInfo = await gmailTransporter.sendMail({
          from: process.env.GMAIL_USER,
          to: config.to,
          subject: config.subject,
          html: config.html,
        });

        return { success: true, messageId: gmailInfo.messageId };

      default:
        throw new Error(`Unsupported email provider: ${emailProvider}`);
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function sendVerificationEmail(email: string, otp: string, name?: string): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> {
  const subject = 'Verify Your Email - Precision Academic World';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Precision Academic World</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Email Verification</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0 0 15px 0;">Hello ${name || 'there'}!</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
            Thank you for signing up with Precision Academic World. To complete your registration, 
            please use the verification code below:
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; min-width: 200px;">
            ${otp}
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
            This code will expire in 10 minutes. If you didn't request this verification, 
            please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            © 2025 Precision Academic World. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html, name });
} 