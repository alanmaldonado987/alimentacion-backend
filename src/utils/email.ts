import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const loadTemplate = (templateName: string): string => {
  const templatePath = join(process.cwd(), 'src', 'templates', templateName);
  return readFileSync(templatePath, 'utf-8');
};

export interface SendPatientCredentialsParams {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  cedula: string;
}

export const sendPatientCredentialsEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  cedula,
}: SendPatientCredentialsParams): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Email will not be sent.');
    return;
  }

  const replaceVariables = (template: string): string => {
    return template
      .replace(/{{patientName}}/g, patientName)
      .replace(/{{doctorName}}/g, doctorName)
      .replace(/{{patientEmail}}/g, patientEmail)
      .replace(/{{cedula}}/g, cedula)
      .replace(/{{frontendUrl}}/g, process.env.FRONTEND_URL || 'http://localhost:5173')
      .replace(/{{currentYear}}/g, new Date().getFullYear().toString());
  };

  const htmlTemplate = replaceVariables(loadTemplate('patient-credentials.html'));
  const textContent = replaceVariables(loadTemplate('patient-credentials.txt'));

  const mailOptions = {
    from: `"NutriPlan" <${process.env.SMTP_USER}>`,
    to: patientEmail,
    replyTo: process.env.SMTP_USER,
    subject: `NutriPlan - Cuenta creada por ${doctorName}`,
    text: textContent,
    html: htmlTemplate.trim(),
    headers: {
      'X-Mailer': 'NutriPlan',
      'X-Priority': '1',
      'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
      'Message-ID': `<${Date.now()}-${Math.random().toString(36).substring(7)}@nutriplan>`,
      'Date': new Date().toUTCString(),
      'MIME-Version': '1.0',
      'Content-Type': 'text/html; charset=UTF-8',
    },
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error al enviar el correo');
  }
};

